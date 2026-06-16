"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isActive: boolean;
  speaker: "ai" | "user" | "idle";
  barCount?: number;
}

export default function AudioVisualizer({
  isActive,
  speaker,
  barCount = 40,
}: AudioVisualizerProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const bars = barsRef.current;

    if (!isActive) {
      bars.forEach((bar) => {
        if (bar) {
          bar.style.transform = "scaleY(0.15)";
          bar.style.opacity = "0.3";
        }
      });
      return;
    }

    let frame = 0;

    const animate = () => {
      frame++;
      bars.forEach((bar, i) => {
        if (!bar) return;
        // Create wave effect with sine waves at different frequencies
        const wave1 = Math.sin(frame * 0.08 + i * 0.4) * 0.3;
        const wave2 = Math.sin(frame * 0.13 + i * 0.3) * 0.2;
        const wave3 = Math.sin(frame * 0.05 + i * 0.6) * 0.15;
        const base = 0.25 + Math.random() * 0.1;
        const scale = Math.max(0.1, Math.min(1, base + wave1 + wave2 + wave3));
        bar.style.transform = `scaleY(${scale})`;
        bar.style.opacity = `${0.6 + scale * 0.4}`;
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive]);

  const barColor =
    speaker === "ai"
      ? "from-brand-500 to-brand-400"
      : speaker === "user"
      ? "from-accent-green to-emerald-400"
      : "from-surface-4 to-surface-3";

  return (
    <div className="flex items-center justify-center gap-[3px] h-20">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { barsRef.current[i] = el; }}
          className={`audio-bar bg-gradient-to-t ${barColor} transition-colors duration-300`}
          style={{
            height: "64px",
            transform: "scaleY(0.15)",
            opacity: 0.3,
            transformOrigin: "bottom center",
            transition: "background 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}
