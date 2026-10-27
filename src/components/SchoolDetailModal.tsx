import React, { useEffect, useState } from "react";
import type { School, SchoolDetailData } from "../types";
import {
  X,
  Star,
  ExternalLink,
  Phone,
  MapPin,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Sparkles,
  Check,
  AlertCircle
} from "lucide-react";
import { SCHOOL_TYPE_COLORS } from "../map/iconHelper";

interface SchoolDetailModalProps {
  school: School | null;
  onClose: () => void;
  isBookmarked: boolean;
  isInComparison: boolean;
  onToggleBookmark: (schoolCode: string) => void;
  onToggleComparison: (school: School) => void;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  onClose,
  isBookmarked,
  isInComparison,
  onToggleBookmark,
  onToggleComparison
}) => {
  const [detailData, setDetailData] = useState<SchoolDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "students" | "programs" | "official">("summary");

  // Lazy load detailed disclosure data on-demand (Section 27)
  useEffect(() => {
    if (!school) {
      setDetailData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const url = `/api/school-detail?schoolCode=${encodeURIComponent(school.schoolCode)}&districtCode=${encodeURIComponent(school.districtCode)}`;

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`자료를 불러오지 못했습니다 (HTTP ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setDetailData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || "자료를 불러오지 못했습니다");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [school]);

  if (!school) return null;

  const typeStyle = SCHOOL_TYPE_COLORS[school.schoolType] || SCHOOL_TYPE_COLORS["기타"];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
              <span
                className="font-medium px-2 py-0.5 rounded text-white text-xs"
                style={{ backgroundColor: typeStyle.bg }}
              >
                {school.schoolType}
              </span>
              <span className="font-semibold text-slate-700">{school.district}</span>
              <span aria-hidden="true">·</span>
              <span>{school.genderType}</span>
              <span aria-hidden="true">·</span>
              <span>{school.foundationType}</span>
              {school.eduOffice && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-blue-700 font-medium">{school.eduOffice}</span>
                </>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {school.schoolName}
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Bookmark button */}
            <button
              type="button"
              onClick={() => onToggleBookmark(school.schoolCode)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isBookmarked
                  ? "bg-amber-50 text-amber-500 border-amber-200"
                  : "bg-white text-slate-400 border-slate-200 hover:text-amber-500"
              }`}
              title={isBookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              <Star className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
            </button>

            {/* Compare button */}
            <button
              type="button"
              onClick={() => onToggleComparison(school)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isInComparison
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {isInComparison ? (
                <>
                  <Check className="w-4 h-4 text-blue-600" />
                  비교함 담김
                </>
              ) : (
                "+ 비교함 추가"
              )}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-5 pt-2 border-b border-slate-200 bg-white text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "summary"
                ? "border-blue-600 text-blue-700 font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            기본정보
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "students"
                ? "border-blue-600 text-blue-700 font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            학생 및 교원 현황
          </button>
          <button
            onClick={() => setActiveTab("programs")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "programs"
                ? "border-blue-600 text-blue-700 font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            특색사업 및 동아리
          </button>
          <button
            onClick={() => setActiveTab("official")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "official"
                ? "border-blue-600 text-blue-700 font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            공시자료 원문
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          {/* Tab 1: Summary */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              {/* Contact & Location Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">도로명 주소: </span>
                    <span>{school.address || "주소 정보 없음"}</span>
                    {!school.hasLocation && (
                      <span className="ml-2 text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        위치좌표 없음
                      </span>
                    )}
                  </div>
                </div>

                {school.phone && (
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900">대표전화: </span>
                      <a href={`tel:${school.phone}`} className="text-blue-600 hover:underline font-mono">
                        {school.phone}
                      </a>
                    </div>
                  </div>
                )}

                {school.homepage && (
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900">학교 홈페이지: </span>
                      <a
                        href={school.homepage.startsWith("http") ? school.homepage : `http://${school.homepage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {school.homepage}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5 text-slate-700">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">관할 기관: </span>
                    <span>서울특별시교육청 · {school.eduOffice || "해당 교육지원청"}</span>
                  </div>
                </div>
              </div>

              {/* Fast Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                  <div className="text-xs text-slate-500 mb-0.5">학교 고유코드</div>
                  <div className="font-mono text-sm font-semibold text-slate-800">{school.schoolCode}</div>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                  <div className="text-xs text-slate-500 mb-0.5">설립 구분</div>
                  <div className="text-sm font-semibold text-slate-800">{school.foundationType}</div>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                  <div className="text-xs text-slate-500 mb-0.5">성별 구분</div>
                  <div className="text-sm font-semibold text-slate-800">{school.genderType}</div>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                  <div className="text-xs text-slate-500 mb-0.5">학교 유형</div>
                  <div className="text-sm font-semibold text-blue-600">{school.schoolType}</div>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  본 정보는 교육부 학교알리미(학교정보공시)의 공식 공시데이터를 기반으로 실시간 제공됩니다. 상세 탭에서 학생수, 특색사업 및 원문 공시자료를 확인하실 수 있습니다.
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Students & Teachers */}
          {activeTab === "students" && (
            <div className="space-y-4">
              {loading ? (
                <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                  학생 및 교원 공시자료를 조회하고 있습니다…
                </div>
              ) : error ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : detailData?.studentStats ? (
                <div className="space-y-4">
                  {/* Students Overview KPI */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">전체 학생 수</div>
                      <div className="text-lg font-bold text-slate-900 tabular-nums">
                        {detailData.studentStats.totalStudents?.toLocaleString() ?? "-"}명
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">전체 학급 수</div>
                      <div className="text-lg font-bold text-slate-900 tabular-nums">
                        {detailData.studentStats.totalClasses ?? "-"}학급
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">학급당 학생 수</div>
                      <div className="text-lg font-bold text-blue-600 tabular-nums">
                        {detailData.studentStats.studentsPerClass ?? "-"}명
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">공시자료 기준 계산값</div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">전체 교원 수</div>
                      <div className="text-lg font-bold text-slate-900 tabular-nums">
                        {detailData.teacherStats?.totalTeachers ?? "-"}명
                      </div>
                    </div>
                  </div>

                  {/* Gender Breakdown (Section 29) */}
                  {(detailData.studentStats.maleStudents !== undefined ||
                    detailData.studentStats.femaleStudents !== undefined) && (
                    <div className="border border-slate-200 rounded-lg p-3 bg-white">
                      <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        성별 학생 구성
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-center text-xs">
                        <div className="p-2 bg-blue-50/50 rounded border border-blue-100">
                          <span className="text-slate-500">남학생: </span>
                          <strong className="text-blue-700 tabular-nums">
                            {detailData.studentStats.maleStudents?.toLocaleString() ?? 0}명
                          </strong>
                        </div>
                        <div className="p-2 bg-pink-50/50 rounded border border-pink-100">
                          <span className="text-slate-500">여학생: </span>
                          <strong className="text-pink-700 tabular-nums">
                            {detailData.studentStats.femaleStudents?.toLocaleString() ?? 0}명
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grade Level Breakdown (Section 29) */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                      학년별 학생 수
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded">
                        <div className="text-slate-500 mb-0.5">1학년</div>
                        <div className="font-semibold text-slate-800 tabular-nums">
                          {detailData.studentStats.grade1Students ? `${detailData.studentStats.grade1Students.toLocaleString()}명` : "공시 확인"}
                        </div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <div className="text-slate-500 mb-0.5">2학년</div>
                        <div className="font-semibold text-slate-800 tabular-nums">
                          {detailData.studentStats.grade2Students ? `${detailData.studentStats.grade2Students.toLocaleString()}명` : "공시 확인"}
                        </div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <div className="text-slate-500 mb-0.5">3학년</div>
                        <div className="font-semibold text-slate-800 tabular-nums">
                          {detailData.studentStats.grade3Students ? `${detailData.studentStats.grade3Students.toLocaleString()}명` : "공시 확인"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  해당 학교의 학생 현황 공시자료를 조회 중이거나 공시 항목이 등록되지 않았습니다.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Special Programs & Clubs */}
          {activeTab === "programs" && (
            <div className="space-y-4">
              {loading ? (
                <div className="p-8 text-center text-slate-500 text-xs">특색사업 및 동아리 정보를 조회하고 있습니다…</div>
              ) : (
                <>
                  {/* Special programs */}
                  <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
                    <h4 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      교육운영 특색사업 계획 (Section 32)
                    </h4>
                    {detailData?.features?.specialPrograms && detailData.features.specialPrograms.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {detailData.features.specialPrograms.map((prog, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {prog}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">
                        공시된 별도 특색사업 명칭이 없거나 일반 교육과정에 통합 운영되고 있습니다.
                      </p>
                    )}
                  </div>

                  {/* Clubs */}
                  <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
                    <h4 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      동아리 활동 현황 (Section 32)
                    </h4>
                    {detailData?.features?.clubs && detailData.features.clubs.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {detailData.features.clubs.map((c, idx) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded flex items-center justify-between">
                            <span className="font-medium text-slate-800">{c.name}</span>
                            {c.count && c.count > 0 ? (
                              <span className="text-[11px] text-slate-500 tabular-nums">{c.count}명 참여</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        동아리 상세 목록은 학교알리미 공시 원문에서 열람하실 수 있습니다.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 4: Official Disclosures */}
          {activeTab === "official" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-3">
                <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  학교알리미(학교정보공시) 공식 원문 열람
                </div>
                <p className="leading-relaxed">
                  학교알리미 Open API에서 제공하는 교육과정 편성표, 입학전형 요강, 교과별 학업성취 사항 및 졸업생 진로 현황의 공식 전문과 PDF/HWP 원문 자료를 확인하실 수 있습니다.
                </p>
                <div className="pt-2">
                  <a
                    href={`https://www.schoolinfo.go.kr`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    학교알리미 공식 사이트 바로가기 <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {detailData?.disclosures && detailData.disclosures.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-800">조회된 공시 항목 ({detailData.disclosures.length}종)</h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
                    {detailData.disclosures.map((d) => (
                      <div key={d.apiType} className="p-2.5 flex items-center justify-between">
                        <span className="font-medium text-slate-800">{d.title}</span>
                        <span className="text-slate-400 font-mono text-[11px]">코드: {d.apiType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>정보공시 학교코드: <span className="font-mono font-medium text-slate-700">{school.schoolCode}</span></div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
