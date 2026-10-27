import L from "leaflet";
import type { School } from "../types";

export const SCHOOL_TYPE_COLORS: Record<string, { bg: string; text: string; label: string; border: string }> = {
  일반고: { bg: "#2563eb", text: "#ffffff", label: "일반고", border: "#1d4ed8" },
  자사고: { bg: "#7c3aed", text: "#ffffff", label: "자사고", border: "#6d28d9" },
  특목고: { bg: "#ea580c", text: "#ffffff", label: "특목고", border: "#c2410c" },
  영재고: { bg: "#059669", text: "#ffffff", label: "영재고", border: "#047857" },
  특성화고: { bg: "#0891b2", text: "#ffffff", label: "특성화고", border: "#0e7490" },
  학력인정고: { bg: "#475569", text: "#ffffff", label: "학력인정고", border: "#334155" },
  기타: { bg: "#64748b", text: "#ffffff", label: "기타", border: "#475569" }
};

export function getGenderChar(gender: School["genderType"]): string {
  switch (gender) {
    case "남학교":
      return "남";
    case "여학교":
      return "여";
    case "남녀공학":
      return "공";
    default:
      return "·";
  }
}

export function createSchoolDivIcon(school: School, isSelected = false): L.DivIcon {
  const typeStyle = SCHOOL_TYPE_COLORS[school.schoolType] || SCHOOL_TYPE_COLORS["기타"];
  const char = getGenderChar(school.genderType);

  const isPrivate = school.foundationType === "사립";
  const isNational = school.foundationType === "국립";

  const size = isSelected ? 36 : 28;
  const fontSize = isSelected ? "13px" : "11px";
  const borderWidth = isSelected ? "3px" : isPrivate ? "2px" : "1.5px";
  const borderColor = isSelected ? "#f59e0b" : isPrivate ? "#fbbf24" : isNational ? "#38bdf8" : "#ffffff";
  const shadow = isSelected
    ? "0 0 0 3px rgba(245, 158, 11, 0.45), 0 4px 10px rgba(0, 0, 0, 0.35)"
    : "0 2px 6px rgba(0, 0, 0, 0.25)";

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${typeStyle.bg};
      color: ${typeStyle.text};
      border: ${borderWidth} solid ${borderColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: ${fontSize};
      font-family: inherit;
      box-shadow: ${shadow};
      transform: translate(-50%, -50%);
      transition: all 0.15s ease-out;
      cursor: pointer;
      user-select: none;
    ">
      <span>${char}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: "school-marker-icon",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, isSelected ? -22 : -18]
  });
}

/**
 * Creates a DOM element popup safely without innerHTML XSS vulnerabilities (Section 24)
 */
export function createSafePopupContent(
  school: School,
  onSelect?: (school: School) => void
): HTMLElement {
  const container = document.createElement("div");
  container.className = "p-2 min-w-[210px] text-slate-800 text-sm";

  // Header row: badges
  const header = document.createElement("div");
  header.className = "flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 flex-wrap";

  const typeSpan = document.createElement("span");
  typeSpan.className = "font-semibold text-blue-600";
  typeSpan.textContent = school.schoolType;
  header.appendChild(typeSpan);

  const dot1 = document.createElement("span");
  dot1.textContent = "·";
  header.appendChild(dot1);

  const districtSpan = document.createElement("span");
  districtSpan.textContent = school.district;
  header.appendChild(districtSpan);

  const dot2 = document.createElement("span");
  dot2.textContent = "·";
  header.appendChild(dot2);

  const genderSpan = document.createElement("span");
  genderSpan.textContent = school.genderType;
  header.appendChild(genderSpan);

  const dot3 = document.createElement("span");
  dot3.textContent = "·";
  header.appendChild(dot3);

  const fondSpan = document.createElement("span");
  fondSpan.textContent = school.foundationType;
  header.appendChild(fondSpan);

  container.appendChild(header);

  // School Name
  const title = document.createElement("div");
  title.className = "font-bold text-base text-slate-900 mb-1 leading-snug";
  title.textContent = school.schoolName;
  container.appendChild(title);

  // Address
  if (school.address) {
    const addr = document.createElement("div");
    addr.className = "text-xs text-slate-600 mb-1 line-clamp-2";
    addr.textContent = school.address;
    container.appendChild(addr);
  }

  // Phone
  if (school.phone) {
    const tel = document.createElement("div");
    tel.className = "text-xs text-slate-500 mb-2 font-mono";
    tel.textContent = `☎ ${school.phone}`;
    container.appendChild(tel);
  }

  // Action button
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className =
    "w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold text-center transition-colors cursor-pointer mt-1";
  btn.textContent = "학교 상세정보 보기";
  btn.onclick = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(school);
  };
  container.appendChild(btn);

  return container;
}
