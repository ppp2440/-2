import React from "react";
import type { School } from "../types";
import { X, Trash2, ExternalLink, ArrowRight } from "lucide-react";
import { SCHOOL_TYPE_COLORS } from "../map/iconHelper";

interface ComparisonModalProps {
  schools: School[];
  onClose: () => void;
  onRemove: (schoolCode: string) => void;
  onClear: () => void;
  onSelectSchool: (school: School) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  schools,
  onClose,
  onRemove,
  onClear,
  onSelectSchool
}) => {
  if (schools.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              고등학교 비교 ({schools.length}/4)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              선택한 학교들의 핵심 공시정보와 환경을 한눈에 비교합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              전체 비우기
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-5">
          <table className="w-full text-xs text-left border-collapse border border-slate-200 min-w-[640px]">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200">
                <th className="p-3 font-semibold text-slate-600 w-32 border-r border-slate-200">
                  항목
                </th>
                {schools.map((s) => {
                  const typeStyle = SCHOOL_TYPE_COLORS[s.schoolType] || SCHOOL_TYPE_COLORS["기타"];
                  return (
                    <th key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0 relative">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span
                          className="font-medium px-1.5 py-0.5 rounded text-white text-[10px]"
                          style={{ backgroundColor: typeStyle.bg }}
                        >
                          {s.schoolType}
                        </span>
                        <button
                          onClick={() => onRemove(s.schoolCode)}
                          className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                          title="비교함에서 제거"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="font-bold text-sm text-slate-900 leading-snug">
                        {s.schoolName}
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onSelectSchool(s);
                        }}
                        className="text-[11px] text-blue-600 hover:underline mt-1 flex items-center gap-0.5 cursor-pointer"
                      >
                        상세화면 보기 <ArrowRight className="w-3 h-3" />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              <tr>
                <td className="p-2.5 font-medium bg-slate-50 border-r border-slate-200">지역 (구)</td>
                {schools.map((s) => (
                  <td key={s.schoolCode} className="p-2.5 border-r border-slate-200 last:border-r-0 font-medium">
                    {s.district}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2.5 font-medium bg-slate-50 border-r border-slate-200">관할 교육지원청</td>
                {schools.map((s) => (
                  <td key={s.schoolCode} className="p-2.5 border-r border-slate-200 last:border-r-0">
                    {s.eduOffice || "서울특별시교육청"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2.5 font-medium bg-slate-50 border-r border-slate-200">남녀구분</td>
                {schools.map((s) => (
                  <td key={s.schoolCode} className="p-2.5 border-r border-slate-200 last:border-r-0 font-medium">
                    {s.genderType}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2.5 font-medium bg-slate-50 border-r border-slate-200">설립구분</td>
                {schools.map((s) => (
                  <td key={s.schoolCode} className="p-2.5 border-r border-slate-200 last:border-r-0">
                    {s.foundationType}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2.5 font-medium bg-slate-50 border-r border-slate-200">학생 규모</td>
                {schools.map((s) => (
                  <td key={s.schoolCode} className="p-2.5 border-r border-slate-200 last:border-r-0 tabular-nums">
                    {s.studentCount ? `${s.studentCount.toLocaleString()}명` : "상세공시 열람"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2.5 font-medium bg-slate-50 border-r border-slate-200">주소</td>
                {schools.map((s) => (
                  <td key={s.schoolCode} className="p-2.5 border-r border-slate-200 last:border-r-0 text-[11px] text-slate-600">
                    {s.address}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2.5 font-medium bg-slate-50 border-r border-slate-200">전화번호</td>
                {schools.map((s) => (
                  <td key={s.schoolCode} className="p-2.5 border-r border-slate-200 last:border-r-0 font-mono text-[11px]">
                    {s.phone ? (
                      <a href={`tel:${s.phone}`} className="text-blue-600 hover:underline">
                        {s.phone}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2.5 font-medium bg-slate-50 border-r border-slate-200">홈페이지</td>
                {schools.map((s) => (
                  <td key={s.schoolCode} className="p-2.5 border-r border-slate-200 last:border-r-0">
                    {s.homepage ? (
                      <a
                        href={s.homepage.startsWith("http") ? s.homepage : `http://${s.homepage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        방문하기 <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>최대 4개 학교까지 동시에 비교 가능합니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
