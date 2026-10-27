import React from "react";
import type {
  School,
  SchoolTypeCategory,
  GenderCategory,
  FoundationCategory
} from "../types";
import { Search, RotateCcw, X } from "lucide-react";
import { SEOUL_DISTRICTS } from "../../server/schoolinfo";

interface FilterBarProps {
  schools: School[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDistrict: string;
  onDistrictChange: (d: string) => void;
  selectedType: SchoolTypeCategory;
  onTypeChange: (t: SchoolTypeCategory) => void;
  selectedGender: GenderCategory;
  onGenderChange: (g: GenderCategory) => void;
  selectedFoundation: FoundationCategory;
  onFoundationChange: (f: FoundationCategory) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

const SCHOOL_TYPES: SchoolTypeCategory[] = [
  "전체",
  "일반고",
  "자사고",
  "특목고",
  "영재고",
  "특성화고",
  "학력인정고",
  "기타"
];

const GENDER_TYPES: GenderCategory[] = ["전체", "남학교", "여학교", "남녀공학"];

const FOUNDATION_TYPES: FoundationCategory[] = ["전체", "공립", "사립", "국립", "기타"];

export const FilterBar: React.FC<FilterBarProps> = ({
  schools,
  searchQuery,
  onSearchChange,
  selectedDistrict,
  onDistrictChange,
  selectedType,
  onTypeChange,
  selectedGender,
  onGenderChange,
  selectedFoundation,
  onFoundationChange,
  onResetFilters,
  filteredCount,
  totalCount
}) => {
  // Compute dynamic school count per district from current loaded data (Section 21)
  const districtCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of schools) {
      counts[s.district] = (counts[s.district] || 0) + 1;
    }
    return counts;
  }, [schools]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedDistrict !== "전체" ||
    selectedType !== "전체" ||
    selectedGender !== "전체" ||
    selectedFoundation !== "전체";

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 flex flex-col gap-2.5">
      {/* Search Input & District Selector Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="학교명 검색 (예: 경희고, 하나고, 서울과고)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* District Dropdown with dynamic counts */}
        <div className="shrink-0 flex items-center gap-2">
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            aria-label="지역 선택"
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
          >
            <option value="전체">
              서울 전체 ({totalCount > 0 ? `${totalCount}개교` : "25개 자치구"})
            </option>
            {SEOUL_DISTRICTS.map((d) => {
              const count = districtCounts[d.name] || 0;
              return (
                <option key={d.code} value={d.name}>
                  {d.name} {count > 0 ? `(${count}개교)` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Segmented Filter Controls Row (Functional buttons with click handlers) */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600">
        {/* School Types */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">유형</span>
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md flex-wrap">
            {SCHOOL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  selectedType === type
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Gender Types */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">남녀</span>
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md flex-wrap">
            {GENDER_TYPES.map((gender) => (
              <button
                key={gender}
                onClick={() => onGenderChange(gender)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  selectedGender === gender
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Foundation Types */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">설립</span>
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md flex-wrap">
            {FOUNDATION_TYPES.map((found) => (
              <button
                key={found}
                onClick={() => onFoundationChange(found)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  selectedFoundation === found
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {found}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applied Filters & Result Count Row (Section 20) */}
      <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-700">
            조건에 맞는 학교 <strong className="text-blue-600 font-bold tabular-nums">{filteredCount}</strong>개
          </span>

          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-slate-300">|</span>
              <span className="text-[11px] text-slate-400">적용된 조건:</span>
              {selectedDistrict !== "전체" && (
                <span className="text-slate-700 font-medium">{selectedDistrict}</span>
              )}
              {selectedType !== "전체" && (
                <span className="text-slate-700 font-medium">· {selectedType}</span>
              )}
              {selectedGender !== "전체" && (
                <span className="text-slate-700 font-medium">· {selectedGender}</span>
              )}
              {selectedFoundation !== "전체" && (
                <span className="text-slate-700 font-medium">· {selectedFoundation}</span>
              )}
              {searchQuery && (
                <span className="text-slate-700 font-medium">· 검색: "{searchQuery}"</span>
              )}
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            초기화
          </button>
        )}
      </div>
    </div>
  );
};
