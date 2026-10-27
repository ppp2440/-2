import React, { useState, useEffect, useMemo, useCallback } from "react";
import type {
  School,
  SchoolTypeCategory,
  GenderCategory,
  FoundationCategory,
  SchoolsApiResponse
} from "./types";
import { TopBar } from "./components/TopBar";
import { FilterBar } from "./components/FilterBar";
import { SchoolList } from "./components/SchoolList";
import { SchoolMap } from "./components/SchoolMap";
import { SchoolDetailModal } from "./components/SchoolDetailModal";
import { ComparisonModal } from "./components/ComparisonModal";
import { AboutModal } from "./components/AboutModal";
import { MapPin, List, Map as MapIcon, Star } from "lucide-react";

export function App() {
  // Primary school data state
  const [schools, setSchools] = useState<School[]>([]);
  const [totalSchoolsCount, setTotalSchoolsCount] = useState(0);
  const [successDistricts, setSuccessDistricts] = useState(0);
  const [failedDistricts, setFailedDistricts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("전체");
  const [selectedType, setSelectedType] = useState<SchoolTypeCategory>("전체");
  const [selectedGender, setSelectedGender] = useState<GenderCategory>("전체");
  const [selectedFoundation, setSelectedFoundation] = useState<FoundationCategory>("전체");

  // Selection & Navigation
  const [selectedSchoolCode, setSelectedSchoolCode] = useState<string | null>(null);
  const [detailSchool, setDetailSchool] = useState<School | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<"map" | "bookmarks">("map");
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  // Modals state
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Bookmarks (Section 37 - localStorage)
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("seoul_school_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Comparison items (Section 36 - max 4 schools)
  const [comparisonCodes, setComparisonCodes] = useState<string[]>([]);

  // Toast notification for schools with no location (Section 25)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("seoul_school_bookmarks", JSON.stringify(bookmarks));
    } catch (e) {
      console.warn("로컬스토리지 저장 실패:", e);
    }
  }, [bookmarks]);

  // Fetch schools from backend server (Section 7, 8, 38)
  const fetchSchools = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const url = forceRefresh ? "/api/schools?refresh=true" : "/api/schools";
      const res = await fetch(url);

      if (res.status === 503) {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error === "SCHOOLINFO_API_KEY_MISSING") {
          setApiKeyMissing(true);
          setSchools([]);
          setTotalSchoolsCount(0);
          return;
        }
      }

      if (!res.ok) {
        throw new Error(`학교 정보를 불러오지 못했습니다. (HTTP ${res.status})`);
      }

      const data: SchoolsApiResponse = await res.json();
      setApiKeyMissing(false);
      setSchools(data.schools || []);
      setTotalSchoolsCount(data.totalCount || 0);
      setSuccessDistricts(data.successDistricts || 0);
      setFailedDistricts(data.failedDistricts || []);
    } catch (err: any) {
      console.error("학교 조회 실패:", err);
      setFetchError(err?.message || "학교알리미 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools(false);
  }, [fetchSchools]);

  // Toggle bookmark handler
  const handleToggleBookmark = useCallback((schoolCode: string) => {
    setBookmarks((prev) =>
      prev.includes(schoolCode)
        ? prev.filter((c) => c !== schoolCode)
        : [...prev, schoolCode]
    );
  }, []);

  // Toggle comparison handler (max 4)
  const handleToggleComparison = useCallback(
    (school: School) => {
      setComparisonCodes((prev) => {
        if (prev.includes(school.schoolCode)) {
          return prev.filter((c) => c !== school.schoolCode);
        }
        if (prev.length >= 4) {
          showToast("비교함에는 최대 4개 학교까지만 추가할 수 있습니다.");
          return prev;
        }
        showToast(`'${school.schoolName}'이(가) 비교함에 추가되었습니다.`);
        return [...prev, school.schoolCode];
      });
    },
    [showToast]
  );

  const handleRemoveFromComparison = useCallback((schoolCode: string) => {
    setComparisonCodes((prev) => prev.filter((c) => c !== schoolCode));
  }, []);

  const handleClearComparison = useCallback(() => {
    setComparisonCodes([]);
  }, []);

  // Filter logic (Section 21, 22, 23)
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      // Bookmarks view
      if (activeNavTab === "bookmarks" && !bookmarks.includes(school.schoolCode)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase().replace(/\s/g, "");
        const name = school.schoolName.toLowerCase().replace(/\s/g, "");
        if (!name.includes(q)) return false;
      }

      // District filter
      if (selectedDistrict !== "전체" && school.district !== selectedDistrict) {
        return false;
      }

      // School Type filter
      if (selectedType !== "전체" && school.schoolType !== selectedType) {
        return false;
      }

      // Gender filter
      if (selectedGender !== "전체" && school.genderType !== selectedGender) {
        return false;
      }

      // Foundation filter
      if (selectedFoundation !== "전체" && school.foundationType !== selectedFoundation) {
        return false;
      }

      return true;
    });
  }, [
    schools,
    activeNavTab,
    bookmarks,
    searchQuery,
    selectedDistrict,
    selectedType,
    selectedGender,
    selectedFoundation
  ]);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedDistrict("전체");
    setSelectedType("전체");
    setSelectedGender("전체");
    setSelectedFoundation("전체");
  }, []);

  // School selection handler (card click or marker click)
  const handleSelectSchool = useCallback(
    (school: School) => {
      setSelectedSchoolCode(school.schoolCode);
      setDetailSchool(school);

      if (!school.hasLocation) {
        showToast("이 학교는 위치정보가 없어 지도에 표시되지 않습니다.");
      }
    },
    [showToast]
  );

  const comparisonSchools = useMemo(() => {
    return schools.filter((s) => comparisonCodes.includes(s.schoolCode));
  }, [schools, comparisonCodes]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* 1. Top Navigation Bar (Top Bar Contract) */}
      <TopBar
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab);
          if (tab === "bookmarks") {
            setMobileView("list");
          }
        }}
        bookmarksCount={bookmarks.length}
        comparisonCount={comparisonCodes.length}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onRefresh={() => fetchSchools(true)}
        isRefreshing={isLoading}
      />

      {/* 2. Subtitle & Status Banner */}
      <div className="bg-slate-900 text-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">서울 고교 지도</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 hidden md:inline">
            지도에서 찾고, 공시정보로 비교하는 서울 고등학교 안내
          </span>
        </div>

        <div className="flex items-center gap-3">
          {apiKeyMissing ? (
            <span className="text-amber-400 font-medium">학교알리미 인증키 설정 필요</span>
          ) : isLoading ? (
            <span className="text-slate-300">서울 고등학교 조회 중…</span>
          ) : failedDistricts.length > 0 ? (
            <span className="text-amber-300">
              서울 고등학교 <strong className="text-white tabular-nums">{totalSchoolsCount}</strong>개교 · 일부 지역 조회 실패
            </span>
          ) : totalSchoolsCount > 0 ? (
            <span className="text-slate-300">
              서울 고등학교 <strong className="text-white tabular-nums">{totalSchoolsCount}</strong>개교
            </span>
          ) : null}
        </div>
      </div>

      {/* 3. Filter Bar (Dynamic counts, search, school type, gender, foundation) */}
      <FilterBar
        schools={schools}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDistrict={selectedDistrict}
        onDistrictChange={setSelectedDistrict}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
        selectedFoundation={selectedFoundation}
        onFoundationChange={setSelectedFoundation}
        onResetFilters={handleResetFilters}
        filteredCount={filteredSchools.length}
        totalCount={totalSchoolsCount}
      />

      {/* Mobile Tab Switcher [지도] [목록] (Section 20) */}
      <div className="flex sm:hidden border-b border-slate-200 bg-white shrink-0">
        <button
          onClick={() => setMobileView("map")}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            mobileView === "map"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500"
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          지도 보기
        </button>
        <button
          onClick={() => setMobileView("list")}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            mobileView === "list"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          학교 목록 ({filteredSchools.length})
        </button>
      </div>

      {/* 4. Main Body: Split View (Left 35% List, Right 65% Leaflet Map) */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Side: School List (~35% on desktop) */}
        <div
          className={`w-full sm:w-[380px] lg:w-[420px] h-full shrink-0 flex flex-col border-r border-slate-200 bg-white ${
            mobileView === "map" ? "hidden sm:flex" : "flex"
          }`}
        >
          <SchoolList
            schools={filteredSchools}
            totalSchoolsCount={totalSchoolsCount}
            isLoading={isLoading}
            apiKeyMissing={apiKeyMissing}
            fetchError={fetchError}
            failedDistricts={failedDistricts}
            selectedSchoolCode={selectedSchoolCode}
            bookmarks={bookmarks}
            comparisonSchools={comparisonSchools}
            onSelectSchool={handleSelectSchool}
            onToggleBookmark={handleToggleBookmark}
            onToggleComparison={handleToggleComparison}
            onRetry={() => fetchSchools(true)}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Right Side: Leaflet Map (~65% on desktop) */}
        <div
          className={`flex-1 h-full min-h-[360px] relative overflow-hidden ${
            mobileView === "list" ? "hidden sm:flex" : "flex"
          }`}
        >
          <SchoolMap
            schools={filteredSchools}
            selectedSchoolCode={selectedSchoolCode}
            onSelectSchool={handleSelectSchool}
            selectedDistrict={selectedDistrict}
          />
        </div>
      </main>

      {/* Toast Notification (e.g. for schools without coordinates, Section 25) */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] bg-slate-900/95 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5. Modals */}
      {/* School Detail Modal (Lazy loaded, Section 28 - 35) */}
      {detailSchool && (
        <SchoolDetailModal
          school={detailSchool}
          onClose={() => setDetailSchool(null)}
          isBookmarked={bookmarks.includes(detailSchool.schoolCode)}
          isInComparison={comparisonCodes.includes(detailSchool.schoolCode)}
          onToggleBookmark={handleToggleBookmark}
          onToggleComparison={handleToggleComparison}
        />
      )}

      {/* School Comparison Modal (Up to 4 schools, Section 36) */}
      {isComparisonOpen && (
        <ComparisonModal
          schools={comparisonSchools}
          onClose={() => setIsComparisonOpen(false)}
          onRemove={handleRemoveFromComparison}
          onClear={handleClearComparison}
          onSelectSchool={handleSelectSchool}
        />
      )}

      {/* About & Attribution Modal (Section 5, 18) */}
      {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}
    </div>
  );
}

export default App;
