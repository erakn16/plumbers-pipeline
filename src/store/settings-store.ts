"use client";

import { create } from "zustand";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type TeamRole = "owner" | "admin" | "manager" | "viewer";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "active" | "pending" | "removed";
  inviteToken?: string;
  inviteExpiry?: string; // ISO date
  password?: string; // Only set after account creation
};

export type Session = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
};

export type BackupEntry = {
  id: string;
  date: string;
  size: string;
  type: "auto" | "manual";
};

export type NotificationPrefs = {
  emailJobAssigned: boolean;
  emailInvoicePaid: boolean;
  emailEstimateAccepted: boolean;
  emailOverdue: boolean;
  emailWeeklyDigest: boolean;
  pushNewJob: boolean;
  pushPayment: boolean;
  pushReminders: boolean;
  inAppActivity: boolean;
  inAppMentions: boolean;
  inAppSystem: boolean;
};

export type AppearancePrefs = {
  theme: "light" | "dark" | "system";
  density: "comfortable" | "compact";
  sidebarDefault: "expanded" | "collapsed";
  animationsEnabled: boolean;
};

export type DiscountOption = {
  id: string;
  label: string;
  value: number;
};

export type SetupPrefs = {
  naming: {
    estimatePrefix: string;
    jobPrefix: string;
    invoicePrefix: string;
  };
  counters: {
    estimate: number;
    job: number;
    invoice: number;
  };
  discountOptions: DiscountOption[];
  paymentOptions: string[];
  workerRoles: string[];
  lineItemTypes: string[];
  defaultJobNote: string;
};

interface SettingsState {
  // Current account context
  _accountId: string | null;

  // Profile
  profile: {
    name: string;
    email: string;
    phone: string;
    timezone: string;
    language: string;
    avatarUrl: string | null;
  };
  updateProfile: (updates: Partial<SettingsState["profile"]>) => void;

  // Security - passwords stored per user
  passwords: Record<string, string>; // email -> password
  twoFAEnabled: boolean;
  twoFASecret: string | null;
  sessions: Session[];
  setPassword: (email: string, password: string) => void;
  getPassword: (email: string) => string | undefined;
  setTwoFA: (enabled: boolean, secret?: string | null) => void;
  revokeSession: (id: string) => void;

  // Notifications
  notifications: NotificationPrefs;
  updateNotifications: (updates: Partial<NotificationPrefs>) => void;

  // Appearance
  appearance: AppearancePrefs;
  updateAppearance: (updates: Partial<AppearancePrefs>) => void;

  // Setup (Naming, Defaults)
  setup: SetupPrefs;
  updateSetup: (updates: Partial<SetupPrefs>) => void;
  getNextNumber: (type: "estimate" | "job" | "invoice") => string;

  // Team
  teamMembers: TeamMember[];
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  getTeamMemberByEmail: (email: string) => TeamMember | undefined;
  getTeamMemberByToken: (token: string) => TeamMember | undefined;

  // Data
  apiKey: string;
  autoBackup: boolean;
  backups: BackupEntry[];
  regenerateApiKey: () => void;
  setAutoBackup: (enabled: boolean) => void;
  addBackup: (entry: BackupEntry) => void;

  // Initialization
  initializeForAccount: (accountId: string, ownerEmail: string, ownerName: string, isTestAccount: boolean) => void;
}

