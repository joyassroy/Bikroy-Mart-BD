"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function SponsorsMarquee() {
  const [sponsors, setSponsors] = useState([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    api.get("/sponsors")
      .then(res => setSponsors(res.data.data || []))
      .catch(() => {});
  }, []);

  const displaySponsors = sponsors.length > 0 ? sponsors : [
    { id: "1", name: "Pran Group", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Pran_logo.svg/320px-Pran_logo.svg.png", website: "#" },
    { id: "2", name: "Aarong", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Aarong_logo.svg/320px-Aarong_logo.svg.png", website: "#" },
    { id: "3", name: "Ispahani", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ispahani_logo.png/320px-Ispahani_logo.png", website: "#" },
    { id: "4", name: "Square Group", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Square_Group_logo.svg/320px-Square_Group_logo.svg.png", website: "#" },
    { id: "5", name: "Teer", logo: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=150", website: "#" },
    { id: "6", name: "Bashundhara", logo: "https://images.pexels.com/photos/1458671/pexels-photo-1458671.jpeg?auto=compress&cs=tinysrgb&w=150", website: "#" },
  ];

  const doubled = [...displaySponsors, ...displaySponsors];

  if (displaySponsors.length === 0) return null;

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden bg-[#F4F7FB]">
      {/* Subtle decorative shapes */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#EC008C]/[0.04] blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#00AFCC]/[0.04] blur-3xl" />

      {/* Top decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />

      <div className="max-w-[1200px] mx-auto px-4 mb-8 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#00215B]/[0.06] rounded-full px-4 py-1.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00AFCC] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00215B]/60">
            Trusted Partners
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#181717] tracking-tight">
          Our Sponsors & Partners
        </h2>
        <p className="text-sm text-[#667085] mt-2 max-w-sm mx-auto">
          Collaborating with industry leaders to serve you better
        </p>
      </div>

      {/* Marquee */}
      <div
        className="relative z-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Edge fades */}
        <div className="absolute left-0 top-0 h-full w-20 sm:w-28 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #F4F7FB, transparent)" }} />
        <div className="absolute right-0 top-0 h-full w-20 sm:w-28 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #F4F7FB, transparent)" }} />

        <div
          className="flex gap-4 sm:gap-5 w-max px-4"
          style={{
            animation: `sponsor-marquee 30s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {doubled.map((sponsor, i) => (
            <a
              key={`${sponsor.id}-${i}`}
              href={sponsor.website || "#"}
              target={sponsor.website && sponsor.website !== "#" ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="group flex-shrink-0 flex flex-col items-center gap-2.5 px-4 sm:px-5 py-4 sm:py-5 rounded-xl bg-white border border-[#E5E7EB] w-[120px] sm:w-[140px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#00AFCC]/40"
              title={sponsor.name}
            >
              <div className="w-16 sm:w-20 h-10 sm:h-12 flex items-center justify-center">
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="max-w-full max-h-full object-contain grayscale opacity-55 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.innerHTML = `<span class="text-[11px] font-bold text-[#364152] text-center leading-tight">${sponsor.name}</span>`;
                  }}
                />
              </div>
              <span className="text-[10px] font-semibold text-[#667085] group-hover:text-[#00215B] transition-colors duration-300 text-center truncate w-full">
                {sponsor.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EC008C]/20 to-transparent" />

      <style jsx>{`
        @keyframes sponsor-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
