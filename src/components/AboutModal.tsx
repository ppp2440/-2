import React from "react";
import { X, ExternalLink, ShieldCheck, Map, Database } from "lucide-react";

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              高
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">서울 고교 지도 안내</h2>
              <p className="text-xs text-slate-500">지도에서 찾고, 공시정보로 비교하는 서울 고등학교 안내</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* Target and Purpose */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-1.5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              서비스 목적 및 활용 안내
            </h3>
            <p className="text-slate-600">
              이 앱은 중학생, 학부모, 담임교사, 진로진학상담교사가 서울특별시 25개 자치구 내 고등학교의 위치와 유형, 남녀공학 여부, 설립 구분, 공식 교육정보공시 자료를 지도상에서 탐색하고 비교할 수 있도록 제작된 공공데이터 교육용 웹 애플리케이션입니다.
            </p>
          </div>

          {/* School Data Source (Section 0, 7) */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-1.5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
              <Database className="w-4 h-4 text-blue-600" />
              학교 공시데이터 출처
            </h3>
            <p className="text-slate-600">
              본 서비스의 모든 학교 사실정보는 <strong>교육부 학교알리미(학교정보공시) Open API</strong>의 공식 실시간 데이터만을 사용하며, 가상·임의의 학교 데이터를 일절 포함하지 않습니다.
            </p>
            <div className="pt-1">
              <a
                href="https://www.schoolinfo.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                학교알리미(schoolinfo.go.kr) 공식 포털 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Map & Boundaries Attribution (Section 5 & 18) */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
              <Map className="w-4 h-4 text-blue-600" />
              지도 및 행정구역 경계 데이터 출처
            </h3>
            <div className="space-y-1 text-slate-600">
              <p>
                <strong>배경지도:</strong> OpenStreetMap 표준 타일
                <br />
                <span className="text-[11px] text-slate-500">
                  &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OpenStreetMap</a> contributors
                  (OSM 타일 이용 정책을 준수하며 필요한 뷰포트 타일만을 요청합니다)
                </span>
              </p>
              <p className="pt-1">
                <strong>서울 자치구 및 교육지원청 경계:</strong>
                <br />
                <span className="text-[11px] text-slate-500">
                  출처: southkorea/seoul-maps (<a href="https://github.com/southkorea/seoul-maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">github.com/southkorea/seoul-maps</a>)
                  <br />
                  원자료: 통계청 센서스용 행정구역경계 2013 (단순화본)
                  <br />
                  라이선스: Apache License 2.0
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
