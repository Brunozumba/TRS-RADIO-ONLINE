import React from 'react';

interface TRSLogoProps {
  className?: string;
  animate?: boolean;
}

export default function TRSLogo({ className = 'w-12 h-12', animate = false }: TRSLogoProps) {
  return (
    <svg 
      viewBox="0 0 400 400" 
      className={`${className} select-none`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Metallic Gold Gradient for borders and paths */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF0B3" />
          <stop offset="20%" stopColor="#D4AF37" />
          <stop offset="40%" stopColor="#AA7C11" />
          <stop offset="60%" stopColor="#F3E5AB" />
          <stop offset="80%" stopColor="#B58920" />
          <stop offset="100%" stopColor="#8A640F" />
        </linearGradient>

        {/* Brighter Metallic Highlight Gold Gradient */}
        <linearGradient id="goldHighlight" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B58920" />
          <stop offset="30%" stopColor="#F9D56E" />
          <stop offset="50%" stopColor="#FFF7D6" />
          <stop offset="70%" stopColor="#F9D56E" />
          <stop offset="100%" stopColor="#AA7C11" />
        </linearGradient>

        {/* Soft Radial Gold Gradient for highlights */}
        <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF7D6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>

        {/* Inner Dark Background Radial Gradient */}
        <radialGradient id="darkBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#091026" />
          <stop offset="70%" stopColor="#030712" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        {/* Drop Shadow Filter */}
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.7" />
        </filter>

        {/* Subtle Gold Glow Filter */}
        <filter id="goldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Text Paths */}
        {/* Arched path for RÁDIO ONLINE */}
        <path 
          id="topTextPath" 
          d="M 52,200 A 148,148 0 0,1 348,200" 
          fill="none" 
        />
        {/* Reversed Arched path for A MUSICA SEM FRONTEIRAS so text flows left-to-right */}
        <path 
          id="bottomTextPath" 
          d="M 348,200 A 148,148 0 0,1 52,200" 
          fill="none" 
        />

        {/* Reusable Star Element */}
        <g id="goldStar">
          <polygon 
            points="0,-8 2.4,-2.4 8,-2.4 3.6,1 5.4,6.4 0,3.2 -5.4,6.4 -3.6,1 -8,-2.4 -2.4,-2.4" 
            fill="url(#goldHighlight)" 
          />
        </g>
      </defs>

      {/* Main Base Card with Shadow */}
      <g filter="url(#logoShadow)">
        {/* Outer Heavy Gold Beveled Ring */}
        <circle cx="200" cy="200" r="188" stroke="url(#goldGrad)" strokeWidth="8" fill="none" />
        
        {/* Thin Gold Inner Ring Divider */}
        <circle cx="200" cy="200" r="180" stroke="#000000" strokeWidth="2.5" fill="none" opacity="0.4" />
        <circle cx="200" cy="200" r="176" stroke="url(#goldHighlight)" strokeWidth="2" fill="none" />
        
        {/* Inside Emblem Base (Dark Luxury Blue/Black) */}
        <circle cx="200" cy="200" r="174" fill="url(#darkBg)" />

        {/* Gold Glow Aura */}
        <circle cx="200" cy="200" r="160" fill="url(#goldGlow)" />

        {/* Second Inner Gold Ring */}
        <circle cx="200" cy="200" r="134" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" opacity="0.8" />
      </g>

      {/* TEXT SECTION (RÁDIO ONLINE / A MUSICA SEM FRONTEIRAS) */}
      <g filter="url(#goldGlowFilter)">
        {/* Top Text: RÁDIO ONLINE */}
        <text 
          fontFamily="'Inter', 'Outfit', sans-serif" 
          fontSize="23" 
          fontWeight="900" 
          fill="url(#goldHighlight)" 
          letterSpacing="9"
        >
          <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
            RÁDIO ONLINE
          </textPath>
        </text>

        {/* Bottom Text: A MUSICA SEM FRONTEIRAS */}
        <text 
          fontFamily="'Inter', 'Outfit', sans-serif" 
          fontSize="14.5" 
          fontWeight="900" 
          fill="url(#goldHighlight)" 
          letterSpacing="6.5"
        >
          <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
            A MUSICA SEM FRONTEIRAS
          </textPath>
        </text>
      </g>

      {/* ARC OF STARS ABOVE THE MONOGRAM (5 Stars) */}
      <g>
        {/* Star 1 - Far Left */}
        <use href="#goldStar" x="144" y="112" transform="rotate(-24 144 112) scale(0.75)" />
        {/* Star 2 - Mid Left */}
        <use href="#goldStar" x="170" y="99" transform="rotate(-12 170 99) scale(0.9)" />
        {/* Star 3 - Center */}
        <use href="#goldStar" x="200" y="94" transform="scale(1.1)" />
        {/* Star 4 - Mid Right */}
        <use href="#goldStar" x="230" y="99" transform="rotate(12 230 99) scale(0.9)" />
        {/* Star 5 - Far Right */}
        <use href="#goldStar" x="256" y="112" transform="rotate(24 256 112) scale(0.75)" />
      </g>

      {/* RADIO/AUDIO WAVES ON THE LEFT AND RIGHT */}
      <g stroke="url(#goldGrad)" strokeLinecap="round" fill="none">
        {/* Left Waves */}
        <path d="M 52,175 A 30,30 0 0,0 52,225" strokeWidth="1.5" opacity="0.3" />
        <path d="M 45,165 A 42,42 0 0,0 45,235" strokeWidth="2.5" opacity="0.6" />
        <path d="M 38,155 A 55,55 0 0,0 38,245" strokeWidth="3.5" />
        <circle cx="62" cy="200" r="2.5" fill="url(#goldHighlight)" />

        {/* Right Waves */}
        <path d="M 348,175 A 30,30 0 0,1 348,225" strokeWidth="1.5" opacity="0.3" />
        <path d="M 355,165 A 42,42 0 0,1 355,235" strokeWidth="2.5" opacity="0.6" />
        <path d="M 362,155 A 55,55 0 0,1 362,245" strokeWidth="3.5" />
        <circle cx="338" cy="200" r="2.5" fill="url(#goldHighlight)" />
      </g>

      {/* MONOGRAM "TRS" IN THE CENTER */}
      {/* Tilted orbital gold ring circling the letters */}
      <g filter="url(#logoShadow)">
        <ellipse 
          cx="200" 
          cy="185" 
          rx="115" 
          ry="32" 
          stroke="url(#goldHighlight)" 
          strokeWidth="3.5" 
          fill="none" 
          transform="rotate(-26 200 185)" 
        />
      </g>

      {/* Elegant metallic letters with 3D shadow boundaries */}
      <g filter="url(#logoShadow)" id="trs-monogram-group">
        {/* Letter T (Left) */}
        <text 
          x="142" 
          y="238" 
          fontFamily="'Playfair Display', 'Times New Roman', Georgia, serif" 
          fontSize="112" 
          fontWeight="900" 
          fill="url(#goldHighlight)" 
          stroke="#010514" 
          strokeWidth="3.5" 
          strokeLinejoin="round"
        >
          T
        </text>

        {/* Letter R (Center, overlapping T and S) */}
        <text 
          x="196" 
          y="238" 
          fontFamily="'Playfair Display', 'Times New Roman', Georgia, serif" 
          fontSize="112" 
          fontWeight="900" 
          fill="url(#goldHighlight)" 
          stroke="#010514" 
          strokeWidth="4" 
          strokeLinejoin="round"
        >
          R
        </text>

        {/* Letter S (Right) */}
        <text 
          x="250" 
          y="238" 
          fontFamily="'Playfair Display', 'Times New Roman', Georgia, serif" 
          fontSize="112" 
          fontWeight="900" 
          fill="url(#goldHighlight)" 
          stroke="#010514" 
          strokeWidth="3.5" 
          strokeLinejoin="round"
        >
          S
        </text>
      </g>

      {/* RETRO MICROPHONE & AUDIO BARS (BOTTOM CENTER) */}
      <g filter="url(#logoShadow)">
        {/* Equalizer Visualizer Bars - Left Side */}
        <g fill="url(#goldHighlight)">
          <rect x="134" y="271" width="3.5" height="9" rx="1" />
          <rect x="142" y="264" width="3.5" height="16" rx="1" />
          <rect x="150" y="255" width="3.5" height="25" rx="1" />
          <rect x="158" y="246" width="3.5" height="34" rx="1" />
          <rect x="166" y="258" width="3.5" height="22" rx="1" />
          <rect x="174" y="268" width="3.5" height="12" rx="1" />
        </g>

        {/* Equalizer Visualizer Bars - Right Side */}
        <g fill="url(#goldHighlight)">
          <rect x="222" y="268" width="3.5" height="12" rx="1" />
          <rect x="230" y="258" width="3.5" height="22" rx="1" />
          <rect x="238" y="246" width="3.5" height="34" rx="1" />
          <rect x="246" y="255" width="3.5" height="25" rx="1" />
          <rect x="254" y="264" width="3.5" height="16" rx="1" />
          <rect x="262" y="271" width="3.5" height="9" rx="1" />
        </g>

        {/* Classic Retro Microphone standing in the center */}
        {/* Mic Base & Stand */}
        <path 
          d="M 200,296 L 200,324 M 182,324 L 218,324" 
          stroke="url(#goldHighlight)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          fill="none" 
        />
        
        {/* Mic U-Shape Cradle */}
        <path 
          d="M 183,264 C 183,293 217,293 217,264" 
          stroke="url(#goldHighlight)" 
          strokeWidth="3.5" 
          strokeLinecap="round"
          fill="none" 
        />

        {/* Mic Body/Capsule (Golden rounded cylinder) */}
        <rect 
          x="188.5" 
          y="244" 
          width="23" 
          height="38" 
          rx="11.5" 
          fill="url(#goldGrad)" 
          stroke="#010514" 
          strokeWidth="2" 
        />

        {/* Mic Grill Horizontal Stripes (using fine bronze color lines) */}
        <line x1="189" y1="250" x2="211" y2="250" stroke="#4a3102" strokeWidth="1.5" />
        <line x1="189" y1="256" x2="211" y2="256" stroke="#4a3102" strokeWidth="1.5" />
        <line x1="189" y1="262" x2="211" y2="262" stroke="#4a3102" strokeWidth="1.5" />
        <line x1="189" y1="268" x2="211" y2="268" stroke="#4a3102" strokeWidth="1.5" />
        <line x1="189" y1="274" x2="211" y2="274" stroke="#4a3102" strokeWidth="1.5" />

        {/* Mic Grill Center Vertical Bar */}
        <line x1="200" y1="244" x2="200" y2="282" stroke="#4a3102" strokeWidth="2" />
      </g>
      
      {/* Decorative center micro-circle */}
      <circle cx="200" cy="200" r="1.5" fill="url(#goldHighlight)" opacity="0.5" />
    </svg>
  );
}
