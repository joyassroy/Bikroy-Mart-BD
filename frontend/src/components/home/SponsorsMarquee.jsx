"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";

export default function SponsorsMarquee() {
  const [sponsors, setSponsors] = useState([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    api.get("/sponsors")
      .then(res => setSponsors(res.data.data || []))
      .catch(() => {});
  }, []);

  // Fallback demo sponsors if none in DB yet
  const displaySponsors = sponsors.length > 0 ? sponsors : [
    { id: "1", name: "Pran Group", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Pran_logo.svg/320px-Pran_logo.svg.png", website: "#" },
    { id: "2", name: "Aarong", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Aarong_logo.svg/320px-Aarong_logo.svg.png", website: "#" },
    { id: "3", name: "Ispahani", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ispahani_logo.png/320px-Ispahani_logo.png", website: "#" },
    { id: "4", name: "Square Group", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Square_Group_logo.svg/320px-Square_Group_logo.svg.png", website: "#" },
    { id: "5", name: "Teer", logo: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=150", website: "#" },
    { id: "6", name: "Bashundhara", logo: "https://images.pexels.com/photos/1458671/pexels-photo-1458671.jpeg?auto=compress&cs=tinysrgb&w=150", website: "#" },
  ];

  // Duplicate for seamless loop
  const doubled = [...displaySponsors, ...displaySponsors];

  if (displaySponsors.length === 0) return null;

  return (
    <section className="py-10 bg-[#F0F2F5] border-y border-gray-200 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#00215B]/50 mb-1">Trusted Partners</p>
        <h2 className="text-xl sm:text-2xl font-bold text-[#00215B]">Our Sponsors & Partners</h2>
      </div>

      {/* Marquee track */}
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left fade */}
        <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #F4F7FB, transparent)" }} />
        {/* Right fade */}
        <div className="absolute right-0 top-0 h-full w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #F4F7FB, transparent)" }} />

        <div
          className="flex gap-6 w-max"
          style={{
            animation: `marquee-scroll 28s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {doubled.map((sponsor, i) => (
            <a
              key={`${sponsor.id}-${i}`}
              href={sponsor.website || "#"}
              target={sponsor.website && sponsor.website !== "#" ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="group flex-shrink-0 flex flex-col items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 w-36"
              title={sponsor.name}
            >
              <div className="w-20 h-12 flex items-center justify-center">
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.innerHTML = `<span class="text-xs font-bold text-[#00215B] text-center leading-tight">${sponsor.name}</span>`;
                  }}
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-500 group-hover:text-[#00215B] transition-colors text-center truncate w-full">
                {sponsor.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
