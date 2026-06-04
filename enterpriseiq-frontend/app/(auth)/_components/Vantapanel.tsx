"use client";

import { useEffect, useRef } from "react";

export function VantaPanel() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    let threeScript: HTMLScriptElement | null = null;
    let vantaScript: HTMLScriptElement | null = null;

    const getThemeColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      return {
        color: isDark ? 0x6ee7b7 : 0x059669, // Slightly deeper emerald in light mode for visible lines
        backgroundColor: isDark ? 0x0c0f14 : 0xf8fafc, // Clean off-white tone for light mode panel background
      };
    };

    const initVanta = () => {
      if (!vantaRef.current || vantaEffect.current) return;
      const win = window as any;
      if (!win.VANTA?.NET) return;

      const colors = getThemeColors();

      vantaEffect.current = win.VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1.0,
        scaleMobile: 1.0,
        color: colors.color,
        backgroundColor: colors.backgroundColor,
        points: 10.0,
        maxDistance: 22.0,
        spacing: 18.0,
      });
    };

    const loadVanta = () => {
      vantaScript = document.createElement("script");
      vantaScript.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js";
      vantaScript.async = true;
      vantaScript.onload = initVanta;
      document.head.appendChild(vantaScript);
    };

    if (!(window as any).THREE) {
      threeScript = document.createElement("script");
      threeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
      threeScript.async = true;
      threeScript.onload = loadVanta;
      document.head.appendChild(threeScript);
    } else {
      loadVanta();
    }

    // Listen for theme mutations to update background real-time
    const observer = new MutationObserver(() => {
      if (vantaEffect.current) {
        const colors = getThemeColors();
        vantaEffect.current.setOptions({
          color: colors.color,
          backgroundColor: colors.backgroundColor,
        });
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      vantaEffect.current?.destroy();
      vantaEffect.current = null;
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      ref={vantaRef} 
      // Added blur-[2px] to soften the lines. You can change this to blur-[1px] if you want it sharper, 
      // or blur-[3px] if you want an even softer, more diffuse background glow.
      className="absolute inset-0 w-full h-full blur-[1px]" 
    />
  );
}