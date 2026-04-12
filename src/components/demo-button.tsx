"use client";

import { useAuth } from "@/components/auth-provider";
import { Loader2, Play } from "lucide-react";

export function DemoButton({ className }: { className?: string }) {
  const { demoLogin, isLoading } = useAuth();
  
  return (
    <button
      onClick={() => demoLogin()}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Play className="mr-2 h-5 w-5" />
      )}
      Try Demo
    </button>
  );
}
