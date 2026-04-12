"use client";

import { motion } from "motion/react";

export function BrandLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background bounding box for industrial rigidity */}
      <rect x="2" y="2" width="28" height="28" rx="6" fill="currentColor" fillOpacity="0.05" />
      <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
      
      {/* Base Rigid Pipe Grid (Structural) */}
      <path d="M8 24V14C8 10.6863 10.6863 8 14 8H24" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 24V18C16 16.8954 16.8954 16 18 16H24" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
      
      {/* Main Flow Line 1 */}
      <motion.path 
        d="M8 24V14C8 10.6863 10.6863 8 14 8H24" 
        stroke="#0066FF" 
        strokeWidth="3" 
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Main Flow Line 2 */}
      <motion.path 
        d="M16 24V18C16 16.8954 16.8954 16 18 16H24" 
        stroke="#00CCFF" 
        strokeWidth="3" 
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      
      {/* Cybernetic Nodes */}
      <circle cx="24" cy="8" r="2.5" fill="#0066FF" />
      <circle cx="24" cy="16" r="2.5" fill="#00CCFF" />
    </svg>
  );
}
