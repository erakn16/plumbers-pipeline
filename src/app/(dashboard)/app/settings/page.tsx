"use client";

import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Shield, User, Bell, Palette, Database, Key } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and application preferences." />

      {/* Profile Section */}
      <div className="border border-border bg-card rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl uppercase shrink-0">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-2">
              <StatusBadge status={user?.role === "admin" ? "active" : user?.role === "manager" ? "scheduled" : "lead"} className="capitalize" />
              <span className="text-xs text-muted-foreground ml-2 capitalize">{user?.role} Role</span>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-secondary transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsCard icon={<User className="w-5 h-5" />} title="Account" description="Update your name, email, and contact information." />
        <SettingsCard icon={<Key className="w-5 h-5" />} title="Security" description="Change your password and enable two-factor authentication." />
        <SettingsCard icon={<Bell className="w-5 h-5" />} title="Notifications" description="Configure email and push notification preferences." />
        <SettingsCard icon={<Palette className="w-5 h-5" />} title="Appearance" description="Switch between light and dark mode, customize theme." />
        <SettingsCard icon={<Shield className="w-5 h-5" />} title="Team & Permissions" description="Manage team members and role-based access." />
        <SettingsCard icon={<Database className="w-5 h-5" />} title="Data & Export" description="Export your data or manage backup settings." />
      </div>

      <div className="text-center text-xs text-muted-foreground py-4">
        Plumbers Pipeline v1.0.0 - Demo Mode
      </div>
    </div>
  );
}

function SettingsCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <button className="border border-border bg-card rounded-xl p-5 text-left hover:bg-secondary/30 hover:border-primary/20 transition-all group">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-secondary rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
}
