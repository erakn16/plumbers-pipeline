import React from "react";

export function PipelineVector() {
  return (
    <div className="w-full h-full relative aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden group border border-border shadow-inner">
      
      {/* Background Room Blocks */}
      <div className="absolute inset-0 p-8 flex flex-col gap-3 bg-zinc-50 dark:bg-zinc-950">
        {/* Top Room */}
        <div className="flex-1 bg-[#8FB5DF]/70 dark:bg-[#72A2D6]/40 rounded-sm transition-colors duration-500 group-hover:bg-[#8FB5DF] dark:group-hover:bg-[#72A2D6]/60"></div>
        {/* Bottom Rooms */}
        <div className="flex-1 flex gap-3">
          <div className="flex-[0.4] bg-[#8FB5DF]/70 dark:bg-[#72A2D6]/40 rounded-sm transition-colors duration-500 group-hover:bg-[#8FB5DF] dark:group-hover:bg-[#72A2D6]/60"></div>
          <div className="flex-[0.6] bg-[#8FB5DF]/70 dark:bg-[#72A2D6]/40 rounded-sm transition-colors duration-500 group-hover:bg-[#8FB5DF] dark:group-hover:bg-[#72A2D6]/60"></div>
        </div>
      </div>

      {/* SVG Pipeline */}
      <div className="absolute inset-0 p-4">
        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-xl" strokeLinecap="round" strokeLinejoin="round">
          
          {/* ---- PIPE BACKGROUND (THICK BORDER) ---- */}
          <g stroke="currentColor" strokeWidth="12" className="text-zinc-950 dark:text-zinc-100" fill="none">
             {/* Main Vertical & Horizontal */}
             <path d="M 60,370 L 100,370 L 100,200 L 370,200" />
             {/* To Shower */}
             <path d="M 100,200 L 100,60 L 170,60 L 170,80" />
             {/* To Bathtub */}
             <path d="M 100,150 L 120,150" />
             {/* To Top Sink & Toilet */}
             <path d="M 370,200 L 370,100 L 310,100" />
             {/* To Toilet Water Tank */}
             <path d="M 370,140 L 340,140" />
             {/* To Bottom Sink */}
             <path d="M 370,200 L 370,300 L 330,300" />
             {/* To Washing Machine */}
             <path d="M 200,200 L 200,310 L 220,310" />
          </g>

          {/* ---- PIPE FOREGROUND (THIN INNER) ---- */}
          <g stroke="currentColor" strokeWidth="6" className="text-white dark:text-zinc-950" fill="none">
             {/* Main Vertical & Horizontal */}
             <path d="M 60,370 L 100,370 L 100,200 L 370,200" />
             {/* To Shower */}
             <path d="M 100,200 L 100,60 L 170,60 L 170,80" />
             {/* To Bathtub */}
             <path d="M 100,150 L 120,150" />
             {/* To Top Sink & Toilet */}
             <path d="M 370,200 L 370,100 L 310,100" />
             {/* To Toilet Water Tank */}
             <path d="M 370,140 L 340,140" />
             {/* To Bottom Sink */}
             <path d="M 370,200 L 370,300 L 330,300" />
             {/* To Washing Machine */}
             <path d="M 200,200 L 200,310 L 220,310" />
          </g>

          {/* ---- PIPE JOINTS/CONNECTORS ---- */}
          {/* Black outers */}
          <g stroke="currentColor" strokeWidth="4" className="text-zinc-950 dark:text-zinc-100" fill="white" fillOpacity="0" >
            <rect x="88" y="188" width="24" height="24" rx="2" />
            <rect x="88" y="90" width="24" height="12" rx="2" />
            <rect x="88" y="144" width="24" height="12" rx="2" />
            <rect x="188" y="188" width="24" height="12" rx="2" />
            <rect x="358" y="188" width="24" height="24" rx="2" />
            <rect x="358" y="134" width="24" height="12" rx="2" />
            <rect x="358" y="294" width="24" height="12" rx="2" />
            <rect x="358" y="94" width="24" height="12" rx="2" />
          </g>
          {/* White inners to map the stroke */}
          <g fill="currentColor" className="text-white dark:text-zinc-950">
            <rect x="90" y="190" width="20" height="20" rx="1" />
            <rect x="90" y="92" width="20" height="8" rx="1" />
            <rect x="90" y="146" width="20" height="8" rx="1" />
            <rect x="190" y="190" width="20" height="8" rx="1" />
            <rect x="360" y="190" width="20" height="20" rx="1" />
            <rect x="360" y="136" width="20" height="8" rx="1" />
            <rect x="360" y="296" width="20" height="8" rx="1" />
            <rect x="360" y="96" width="20" height="8" rx="1" />
          </g>

          {/* ---- FIXTURES ---- */}
          <g stroke="currentColor" strokeWidth="4" className="text-zinc-950 dark:text-zinc-100 fill-white dark:fill-zinc-950">
            
            {/* Water Meter Bottom Left */}
            <circle cx="100" cy="280" r="18" />
            <circle cx="100" cy="280" r="8" fill="none" />
            <path d="M 100,245 L 100,262" strokeWidth="6" />
            {/* Valve on Meter */}
            <path d="M 90,245 L 110,245" strokeWidth="4" />
            <path d="M 110,245 L 120,230" strokeWidth="4" />

            {/* Shower Head */}
            <path d="M 155,90 L 185,90 L 170,80 Z" />

            {/* Bathtub */}
            <path d="M 120,135 L 250,135 L 240,195 L 130,195 Z" />
            <path d="M 110,135 L 260,135" strokeWidth="6" strokeLinecap="round" />

            {/* Top Sink (over toilet) */}
            <path d="M 285,100 L 325,100 L 315,130 L 295,130 Z" />
            <path d="M 275,100 L 335,100" strokeWidth="5" strokeLinecap="round" />
            {/* Faucet on Top Sink */}
            <path d="M 315,100 L 315,85 L 305,85" strokeWidth="3" fill="none" />
            <path d="M 320,100 L 320,95" strokeWidth="3" fill="none" />

            {/* Toilet Tank */}
            <rect x="315" y="115" width="20" height="40" rx="2" />
            {/* Toilet Bowl Curve */}
            <path d="M 275,155 L 325,155 L 325,190 C 300,190 285,180 275,155 Z" />
            {/* Toilet Pedestal */}
            <path d="M 290,190 L 310,190 L 313,205 L 287,205 Z" />

            {/* Washing Machine */}
            <rect x="220" y="270" width="70" height="90" rx="4" />
            <circle cx="255" cy="325" r="20" />
            <circle cx="255" cy="325" r="14" fill="none" />
            <rect x="230" y="280" width="20" height="12" rx="2" fill="none" />
            <circle cx="265" cy="286" r="4" fill="none" />
            <circle cx="278" cy="286" r="3" fill="none" />

            {/* Bottom Sink */}
            <path d="M 280,300 L 330,300 L 330,350 L 300,350 Z" />
            {/* Faucet on Bottom Sink */}
            <path d="M 330,290 L 315,290 L 315,295 M 325,290 L 325,285" fill="none" strokeWidth="3" />

          </g>
        </svg>
      </div>

    </div>
  );
}
