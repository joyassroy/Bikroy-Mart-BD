"use client";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import { Building2, Users, Target, Heart, Code, ExternalLink, MapPin, Phone, Mail, ChevronRight } from "lucide-react";

const teamMembers = [
  {
    name: "Mohammad Rahman",
    nameBn: "মোহাম্মদ রহমান",
    position: "Chairman",
    positionBn: "চেয়ারম্যান",
    image: "/team/chairman.jpg",
    bio: "Visionary leader with 20+ years of experience in retail and technology. Founded Bikroymart BD with a mission to revolutionize grocery shopping in Bangladesh.",
    bioBn: "খুচরা ও প্রযুক্তিতে ২০+ বছরের অভিজ্ঞতা সম্পন্ন দূরদর্শী নেতা। বাংলাদেশে মুদি কেনাকাটা বিপ্লবী করার লক্ষ্যে বিক্রয়-মার্ট-বিডি প্রতিষ্ঠা করেছেন।",
  },
  {
    name: "Fatima Khan",
    nameBn: "ফাতিমা খান",
    position: "Vice Chairman",
    positionBn: "ভাইস চেয়ারম্যান",
    image: "/team/vice-chairman.jpg",
    bio: "Strategic thinker driving innovation in supply chain management. Committed to bringing fresh products to every household in Bangladesh.",
    bioBn: "সরবরাহ শৃঙ্খল ব্যবস্থাপনায় উদ্ভাবনী চিন্তাধারা। বাংলাদেশের প্রতিটি ঘরে তাজা পণ্য পৌঁছে দেওয়ার প্রতিশ্রুতিবদ্ধ।",
  },
  {
    name: "Ahmed Hassan",
    nameBn: "আহমেদ হাসান",
    position: "Managing Director",
    positionBn: "ব্যবস্থাপনা পরিচালক",
    image: "/team/md.jpg",
    bio: "Operations expert ensuring seamless delivery experience. Leading the team to serve 10,000+ customers daily across Bangladesh.",
    bioBn: "নিরবিচ্ছিন্ন ডেলিভারি অভিজ্ঞতা নিশ্চিত করার পরিচালন বিশেষজ্ঞ। বাংলাদেশ জুড়ে দৈনিক ১০,০০০+ গ্রাহককে সেবা দেওয়ার নেতৃত্ব দিচ্ছেন।",
  },
  {
    name: "Nadia Islam",
    nameBn: "নাদিয়া ইসলাম",
    position: "Head of Operations",
    positionBn: "পরিচালনা প্রধান",
    image: "/team/operations.jpg",
    bio: "Ensuring quality control and customer satisfaction. Managing a network of 50+ delivery riders across Dhaka.",
    bioBn: "মান নিয়ন্ত্রণ এবং গ্রাহক সন্তুষ্টি নিশ্চিত করছেন। ঢাকা জুড়ে ৫০+ ডেলিভারি রাইডারের নেটওয়ার্ক পরিচালনা করছেন।",
  },
];

const stats = [
  { label: "Happy Customers", labelBn: "সন্তুষ্ট গ্রাহক", value: "10,000+", icon: "👥" },
  { label: "Products", labelBn: "পণ্য", value: "5,000+", icon: "📦" },
  { label: "Delivery Riders", labelBn: "ডেলিভারি রাইডার", value: "50+", icon: "🛵" },
  { label: "Districts Covered", labelBn: "আবৃত জেলা", value: "64", icon: "🗺️" },
];

const values = [
  {
    title: "Quality First",
    titleBn: "মান প্রথম",
    description: "We source fresh products directly from trusted suppliers and farms.",
    descriptionBn: "আমরা বিশ্বস্ত সরবরাহকারী এবং খামার থেকে সরাসরি তাজা পণ্য সংগ্রহ করি।",
    icon: <Heart size={24} className="text-[#EC008C]" />,
  },
  {
    title: "Fast Delivery",
    titleBn: "দ্রুত ডেলিভারি",
    description: "60-minute delivery to ensure your groceries arrive fresh.",
    descriptionBn: "আপনার মুদি তাজা পৌঁছে দিতে ৬০ মিনিটের ডেলিভারি।",
    icon: <Target size={24} className="text-[#EC008C]" />,
  },
  {
    title: "Customer Trust",
    titleBn: "গ্রাহক আস্থা",
    description: "Building long-term relationships through reliable service.",
    descriptionBn: "নির্ভরযোগ্য সেবার মাধ্যমে দীর্ঘমেয়াদী সম্পর্ক গড়ে তোলা।",
    icon: <Users size={24} className="text-[#EC008C]" />,
  },
  {
    title: "Community Impact",
    titleBn: "সম্প্রদায়ের প্রভাব",
    description: "Supporting local farmers and suppliers across Bangladesh.",
    descriptionBn: "বাংলাদেশ জুড়ে স্থানীয় কৃষক ও সরবরাহকারীদের সমর্থন।",
    icon: <Building2 size={24} className="text-[#EC008C]" />,
  },
];

