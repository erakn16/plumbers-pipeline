import React from "react";

export function PipelineVector() {
  return (
    <div className="w-full h-full relative aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden group border border-border shadow-inner bg-zinc-50 dark:bg-zinc-950">
      
      {/* 
        The SVG incorporates the background rooms natively.
        This guarantees perfect alignment with the pipes regardless of responsive CSS stretching.
      */}
      <svg viewBox="0 0 400 400" className="w-full h-full absolute inset-0 drop-shadow-xl" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid meet">
        
        {/* ---- BACKGROUND ROOMS ---- */}
        <g stroke="none">
          {/* Top Room */}
          <rect x="25" y="25" width="350" height="155" rx="4" className="fill-[#8FB5DF]/70 dark:fill-[#72A2D6]/40 transition-colors duration-500 group-hover:fill-[#8FB5DF] dark:group-hover:fill-[#72A2D6]/60" />
          
          {/* Bottom Left Room */}
          <rect x="25" y="195" width="135" height="180" rx="4" className="fill-[#8FB5DF]/70 dark:fill-[#72A2D6]/40 transition-colors duration-500 group-hover:fill-[#8FB5DF] dark:group-hover:fill-[#72A2D6]/60" />
          
          {/* Bottom Right Room */}
          <rect x="175" y="195" width="200" height="180" rx="4" className="fill-[#8FB5DF]/70 dark:fill-[#72A2D6]/40 transition-colors duration-500 group-hover:fill-[#8FB5DF] dark:group-hover:fill-[#72A2D6]/60" />
        </g>

        {/* ---- PIPE BACKGROUND (THICK BORDER) ---- */}
        <g stroke="currentColor" strokeWidth="12" className="text-zinc-950 dark:text-zinc-100" fill="none">
           {/* Main Horizontal */}
           <path d="M 40,185 L 360,185" />
           {/* Left Vertical (Shower & Base) */}
           <path d="M 60,60 L 60,350 L 40,350" />
           <path d="M 60,60 L 120,60 L 120,80" />
           <path d="M 60,145 L 80,145" />
           
           {/* Middle Vertical (Washer) */}
           <path d="M 190,185 L 190,300 L 210,300" />
           
           {/* Right Vertical (Toilet & Sinks) */}
           <path d="M 350,90 L 350,300" />
           <path d="M 350,90 L 330,90" />
           <path d="M 350,135 L 340,135" />
           <path d="M 350,300 L 330,300" />
        </g>

        {/* ---- PIPE FOREGROUND (THIN INNER) ---- */}
        <g stroke="currentColor" strokeWidth="6" className="text-white dark:text-zinc-950" fill="none">
           {/* Main Horizontal */}
           <path d="M 40,185 L 360,185" />
           {/* Left Vertical (Shower & Base) */}
           <path d="M 60,60 L 60,350 L 40,350" />
           <path d="M 60,60 L 120,60 L 120,80" />
           <path d="M 60,145 L 80,145" />
           
           {/* Middle Vertical (Washer) */}
           <path d="M 190,185 L 190,300 L 210,300" />
           
           {/* Right Vertical (Toilet & Sinks) */}
           <path d="M 350,90 L 350,300" />
           <path d="M 350,90 L 330,90" />
           <path d="M 350,135 L 340,135" />
           <path d="M 350,300 L 330,300" />
        </g>

        {/* ---- PIPE JOINTS/CONNECTORS ---- */}
        {/* Black outers */}
        <g stroke="currentColor" strokeWidth="4" className="text-zinc-950 dark:text-zinc-100" fill="white" fillOpacity="0">
          <rect x="48" y="173" width="24" height="24" rx="2" />
          <rect x="178" y="173" width="24" height="24" rx="2" />
          <rect x="338" y="173" width="24" height="24" rx="2" />
          
          <rect x="48" y="54" width="24" height="12" rx="2" />
          <rect x="48" y="139" width="24" height="12" rx="2" />
          <rect x="338" y="84" width="24" height="12" rx="2" />
          <rect x="338" y="129" width="24" height="12" rx="2" />
          <rect x="338" y="294" width="24" height="12" rx="2" />
        </g>
        {/* White inners to map the stroke */}
        <g fill="currentColor" className="text-white dark:text-zinc-950">
          <rect x="50" y="175" width="20" height="20" rx="1" />
          <rect x="180" y="175" width="20" height="20" rx="1" />
          <rect x="340" y="175" width="20" height="20" rx="1" />
          
          <rect x="50" y="56" width="20" height="8" rx="1" />
          <rect x="50" y="141" width="20" height="8" rx="1" />
          <rect x="340" y="86" width="20" height="8" rx="1" />
          <rect x="340" y="131" width="20" height="8" rx="1" />
          <rect x="340" y="296" width="20" height="8" rx="1" />
        </g>

        {/* ---- FIXTURES ---- */}
        <g stroke="currentColor" strokeWidth="4" className="text-zinc-950 dark:text-zinc-100 fill-white dark:fill-zinc-950">
          
          {/* Water Meter Bottom Left */}
          <circle cx="60" cy="270" r="18" />
          <circle cx="60" cy="270" r="8" fill="none" />
          <path d="M 60,235 L 60,252" strokeWidth="6" />
          <path d="M 50,235 L 70,235" strokeWidth="4" />
          <path d="M 70,235 L 80,220" strokeWidth="4" fill="none" />

          {/* Shower Head */}
          <path d="M 105,90 L 135,90 L 120,80 Z" strokeLinejoin="round" />

          {/* Bathtub */}
          <path d="M 90,135 L 230,135 L 220,175 L 100,175 Z" strokeLinejoin="round" />
          <path d="M 80,135 L 240,135" strokeWidth="6" strokeLinecap="round" />

          {/* Top Sink (over toilet) */}
          <path d="M 300,90 L 330,90 L 320,115 L 310,115 Z" strokeLinejoin="round" />
          <path d="M 290,90 L 340,90" strokeWidth="5" strokeLinecap="round" />
          <path d="M 315,90 L 315,75 L 305,75" strokeWidth="3" fill="none" />
          <path d="M 320,90 L 320,85" strokeWidth="3" fill="none" />

          {/* Toilet Tank */}
          <rect x="320" y="115" width="20" height="40" rx="2" />
          
          {/* Toilet Bowl Curve */}
          <path d="M 280,155 L 340,155 L 340,180 C 310,180 290,175 280,155 Z" strokeLinejoin="round" />
          
          {/* Toilet Pedestal */}
          <path d="M 300,180 L 320,180 L 323,185 L 297,185 Z" strokeLinejoin="round" />

          {/* Washing Machine */}
          <rect x="210" y="250" width="70" height="90" rx="4" />
          <circle cx="245" cy="305" r="20" />
          <circle cx="245" cy="305" r="14" fill="none" />
          <rect x="220" y="260" width="20" height="12" rx="2" fill="none" />
          <circle cx="255" cy="266" r="4" fill="none" />
          <circle cx="268" cy="266" r="3" fill="none" />

          {/* Bottom Sink */}
          <path d="M 300,300 L 330,300 L 330,340 L 310,340 Z" strokeLinejoin="round" />
          <path d="M 330,290 L 315,290 L 315,295 M 325,290 L 325,285" fill="none" strokeWidth="3" />

        </g>
      </svg>
    </div>
  );
}
