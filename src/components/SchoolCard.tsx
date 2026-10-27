import React from "react";
import type { School } from "../types";
import { Star, MapPinOff, ArrowRight, Check } from "lucide-react";
import { SCHOOL_TYPE_COLORS } from "../map/iconHelper";

interface SchoolCardProps {
  school: School;
  isSelected: boolean;
  isBookmarked: boolean;
  isInComparison: boolean;
  onSelect: (school: School) => void;
  onToggleBookmark: (schoolCode: string) => void;
  onToggleComparison: (school: School) => void;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  isSelected,
  isBookmarked,
  isInComparison,
  onSelect,
  onToggleBookmark,
  onToggleComparison
}) => {
  const typeStyle = SCHOOL_TYPE_COLORS[school.schoolType] || SCHOOL_TYPE_COLORS["기타"];

  return (
    <div
      onClick={() => onSelect(school)}
      className={`p-3.5 rounded-lg border transition-all cursor-pointer relative bg-white ${
        isSelected
          ? "border-blue-600 ring-2 ring-blue-100 shadow-sm"
          : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
      }`}
    >
      {/* Top Metadata Row: Clean Unboxed Text with Separators */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
          <span
            className="font-medium text-xs px-1.5 py-0.5 rounded text-white"
            style={{ backgroundColor: typeStyle.bg }}
          >
            {school.schoolType}
          </span>
          <span className="text-slate-700 font-medium">{school.district}</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>{school.genderType}</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>{school.foundationType}</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            title={isBookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            onClick={() => onToggleBookmark(school.schoolCode)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isBookmarked
                ? "text-amber-500 hover:text-amber-600 bg-amber-50"
                : "text-slate-400 hover:text-amber-500 hover:bg-slate-50"
            }`}
          >
            <Star className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* School Name */}
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <h3 className="font-semibold text-slate-900 text-base leading-snug tracking-tight">
          {school.schoolName}
        </h3>
        {!school.hasLocation && (
          <span className="shrink-0 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.2 flex items-center gap-1">
            <MapPinOff className="w-3 h-3" />
            위치정보 없음
          </span>
        )}
      </div>

      {/* Address & Edu Office */}
      <div className="text-xs text-slate-500 mb-2 truncate">
        {school.address || "주소 정보 없음"}
        {school.eduOffice && <span className="ml-1 text-slate-400">({school.eduOffice})</span>}
      </div>

      {/* Stats preview or detail check prompt (Section 26) */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-3 text-slate-600">
          {school.studentCount ? (
            <span>
              총 학생: <strong className="font-medium text-slate-900 tabular-nums">{school.studentCount.toLocaleString()}</strong>명
            </span>
          ) : (
            <span className="text-slate-500">상세정보 확인 가능</span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onToggleComparison(school)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              isInComparison
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            {isInComparison ? (
              <>
                <Check className="w-3 h-3" /> 비교함 담김
              </>
            ) : (
              "+ 비교함"
            )}
          </button>

          <span className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-0.5 text-[11px]">
            상세 <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