export default function AboutSection() {
  const { language } = useLanguage();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#00215B] to-[#001A4A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white/30 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 border border-white/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-full"></div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-12 md:py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              {language === "bn" ? "আমাদের সম্পর্কে" : "About Bikroymart BD"}
            </h1>
            <p className="text-sm md:text-lg text-white/80 leading-relaxed">
              {language === "bn"
                ? "বিক্রয়-মার্ট-বিডি বাংলাদেশের শীর্ষস্থানীয় অনলাইন মুদি কেনাকাটা প্ল্যাটফর্ম। আমরা তাজা পণ্য, দ্রুত ডেলিভারি এবং সেরা মূল্য প্রদান করি।"
                : "Bikroymart BD is Bangladesh's premier online grocery shopping platform. We deliver fresh products, fast delivery, and the best prices to your doorstep."}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 md:py-16 bg-[#F4F7FB]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-4 md:p-6 text-center shadow-sm hover:shadow-md transition">
                <span className="text-2xl md:text-3xl mb-2 block">{stat.icon}</span>
                <div className="text-2xl md:text-3xl font-bold text-[#00215B] mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-[#667085]">{language === "bn" ? stat.labelBn : stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-10 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="bg-gradient-to-br from-[#FCE8F3] to-white rounded-2xl p-6 md:p-8">
              <div className="w-12 h-12 bg-[#EC008C] rounded-xl flex items-center justify-center mb-4">
                <Target size={24} className="text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#00215B] mb-3">
                {language === "bn" ? "আমাদের মিশন" : "Our Mission"}
              </h2>
              <p className="text-sm md:text-base text-[#667085] leading-relaxed">
                {language === "bn"
                  ? "বাংলাদেশের প্রতিটি ঘরে তাজা এবং মানসম্মত মুদি সরবরাহ করা। আমরা প্রযুক্তির মাধ্যমে কেনাকাটার অভিজ্ঞতকে সহজ এবং আনন্দদায়ক করে তুলতে চাই।"
                  : "To deliver fresh and quality groceries to every household in Bangladesh. We aim to make the shopping experience easy and enjoyable through technology."}
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#F4F7FB] to-white rounded-2xl p-6 md:p-8">
              <div className="w-12 h-12 bg-[#00215B] rounded-xl flex items-center justify-center mb-4">
                <Heart size={24} className="text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#00215B] mb-3">
                {language === "bn" ? "আমাদের ভিশন" : "Our Vision"}
              </h2>
              <p className="text-sm md:text-base text-[#667085] leading-relaxed">
                {language === "bn"
                  ? "বাংলাদেশের সবচেয়ে বিশ্বস্ত এবং জনপ্রিয় অনলাইন মুদি কেনাকাটা প্ল্যাটফর্ম হওয়া। আমরা গ্রাহকদের সন্তুষ্টি এবং নিরাপত্তাকে সর্বোচ্চ গুরুত্ব দিই।"
                  : "To become Bangladesh's most trusted and popular online grocery shopping platform. We prioritize customer satisfaction and safety above all else."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-10 md:py-16 bg-[#F4F7FB]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00215B] mb-3">
              {language === "bn" ? "আমাদের মূল্যবোধ" : "Our Core Values"}
            </h2>
            <p className="text-sm md:text-base text-[#667085] max-w-2xl mx-auto">
              {language === "bn"
                ? "যে নীতিগুলো আমাদের পরিচালিত করে"
                : "The principles that guide everything we do"}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition group">
                <div className="w-12 h-12 bg-[#FCE8F3] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#EC008C]/10 transition">
                  {value.icon}
                </div>
                <h3 className="text-base md:text-lg font-bold text-[#00215B] mb-2">
                  {language === "bn" ? value.titleBn : value.title}
                </h3>
                <p className="text-xs md:text-sm text-[#667085] leading-relaxed">
                  {language === "bn" ? value.descriptionBn : value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-10 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00215B] mb-3">
              {language === "bn" ? "আমাদের নেতৃত্ব" : "Our Leadership Team"}
            </h2>
            <p className="text-sm md:text-base text-[#667085] max-w-2xl mx-auto">
              {language === "bn"
                ? "যারা বিক্রয়-মার্ট-বিডিকে এগিয়ে নিয়ে যাচ্ছেন"
                : "The people driving Bikroymart BD forward"}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group">
                <div className="relative h-48 bg-gradient-to-br from-[#00215B] to-[#00AFCC] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                      <Users size={40} className="text-white/80" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <span className="text-xs text-white/80 bg-[#EC008C] px-2 py-1 rounded-full">
                      {language === "bn" ? member.positionBn : member.position}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-[#00215B] mb-1">
                    {language === "bn" ? member.nameBn : member.name}
                  </h3>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    {language === "bn" ? member.bioBn : member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer & Agency Section */}
      <section className="py-10 md:py-16 bg-gradient-to-r from-[#00215B] to-[#001A4A] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {language === "bn" ? "ডেভেলপমেন্ট পার্টনার" : "Development Partner"}
            </h2>
            <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto">
              {language === "bn"
                ? "এই প্ল্যাটফর্মটি তৈরি করেছে"
                : "Building this platform with excellence"}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Agency Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#EC008C] rounded-xl flex items-center justify-center">
                    <Code size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">webSynthStudio</h3>
                    <p className="text-xs text-white/60">Digital Excellence Agency</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-white/80 leading-relaxed mb-6">
                  {language === "bn"
                    ? "webSynthStudio একটি শীর্ষস্থানীয় ডিজিটাল এজেন্সি যারা ওয়েব ডেভেলপমেন্ট, মোবাইল অ্যাপ এবং এআই অটোমেশনে বিশেষজ্ঞ। তারা বিক্রয়-মার্ট-বিডির পুরো প্ল্যাটফর্ম ডিজাইন এবং ডেভেলপ করেছে।"
                    : "webSynthStudio is a leading digital agency specializing in web development, mobile apps, and AI automation. They designed and developed the entire Bikroymart BD platform."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <a
                    href="https://web-synth-studio.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#EC008C] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#D60071] transition text-sm"
                  >
                    {language === "bn" ? "ওয়েবসাইট দেখুন" : "Visit Website"}
                    <ExternalLink size={14} />
                  </a>
                  <a
                    href="https://linkedin.com/company/web-synth-studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition text-sm border border-white/20"
                  >
                    LinkedIn
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Developer Info */}
              <div className="flex-1 bg-white/5 rounded-xl p-5 md:p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#EC008C] rounded-full flex items-center justify-center">
                    <Code size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">Yaseen Arafat</h4>
                    <p className="text-xs text-white/60">Lead Developer</p>
                  </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                  {language === "bn"
                    ? "ফুল-স্ট্যাক ডেভেলপার যিনি Next.js, Express.js, Prisma ORM এবং আধুনিক প্রযুক্তি ব্যবহার করে এই প্ল্যাটফর্ম তৈরি করেছেন।"
                    : "Full-stack developer who built this platform using Next.js, Express.js, Prisma ORM, and modern technologies."}
                </p>
                <div className="flex gap-2">
                  <a
                    href="https://github.com/yeaseenarafat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#EC008C] transition text-xs font-semibold"
                  >
                    GH
                  </a>
                  <a
                    href="https://linkedin.com/in/yeaseenarafat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#EC008C] transition text-xs font-semibold"
                  >
                    in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-10 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="bg-gradient-to-r from-[#EC008C] to-[#D60071] rounded-2xl p-6 md:p-10 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {language === "bn" ? "যোগাযোগ করুন" : "Get In Touch"}
            </h2>
            <p className="text-sm md:text-base text-white/80 mb-6 max-w-2xl mx-auto">
              {language === "bn"
                ? "আপনার প্রশ্ন বা পরামর্শ আছে? আমরা সাহায্য করতে প্রস্তুত।"
                : "Have questions or suggestions? We're here to help."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#EC008C] px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition text-sm"
              >
                {language === "bn" ? "যোগাযোগ পৃষ্ঠা" : "Contact Page"}
                <ChevronRight size={16} />
              </Link>
              <a
                href="tel:16469"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition text-sm border border-white/20"
              >
                <Phone size={16} />
                16469
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
