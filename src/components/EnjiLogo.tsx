import React from "react";

interface EnjiLogoProps {
  className?: string;
  height?: number;
  color?: string;
}

export default function EnjiLogo({ className = "", height = 36, color = "#0c4a6e" }: EnjiLogoProps) {
  // Aspect ratio is roughly 2.5:1. Let's make sure the width scales correctly
  const width = Math.round(height * 2.55);

  return (
    <svg
      id="enji-brand-logo"
      width={width}
      height={height}
      viewBox="0 0 100 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none transition-transform active:scale-95`}
    >
      {/* Lowercase 'e' - elegant circular sweep with flat crossbar */}
      <path
        d="M 21.5 26.5 H 8 M 8 26.5 C 8 20.5 10.5 16 15 16 C 19.5 16 21.8 20.5 22 25.5 C 22 31.5 19.5 36.5 14.8 36.5 C 10 36.5 8 32 8 26.5"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Lowercase 'n' */}
      <path
        d="M 28 21.5 V 36"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M 28 26 C 28 21 31.2 19.8 34.5 19.8 C 37.8 19.8 38.5 21.8 38.5 26 V 36"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Hyphen '-' */}
      <path
        d="M 44.5 27.5 H 50.5"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Lowercase 'j' - curves beautifully down */}
      <path
        d="M 59.5 21.5 V 41 C 59.5 44.8 57 46.5 53.5 46.5"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="59.5" cy="13" r="2.2" fill={color} />

      {/* Lowercase 'i' */}
      <path
        d="M 69.5 21.5 V 36"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* The iconic signature ribbon/bowknot (pita) on 'i' dot */}
      <g transform="translate(69.5, 12)">
        {/* Center knot */}
        <circle cx="0" cy="0" r="1.8" fill={color} />
        
        {/* Left loop */}
        <path
          d="M 0 0 C -4 -4 -7 -2 -5 1 C -3 3 -1 1 0 0"
          fill={color}
          stroke={color}
          strokeWidth="0.5"
          strokeLinejoin="round"
        />

        {/* Right loop */}
        <path
          d="M 0 0 C 4 -4 7 -2 5 1 C 3 3 1 1 0 0"
          fill={color}
          stroke={color}
          strokeWidth="0.5"
          strokeLinejoin="round"
        />

        {/* Left ribbon tail */}
        <path
          d="M -1 1 C -2.5 3.5 -4 5 -5.5 6"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Right ribbon tail */}
        <path
          d="M 1 1 C 2.5 3.5 4 5 5.5 6"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

