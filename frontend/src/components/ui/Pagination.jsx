"use client";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage = 10 }) {
  if (totalPages <= 1) return null;
  const { t } = useLanguage();

  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
      <p className="text-xs text-gray-500">
        {t.showingXofY
          ? t.showingXofY.replace("{from}", from).replace("{to}", to).replace("{total}", totalItems)
          : `Showing ${from}-${to} of ${totalItems}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E5E7EB] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {t.previous || "Prev"}
        </button>
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={`dots-${idx}`} className="px-2 py-1.5 text-xs text-gray-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] px-2 py-1.5 text-xs font-medium rounded-lg border transition ${
                currentPage === page
                  ? "bg-[#EC008C] text-white border-[#EC008C]"
                  : "border-[#E5E7EB] text-gray-600 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E5E7EB] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {t.next || "Next"}
        </button>
      </div>
    </div>
  );
}
