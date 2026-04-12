"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "owner" | "admin" | "manager" | "viewer";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountId: string; // The account namespace this user belongs to
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (name: string, email: string, password: string, inviteToken?: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  resetPassword: (email: string, newPassword: string) => { success: boolean; error?: string };
  // Role permissions
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canAccessSettings: boolean;
  canExport: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for "Try Demo" flow
const DEMO_USER: User = {
  id: "usr_demo",
  name: "Demo Admin",
  email: "demo@plumberspipeline.com",
  role: "admin",
  accountId: "usr_demo",
};

// Test account constant
const TEST_ACCOUNT_ID = "usr_admin_01";
const TEST_ACCOUNT_EMAIL = "test@example.com";

// ─── Account Registry ──────────────────────────────────────────────────────────
// Stores mapping from email -> { accountId, ownerName }
// Persisted in localStorage as "pp_accounts"

type AccountEntry = {
  accountId: string;
  ownerName: string;
  ownerEmail: string;
};

function getAccountRegistry(): Record<string, AccountEntry> {
  try {
    const raw = localStorage.getItem("pp_accounts");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveAccountRegistry(registry: Record<string, AccountEntry>) {
  localStorage.setItem("pp_accounts", JSON.stringify(registry));
}

function findAccountByEmail(email: string): { accountEntry: AccountEntry; settingsData: Record<string, unknown> } | null {
  const registry = getAccountRegistry();

  // Check if this email owns an account
  const lowerEmail = email.toLowerCase();
  if (registry[lowerEmail]) {
    const entry = registry[lowerEmail];
    const settings = loadSettingsForAccount(entry.accountId);
    if (settings) return { accountEntry: entry, settingsData: settings };
  }

  // Check if this email is a team member on any account
  for (const entry of Object.values(registry)) {
    const settings = loadSettingsForAccount(entry.accountId);
    if (settings && settings.teamMembers) {
      const members = settings.teamMembers as Array<{ email: string; status: string }>;
      const member = members.find(
        (m) => m.email.toLowerCase() === lowerEmail && m.status !== "removed"
      );
      if (member) {
        return { accountEntry: entry, settingsData: settings };
      }
    }
  }

  return null;
}

function loadSettingsForAccount(accountId: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(`pp_settings_${accountId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

// Ensure test account is always in the registry
function ensureTestAccountInRegistry() {
  const registry = getAccountRegistry();
  if (!registry[TEST_ACCOUNT_EMAIL]) {
    registry[TEST_ACCOUNT_EMAIL] = {
      accountId: TEST_ACCOUNT_ID,
      ownerName: "Test Admin",
      ownerEmail: TEST_ACCOUNT_EMAIL,
    };
    saveAccountRegistry(registry);
  }
}

// ─── Migrate legacy data ────────────────────────────────────────────────────────
// If old "pp_settings" key exists (from before per-account), migrate it
function migrateLegacyData() {
  try {
    const oldSettings = localStorage.getItem("pp_settings");
    if (!oldSettings) return;

    // Check if it's the old zustand persist format
    const parsed = JSON.parse(oldSettings);
    const state = parsed?.state;
    if (!state) return;

    // Migrate to the test account namespace
    const testSettingsKey = `pp_settings_${TEST_ACCOUNT_ID}`;
    if (!localStorage.getItem(testSettingsKey)) {
      // Convert from zustand persist format to plain format
      localStorage.setItem(testSettingsKey, JSON.stringify(state));
    }

    // Clean up old key
    localStorage.removeItem("pp_settings");
  } catch { /* ignore */ }
}

function getRolePermissions(role: UserRole) {
  switch (role) {
    case "owner":
      return { canCreate: true, canEdit: true, canDelete: true, canManageTeam: true, canAccessSettings: true, canExport: true };
    case "admin":
      return { canCreate: true, canEdit: true, canDelete: true, canManageTeam: true, canAccessSettings: true, canExport: true };
    case "manager":
      return { canCreate: true, canEdit: true, canDelete: false, canManageTeam: false, canAccessSettings: false, canExport: true };
    case "viewer":
      return { canCreate: false, canEdit: false, canDelete: false, canManageTeam: false, canAccessSettings: false, canExport: false };
    default:
      return { canCreate: false, canEdit: false, canDelete: false, canManageTeam: false, canAccessSettings: false, canExport: false };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Run migrations on first load
    migrateLegacyData();
    ensureTestAccountInRegistry();

    const sessionStr = sessionStorage.getItem("plumbers_pipeline_user");
    const localStr = localStorage.getItem("plumbers_pipeline_user");
    
    let storedUser = sessionStr;
    
    if (!storedUser && localStr) {
      try {
        const parsedLocal = JSON.parse(localStr);
        if (parsedLocal.id === "usr_demo") {
          localStorage.removeItem("plumbers_pipeline_user");
          storedUser = null;
        } else {
          storedUser = localStr;
        }
      } catch {
        localStorage.removeItem("plumbers_pipeline_user");
      }
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (!parsed.accountId) {
          parsed.accountId = TEST_ACCOUNT_ID;
          localStorage.setItem("plumbers_pipeline_user", JSON.stringify(parsed));
        }
        setUser(parsed);
      } catch {
        localStorage.removeItem("plumbers_pipeline_user");
        sessionStorage.removeItem("plumbers_pipeline_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lowerEmail = email.toLowerCase();

    // Find the account this email belongs to
    const found = findAccountByEmail(lowerEmail);

    if (found) {
      const { accountEntry, settingsData } = found;
      const members = (settingsData.teamMembers || []) as Array<{
        id: string; name: string; email: string; role: UserRole; status: string; password?: string;
      }>;
      const passwords = (settingsData.passwords || {}) as Record<string, string>;

      const member = members.find(
        (m) => m.email.toLowerCase() === lowerEmail
      );

      if (member) {
        // Check if member is removed
        if (member.status === "removed") {
          setIsLoading(false);
          return { success: false, error: "Your access to this account has been revoked. Contact the account owner for a new invitation." };
        }

        // Check if still pending
        if (member.status === "pending") {
          setIsLoading(false);
          return { success: false, error: "Your account has not been set up yet. Please use the invite link sent to your email." };
        }

        // Validate password -- check passwords map first, then member.password as fallback
        const storedPassword = passwords[lowerEmail] || member.password;
        if (storedPassword && storedPassword !== password) {
          setIsLoading(false);
          return { success: false, error: "Invalid email or password." };
        }

        const loggedInUser: User = {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          accountId: accountEntry.accountId,
        };

        setUser(loggedInUser);
        localStorage.setItem("plumbers_pipeline_user", JSON.stringify(loggedInUser));
        setIsLoading(false);
        router.push("/app");
        return { success: true };
      }
    }

    setIsLoading(false);
    return { success: false, error: "Invalid email or password." };
  }, [router]);

  const signup = useCallback(async (name: string, email: string, password: string, inviteToken?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lowerEmail = email.toLowerCase();

    // If invite token provided, find the account with this pending invite
    if (inviteToken) {
      const registry = getAccountRegistry();
      for (const entry of Object.values(registry)) {
        const settings = loadSettingsForAccount(entry.accountId);
        if (!settings) continue;
        const members = (settings.teamMembers || []) as Array<{
          id: string; name: string; email: string; role: UserRole; status: string;
          inviteToken?: string; inviteExpiry?: string; password?: string;
        }>;

        const member = members.find(
          (m) => m.inviteToken === inviteToken && m.status === "pending"
        );

        if (member) {
          // Check expiry
          if (member.inviteExpiry && new Date(member.inviteExpiry) < new Date()) {
            setIsLoading(false);
            return { success: false, error: "This invitation has expired. Ask the account owner to send a new invite." };
          }

          // Activate the member
          const newUser: User = {
            id: member.id,
            name,
            email: member.email,
            role: member.role,
            accountId: entry.accountId,
          };

          // Update settings in localStorage directly
          const idx = members.findIndex((m) => m.id === member.id);
          if (idx >= 0) {
            members[idx].name = name;
            members[idx].status = "active";
            members[idx].password = password;
            members[idx].inviteToken = undefined;
          }
          const passwords = (settings.passwords || {}) as Record<string, string>;
          passwords[member.email.toLowerCase()] = password;
          settings.teamMembers = members;
          settings.passwords = passwords;
          localStorage.setItem(`pp_settings_${entry.accountId}`, JSON.stringify(settings));

          setUser(newUser);
          localStorage.setItem("plumbers_pipeline_user", JSON.stringify(newUser));
          setIsLoading(false);
          router.push("/app");
          return { success: true };
        }
      }

      setIsLoading(false);
      return { success: false, error: "This invitation is invalid or has already been used." };
    }

    // Normal signup -- create a new account (no duplicate checks for now during testing)
    const newAccountId = "usr_" + Math.random().toString(36).substring(2, 9);

    const newUser: User = {
      id: newAccountId,
      name,
      email,
      role: "owner",
      accountId: newAccountId,
    };

    // Register the new account
    const registry = getAccountRegistry();
    registry[lowerEmail] = {
      accountId: newAccountId,
      ownerName: name,
      ownerEmail: email,
    };
    saveAccountRegistry(registry);

    // Create initial settings for the new account
    const initialSettings = {
      profile: {
        name,
        email,
        phone: "",
        timezone: "America/New_York",
        language: "en-US",
        avatarUrl: null,
      },
      passwords: { [lowerEmail]: password },
      twoFAEnabled: false,
      twoFASecret: null,
      sessions: [
        { id: "sess_" + Date.now(), device: "Current browser", location: "Unknown", lastActive: "Now", current: true },
      ],
      notifications: {
        emailJobAssigned: true, emailInvoicePaid: true, emailEstimateAccepted: true,
        emailOverdue: true, emailWeeklyDigest: false, pushNewJob: true, pushPayment: true,
        pushReminders: false, inAppActivity: true, inAppMentions: true, inAppSystem: true,
      },
      appearance: { theme: "light", density: "comfortable", sidebarDefault: "expanded", animationsEnabled: true },
      teamMembers: [
        { id: newAccountId, name, email, role: "owner", status: "active", password },
      ],
      apiKey: "pp_live_sk_" + Math.random().toString(16).substring(2, 34),
      autoBackup: true,
      backups: [],
    };
    localStorage.setItem(`pp_settings_${newAccountId}`, JSON.stringify(initialSettings));

    // Create empty CRM data for the new account
    const emptyCRM = {
      clients: [], jobs: [], workers: [], invoices: [], estimates: [], activity: [],
    };
    localStorage.setItem(`pp_crm_${newAccountId}`, JSON.stringify(emptyCRM));

    setUser(newUser);
    localStorage.setItem("plumbers_pipeline_user", JSON.stringify(newUser));
    setIsLoading(false);
    router.push("/app");
    return { success: true };
  }, [router]);

  const demoLogin = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    // Wipe any existing demo data to ensure a fresh start
    localStorage.removeItem("pp_crm_usr_demo");
    localStorage.removeItem("pp_settings_usr_demo");
    
    setUser(DEMO_USER);
    sessionStorage.setItem("plumbers_pipeline_user", JSON.stringify(DEMO_USER));
    localStorage.removeItem("plumbers_pipeline_user");
    
    setIsLoading(false);
    router.push("/app");
  }, [router]);

  const logout = useCallback(() => {
    if (user?.id === "usr_demo") {
      localStorage.removeItem("pp_crm_usr_demo");
      localStorage.removeItem("pp_settings_usr_demo");
    }
    setUser(null);
    localStorage.removeItem("plumbers_pipeline_user");
    sessionStorage.removeItem("plumbers_pipeline_user");
    router.push("/");
  }, [router, user]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("plumbers_pipeline_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetPassword = useCallback((email: string, newPassword: string): { success: boolean; error?: string } => {
    const lowerEmail = email.toLowerCase();

    // Find the account this email belongs to
    const found = findAccountByEmail(lowerEmail);
    if (!found) {
      return { success: false, error: "No account found with this email address." };
    }

    const { accountEntry, settingsData } = found;
    const members = (settingsData.teamMembers || []) as Array<{
      id: string; email: string; password?: string; status: string;
    }>;
    const passwords = (settingsData.passwords || {}) as Record<string, string>;

    // Find the member
    const member = members.find(
      (m) => m.email.toLowerCase() === lowerEmail && m.status === "active"
    );

    if (!member) {
      return { success: false, error: "No active account found with this email address." };
    }

    // Update password in both places
    passwords[lowerEmail] = newPassword;
    member.password = newPassword;
    settingsData.passwords = passwords;
    settingsData.teamMembers = members;

    // Save back to localStorage
    localStorage.setItem(`pp_settings_${accountEntry.accountId}`, JSON.stringify(settingsData));

    return { success: true };
  }, []);

  const isDemo = user?.id === "usr_demo";
  const permissions = user ? getRolePermissions(user.role) : getRolePermissions("viewer");

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemo,
        login,
        logout,
        signup,
        demoLogin,
        updateUser,
        resetPassword,
        ...permissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
