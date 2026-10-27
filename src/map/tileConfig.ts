/**
 * 타일 제공자 설정
 * OpenStreetMap 표준 타일 설정을 단일 지점에서 관리합니다.
 */
export const TILE_CONFIG = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  maxZoom: 19,
  minZoom: 10
};

/**
 * 서울 중심 및 기본 뷰 경계 (위도·경도)
 * Section 4:
 * 남서 [37.413, 126.734]
 * 북동 [37.715, 127.269]
 */
export const SEOUL_BOUNDS: [[number, number], [number, number]] = [
  [37.413, 126.734],
  [37.715, 127.269]
];

// 사방으로 약 0.15도 여유를 둔 최대 이동 허용 범위 (maxBounds)
export const SEOUL_MAX_BOUNDS: [[number, number], [number, number]] = [
  [37.263, 126.584],
  [37.865, 127.419]
];
