import React, { useState } from "react";
import type { School } from "../types";
import { SchoolCard } from "./SchoolCard";
import {
  KeyRound,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Inbox
} from "lucide-react";

interface SchoolListProps {
  schools: School[];
  totalSchoolsCount: number;
  isLoading: boolean;
  apiKeyMissing: boolean;
  fetchError: string | null;
  failedDistricts: string[];
  selectedSchoolCode: string | null;
  bookmarks: string[];
  comparisonSchools: School[];
  onSelectSchool: (school: School) => void;
  onToggleBookmark: (schoolCode: string) => void;
  onToggleComparison: (school: School) => void;
  onRetry: () => void;
  onResetFilters: () => void;
}

export const SchoolList: React.FC<SchoolListProps> = ({
  schools,
  totalSchoolsCount,
  isLoading,
  apiKeyMissing,
  fetchError,
  failedDistricts,
  selectedSchoolCode,
  bookmarks,
  comparisonSchools,
  onSelectSchool,
  onToggleBookmark,
  onToggleComparison,
  onRetry,
  onResetFilters
}) => {
  const [showFailedDistricts, setShowFailedDistricts] = useState(false);

  // State ③: 학교알리미 인증키 미설정 (Section 6 ③)
  if (apiKeyMissing) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-white overflow-y-auto">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4 border border-amber-200">
          <KeyRound className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-slate-900 text-base mb-2">
          학교알리미 인증키 설정 필요
        </h3>
        <p className="text-sm text-slate-600 max-w-sm mb-4 leading-relaxed">
          학교알리미 인증키(<code>SCHOOLINFO_API_KEY</code>)가 설정되지 않았습니다.
          <br />
          AI Studio의 <strong>Settings &gt; Secrets</strong>(또는 배포 사이트의 환경변수)에 키를 추가하면 학교 목록이 나타납니다.
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 max-w-xs text-left mb-4">
          <p className="font-medium text-slate-700 mb-1">안내:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>지도는 키 없이도 즉시 확인 가능합니다.</li>
            <li>학교알리미(schoolinfo.go.kr)에서 무료 발급받은 인증키를 사용합니다.</li>
          </ul>
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          인증키 적용 후 다시 확인
        </button>
      </div>
    );
  }

  // State ④: 학교 데이터 조회 중 (Section 6 ④)
  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-white">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-semibold text-slate-900 text-sm mb-1">서울 고등학교 조회 중</p>
        <p className="text-xs text-slate-500">
          학교알리미 Open API에서 25개 자치구의 실제 고등학교 정보를 불러오고 있습니다…
        </p>
      </div>
    );
  }

  // State ⑥: 학교 데이터 전체 조회 실패 (Section 6 ⑥)
  if (fetchError && totalSchoolsCount === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-white">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3 border border-red-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-slate-900 text-base mb-1">학교알리미 연결 실패</h3>
        <p className="text-sm text-slate-600 max-w-xs mb-4">
          {fetchError}
          <br />
          네트워크 또는 학교알리미 서버 상태를 확인한 후 다시 시도해 주세요.
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden">
      {/* State ⑤: 일부 자치구 조회 실패 알림 띠 (Section 6 ⑤) */}
      {failedDistricts.length > 0 && (
        <div className="px-3.5 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900">
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              일부 지역({failedDistricts.length}개구) 조회 실패
            </span>
            <button
              onClick={() => setShowFailedDistricts(!showFailedDistricts)}
              className="text-[11px] text-amber-700 underline flex items-center gap-0.5 cursor-pointer"
            >
              {showFailedDistricts ? "접기" : "자세히 보기"}
              {showFailedDistricts ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
          {showFailedDistricts && (
            <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 text-[11px] text-amber-800">
              실패 자치구: {failedDistricts.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* State ⑦: 정상 조회됐지만 검색·필터 결과 없음 (Section 6 ⑦) */}
      {schools.length === 0 ? (
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-white">
          <Inbox className="w-10 h-10 text-slate-300 mb-2" />
          <h4 className="font-semibold text-slate-800 text-sm mb-1">
            조건에 맞는 학교가 없습니다
          </h4>
          <p className="text-xs text-slate-500 mb-4 max-w-xs">
            선택한 지역, 학교 유형, 남녀 구분 또는 검색어에 해당하는 학교가 없습니다. 필터를 줄이거나 초기화해 보세요.
          </p>
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            필터 초기화
          </button>
        </div>
      ) : (
        /* School Cards Scrollable List */
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {schools.map((school) => (
            <SchoolCard
              key={school.schoolCode}
              school={school}
              isSelected={school.schoolCode === selectedSchoolCode}
              isBookmarked={bookmarks.includes(school.schoolCode)}
              isInComparison={comparisonSchools.some(
                (c) => c.schoolCode === school.schoolCode
              )}
              onSelect={onSelectSchool}
              onToggleBookmark={onToggleBookmark}
              onToggleComparison={onToggleComparison}
            />
          ))}
        </div>
      )}
    </div>
  );
};
