import React from "react";
import { Star, Scale, Info, RotateCw } from "lucide-react";

interface TopBarProps {
  activeTab: "map" | "bookmarks";
  onTabChange: (tab: "map" | "bookmarks") => void;
  bookmarksCount: number;
  comparisonCount: number;
  onOpenComparison: () => void;
  onOpenAbout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  bookmarksCount,
  comparisonCount,
  onOpenComparison,
  onOpenAbout,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-8 shrink-0 z-20">
      {/* Zone 1: Single text element Brand wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            高
          </span>
          서울 고교 지도
        </a>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="flex items-center gap-5 text-xs font-medium text-slate-600 shrink-0">
        <button
          onClick={() => onTabChange("map")}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "map" ? "text-blue-600 font-bold" : ""
          }`}
        >
          전체 지도
        </button>

        <button
          onClick={() => onTabChange("bookmarks")}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
            activeTab === "bookmarks" ? "text-blue-600 font-bold" : ""
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>즐겨찾기</span>
          <span className="tabular-nums">({bookmarksCount})</span>
        </button>

        <button
          onClick={onOpenComparison}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>학교 비교</span>
          <span className="tabular-nums">({comparisonCount})</span>
        </button>

        <button
          onClick={onOpenAbout}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>서비스 안내</span>
        </button>
      </nav>

      {/* Zone 3: 1 Primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          title="학교알리미 데이터 새로고침"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">새로고침</span>
        </button>
      </div>
    </header>
  );
};
