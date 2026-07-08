"use client";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function CountdownTimer({ endsAt, compact = false }) {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const end = new Date(endsAt);
      const diff = Math.max(0, end - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTime({ hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  const pad = (n) => String(n).padStart(2, "0");

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-[#FF6B6B] font-mono font-bold text-[10px] bg-[#FFF0F0] px-1.5 py-0.5 rounded-full">
        <Clock size={10} />
        <span>{pad(time.hours)}</span>:<span>{pad(time.minutes)}</span>:<span>{pad(time.seconds)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-[#FF6B6B] font-mono font-bold text-[11px] sm:text-xs bg-[#FFF0F0] px-2 py-1 rounded-full">
      <Clock size={12} />
      <span>{pad(time.hours)}</span>:<span>{pad(time.minutes)}</span>:<span>{pad(time.seconds)}</span>
    </div>
  );
}