function generateApiKey(): string {
  const chars = "abcdef0123456789";
  let key = "pp_live_sk_";
  for (let i = 0; i < 32; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 48; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export { generateToken };

function getStorageKey(accountId: string) {
  return `pp_settings_${accountId}`;
}

function loadFromStorage(accountId: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(getStorageKey(accountId));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveToStorage(accountId: string, state: SettingsState) {
  try {
    const data = {
      profile: state.profile,
      passwords: state.passwords,
      twoFAEnabled: state.twoFAEnabled,
      twoFASecret: state.twoFASecret,
      sessions: state.sessions,
      notifications: state.notifications,
      appearance: state.appearance,
      setup: state.setup,
      teamMembers: state.teamMembers,
      apiKey: state.apiKey,
      autoBackup: state.autoBackup,
      backups: state.backups,
    };
    localStorage.setItem(getStorageKey(accountId), JSON.stringify(data));
  } catch { /* ignore */ }
}

function defaultProfile(email: string, name: string) {
  return {
    name,
    email,
    phone: "",
    timezone: "America/New_York",
    language: "en-US",
    avatarUrl: null,
  };
}

function defaultNotifications(): NotificationPrefs {
  return {
    emailJobAssigned: true,
    emailInvoicePaid: true,
    emailEstimateAccepted: true,
    emailOverdue: true,
    emailWeeklyDigest: false,
    pushNewJob: true,
    pushPayment: true,
    pushReminders: false,
    inAppActivity: true,
    inAppMentions: true,
    inAppSystem: true,
  };
}

function defaultAppearance(): AppearancePrefs {
  return {
    theme: "light",
    density: "comfortable",
    sidebarDefault: "expanded",
    animationsEnabled: true,
  };
}

function defaultSetup(): SetupPrefs {
  return {
    naming: {
      estimatePrefix: "EST-",
      jobPrefix: "WO-",
      invoicePrefix: "INV-",
    },
    counters: {
      estimate: 1,
      job: 1,
      invoice: 1,
    },
    discountOptions: [
      { id: "disc_01", label: "Private/Residential", value: 0 },
      { id: "disc_02", label: "Commercial/Business", value: 6 },
      { id: "disc_03", label: "VIP/Military", value: 10 },
    ],
    paymentOptions: ["Credit Card", "ACH", "Check", "Net 14", "Net 30", "Net 45", "Net 60", "Due on Receipt"],
    workerRoles: [
      "Master Plumber",
      "Journeyman Plumber",
      "Lead Technician",
      "Senior Technician",
      "Technician",
      "Apprentice",
      "Dispatcher / Office Manager",
      "Estimator",
    ],
    lineItemTypes: ["Labor", "Materials", "Equipment", "Subcontractor", "Permit/Fee", "Other"],
    defaultJobNote: "The final price may be within +/-10% of the Estimated Cost to account for miscellaneous costs, subject to change.",
  };
}

function testAccountDefaults(email: string, name: string) {
  return {
    profile: {
      name,
      email,
      phone: "+1 (404) 555-0100",
      timezone: "America/New_York",
      language: "en-US",
      avatarUrl: null,
    },
    passwords: {
      "test@example.com": "12345678",
      "manager@plumberspipeline.com": "12345678",
      "viewer@plumberspipeline.com": "12345678",
    } as Record<string, string>,
    teamMembers: [
      { id: "usr_admin_01", name: "Test Admin", email: "test@example.com", role: "owner" as TeamRole, status: "active" as const, password: "12345678" },
      { id: "usr_mgr_01", name: "Sofia Patel", email: "manager@plumberspipeline.com", role: "manager" as TeamRole, status: "active" as const, password: "12345678" },
      { id: "usr_viewer_01", name: "Marcus Bell", email: "viewer@plumberspipeline.com", role: "viewer" as TeamRole, status: "active" as const, password: "12345678" },
      { id: "usr_mgr_02", name: "Nadia Volkov", email: "nadia.v@plumberspipeline.com", role: "manager" as TeamRole, status: "active" as const, password: "12345678" },
    ] as TeamMember[],
    sessions: [
      { id: "sess_1", device: "Chrome on Windows", location: "Atlanta, GA", lastActive: "Now", current: true },
      { id: "sess_2", device: "Safari on iPhone 15", location: "Atlanta, GA", lastActive: "2 hours ago", current: false },
      { id: "sess_3", device: "Firefox on MacBook", location: "Decatur, GA", lastActive: "3 days ago", current: false },
    ] as Session[],
    backups: [
      { id: "bk_1", date: "2026-04-11T06:00:00Z", size: "2.4 MB", type: "auto" as const },
      { id: "bk_2", date: "2026-04-10T06:00:00Z", size: "2.3 MB", type: "auto" as const },
    ] as BackupEntry[],
  };
}

// Helper to persist after any mutation
function withPersist(set: (fn: (s: SettingsState) => Partial<SettingsState>) => void, get: () => SettingsState) {
  return (fn: (s: SettingsState) => Partial<SettingsState>) => {
    set((s) => {
      const result = fn(s);
      const newState = { ...s, ...result };
      if (newState._accountId) {
        setTimeout(() => saveToStorage(newState._accountId!, newState as SettingsState), 0);
      }
      return result;
    });
  };
}

export const useSettingsStore = create<SettingsState>((rawSet, get) => {
  const set = withPersist(rawSet, get);

  return {
    _accountId: null,

    // ─── Profile ────────────────────────────────────────────────────────
    profile: defaultProfile("", ""),
    updateProfile: (updates) =>
      set((s) => ({ profile: { ...s.profile, ...updates } })),

    // ─── Security ───────────────────────────────────────────────────────
    passwords: {},
    twoFAEnabled: false,
    twoFASecret: null,
    sessions: [],
    setPassword: (email, password) =>
      set((s) => {
        // Update the passwords map
        const newPasswords = { ...s.passwords, [email.toLowerCase()]: password };
        // Also update the teamMember's password field to stay in sync
        const newMembers = s.teamMembers.map((m) =>
          m.email.toLowerCase() === email.toLowerCase()
            ? { ...m, password }
            : m
        );
        return { passwords: newPasswords, teamMembers: newMembers };
      }),
    getPassword: (email) => get().passwords[email.toLowerCase()],
    setTwoFA: (enabled, secret) =>
      set(() => ({ twoFAEnabled: enabled, twoFASecret: secret ?? null })),
    revokeSession: (id) =>
      set((s) => ({ sessions: s.sessions.filter((sess) => sess.id !== id) })),

    // ─── Notifications ─────────────────────────────────────────────────
    notifications: defaultNotifications(),
    updateNotifications: (updates) =>
      set((s) => ({ notifications: { ...s.notifications, ...updates } })),

    // ─── Appearance ─────────────────────────────────────────────────────
    appearance: defaultAppearance(),
    updateAppearance: (updates) =>
      set((s) => ({ appearance: { ...s.appearance, ...updates } })),

    // ─── Setup ──────────────────────────────────────────────────────────
    setup: defaultSetup(),
    updateSetup: (updates) =>
      set((s) => ({ setup: { ...s.setup, ...updates } })),
    getNextNumber: (type) => {
      const state = get();
      const prefixMap = { estimate: state.setup.naming.estimatePrefix, job: state.setup.naming.jobPrefix, invoice: state.setup.naming.invoicePrefix };
      const counters = state.setup.counters || { estimate: 1, job: 1, invoice: 1 };
      const current = counters[type] || 1;
      const prefix = prefixMap[type] || "";
      const formatted = `${prefix}${current.toString().padStart(4, '0')}`;
      // Increment counter
      const newCounters = { ...counters, [type]: current + 1 };
      rawSet({ setup: { ...state.setup, counters: newCounters } });
      if (state._accountId) {
        setTimeout(() => saveToStorage(state._accountId!, { ...state, setup: { ...state.setup, counters: newCounters } } as SettingsState), 0);
      }
      return formatted;
    },

    // ─── Team ───────────────────────────────────────────────────────────
    teamMembers: [],
    addTeamMember: (member) =>
      set((s) => ({ teamMembers: [...s.teamMembers, member] })),
    updateTeamMember: (id, updates) =>
      set((s) => ({
        teamMembers: s.teamMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      })),
    removeTeamMember: (id) =>
      set((s) => ({
        teamMembers: s.teamMembers.map((m) =>
          m.id === id ? { ...m, status: "removed" as const } : m
        ),
      })),
    getTeamMemberByEmail: (email) =>
      get().teamMembers.find((m) => m.email.toLowerCase() === email.toLowerCase() && m.status !== "removed"),
    getTeamMemberByToken: (token) =>
      get().teamMembers.find((m) => m.inviteToken === token && m.status === "pending"),

    // ─── Data ───────────────────────────────────────────────────────────
    apiKey: generateApiKey(),
    autoBackup: true,
    backups: [],
    regenerateApiKey: () => set(() => ({ apiKey: generateApiKey() })),
    setAutoBackup: (enabled) => set(() => ({ autoBackup: enabled })),
    addBackup: (entry) =>
      set((s) => ({ backups: [entry, ...s.backups] })),

    // ─── Initialization ─────────────────────────────────────────────────
    initializeForAccount: (accountId, ownerEmail, ownerName, isTestAccount) => {
      const current = get()._accountId;
      if (current === accountId) return; // Already initialized

      // Try to load from localStorage
      const stored = loadFromStorage(accountId);
      if (stored && stored.profile) {
        rawSet({
          _accountId: accountId,
          profile: stored.profile as SettingsState["profile"],
          passwords: (stored.passwords || {}) as Record<string, string>,
          twoFAEnabled: stored.twoFAEnabled as boolean || false,
          twoFASecret: (stored.twoFASecret as string) || null,
          sessions: (stored.sessions || []) as Session[],
          notifications: (stored.notifications || defaultNotifications()) as NotificationPrefs,
          appearance: (stored.appearance || defaultAppearance()) as AppearancePrefs,
          setup: (stored.setup || defaultSetup()) as SetupPrefs,
          teamMembers: (stored.teamMembers || []) as TeamMember[],
          apiKey: (stored.apiKey as string) || generateApiKey(),
          autoBackup: stored.autoBackup !== undefined ? stored.autoBackup as boolean : true,
          backups: (stored.backups || []) as BackupEntry[],
        });
        return;
      }

      // No stored data -- create fresh settings
      if (isTestAccount) {
        const defaults = testAccountDefaults(ownerEmail, ownerName);
        const newState = {
          _accountId: accountId,
          profile: defaults.profile,
          passwords: defaults.passwords,
          twoFAEnabled: false,
          twoFASecret: null,
          sessions: defaults.sessions,
          notifications: defaultNotifications(),
          appearance: defaultAppearance(),
          setup: defaultSetup(),
          teamMembers: defaults.teamMembers,
          apiKey: generateApiKey(),
          autoBackup: true,
          backups: defaults.backups,
        };
        rawSet(newState);
        saveToStorage(accountId, { ...get(), ...newState } as SettingsState);
      } else {
        // Fresh account -- empty settings with owner as the sole team member
        const ownerId = accountId;
        const newState = {
          _accountId: accountId,
          profile: defaultProfile(ownerEmail, ownerName),
          passwords: { [ownerEmail.toLowerCase()]: "" } as Record<string, string>,
          twoFAEnabled: false,
          twoFASecret: null,
          sessions: [
            { id: "sess_" + Date.now(), device: "Current browser", location: "Unknown", lastActive: "Now", current: true },
          ],
          notifications: defaultNotifications(),
          appearance: defaultAppearance(),
          setup: defaultSetup(),
          teamMembers: [
            { id: ownerId, name: ownerName, email: ownerEmail, role: "owner" as TeamRole, status: "active" as const },
          ] as TeamMember[],
          apiKey: generateApiKey(),
          autoBackup: true,
          backups: [],
        };
        rawSet(newState);
        saveToStorage(accountId, { ...get(), ...newState } as SettingsState);
      }
    },
  };
});
