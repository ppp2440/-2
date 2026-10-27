export interface School {
  schoolCode: string;
  shlIdfCd?: string;
  schoolName: string;
  district: string;
  districtCode: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  hasLocation: boolean;
  phone: string;
  homepage: string;
  genderType: "남학교" | "여학교" | "남녀공학" | "기타";
  foundationType: "공립" | "사립" | "국립" | "기타";
  schoolType: "일반고" | "자사고" | "특목고" | "영재고" | "특성화고" | "학력인정고" | "기타";
  rawSchoolType: string;
  eduOffice: string;
  studentCount?: number | null;
  classCount?: number | null;
  teacherCount?: number | null;
  disclosureYear?: string | number;
}

export interface SchoolsResponse {
  schools: School[];
  totalCount: number;
  successDistricts: number;
  failedDistricts: string[];
  fetchedAt: string;
}

export const SEOUL_DISTRICTS = [
  { name: "종로구", code: "11110" },
  { name: "중구", code: "11140" },
  { name: "용산구", code: "11170" },
  { name: "성동구", code: "11200" },
  { name: "광진구", code: "11215" },
  { name: "동대문구", code: "11230" },
  { name: "중랑구", code: "11260" },
  { name: "성북구", code: "11290" },
  { name: "강북구", code: "11305" },
  { name: "도봉구", code: "11320" },
  { name: "노원구", code: "11350" },
  { name: "은평구", code: "11380" },
  { name: "서대문구", code: "11410" },
  { name: "마포구", code: "11440" },
  { name: "양천구", code: "11470" },
  { name: "강서구", code: "11500" },
  { name: "구로구", code: "11530" },
  { name: "금천구", code: "11545" },
  { name: "영등포구", code: "11560" },
  { name: "동작구", code: "11590" },
  { name: "관악구", code: "11620" },
  { name: "서초구", code: "11650" },
  { name: "강남구", code: "11680" },
  { name: "송파구", code: "11710" },
  { name: "강동구", code: "11740" }
];

const BASE_URL = "https://www.schoolinfo.go.kr/openApi.do";

// Cache in-memory to prevent repeated hitting of public API while maintaining freshness
let cachedSchools: SchoolsResponse | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function parseSchoolType(raw: string): School["schoolType"] {
  const t = raw.trim();
  if (!t) return "기타";
  if (t.includes("일반고")) return "일반고";
  if (t.includes("자율형사립") || t.includes("자사고") || t.includes("자율고")) return "자사고";
  if (
    t.includes("특수목적") ||
    t.includes("특목고") ||
    t.includes("외국어") ||
    t.includes("외고") ||
    t.includes("과학고") ||
    t.includes("국제고") ||
    t.includes("예술고") ||
    t.includes("체육고") ||
    t.includes("마이스터")
  ) {
    return "특목고";
  }
  if (t.includes("영재")) return "영재고";
  if (t.includes("특성화") || t.includes("직업고")) return "특성화고";
  if (t.includes("학력인정") || t.includes("각종")) return "학력인정고";
  return "기타";
}

function parseGenderType(raw: string): School["genderType"] {
  const g = (raw || "").trim();
  if (g === "남" || (g.includes("남") && !g.includes("공학") && !g.includes("여"))) return "남학교";
  if (g === "여" || (g.includes("여") && !g.includes("공학") && !g.includes("남"))) return "여학교";
  if (g.includes("공학") || g.includes("남여") || g.includes("남녀")) return "남녀공학";
  return "기타";
}

function parseFoundationType(raw: string): School["foundationType"] {
  const f = (raw || "").trim();
  if (f.includes("국립")) return "국립";
  if (f.includes("공립")) return "공립";
  if (f.includes("사립")) return "사립";
  return "기타";
}

function normalizeSchool(row: Record<string, any>, district: { name: string; code: string }): School {
  const schoolCode = String(row.SCHUL_CODE ?? row.schulCode ?? row.SHL_CD ?? "").trim();
  const schoolName = String(row.SCHUL_NM ?? row.schulNm ?? row.SHL_NM ?? "").trim();
  const shlIdfCd = String(row.SHL_IDF_CD ?? row.shlIdfCd ?? "").trim();

  const address = String(row.SCHUL_RDNMA || row.ADRES_BRKDN || row.FULL_ADDR || "").trim();
  const phone = String(row.USER_TELNO || row.USER_TELNO_SW || "").trim();
  const homepage = String(row.HMPG_ADRES || row.HOMEPAGE || "").trim();
  const eduOffice = String(row.JU_ORG_NM || row.ATPT_OFCDC_ORG_NM || "").trim();

  const rawSchoolType = String(row.HS_KND_SC_NM || row.SCHUL_KND_SC_NM || row.SCHUL_CRSE_SC_VALUE_NM || "").trim();
  const schoolType = parseSchoolType(rawSchoolType);

  const rawGender = String(row.COEDU_SC_CODE || row.COEDU_SC_NM || "").trim();
  const genderType = parseGenderType(rawGender);

  const rawFoundation = String(row.FOND_SC_CODE || row.FOND_SC_NM || row.SCHUL_FOND_TYP_CODE || "").trim();
  const foundationType = parseFoundationType(rawFoundation);

  // Parse and validate coordinates according to Section 16
  const rawLat = row.LTTUD ?? row.lttdcdnt ?? row.LAT ?? row.lat;
  const rawLon = row.LGTUD ?? row.lngtcdnt ?? row.LON ?? row.LOT ?? row.lng;

  const latNum = Number(rawLat);
  const lonNum = Number(rawLon);

  let hasLocation = false;
  let latitude: number | null = null;
  let longitude: number | null = null;

  if (
    Number.isFinite(latNum) &&
    Number.isFinite(lonNum) &&
    latNum !== 0 &&
    lonNum !== 0 &&
    latNum >= 37.3 &&
    latNum <= 37.8 &&
    lonNum >= 126.6 &&
    lonNum <= 127.4
  ) {
    hasLocation = true;
    latitude = latNum;
    longitude = lonNum;
  }

  return {
    schoolCode,
    shlIdfCd,
    schoolName,
    district: district.name,
    districtCode: district.code,
    address,
    latitude,
    longitude,
    hasLocation,
    phone,
    homepage,
    genderType,
    foundationType,
    schoolType,
    rawSchoolType,
    eduOffice
  };
}

async function fetchDistrictSchools(
  apiKey: string,
  district: { name: string; code: string }
): Promise<{ district: { name: string; code: string }; list: any[] }> {
  const url = new URL(BASE_URL);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("apiType", "0");
  url.searchParams.set("sidoCode", "11");
  url.searchParams.set("sggCode", district.code);
  url.searchParams.set("schulKndCode", "04");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "SeoulHighSchoolMap/1.0",
        Accept: "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.resultCode !== "success" && data.resultCode !== "SUCCESS") {
      throw new Error(data.resultMsg || "API Error");
    }

    const list = Array.isArray(data.list) ? data.list : [];
    return { district, list };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchAllSeoulSchools(apiKey: string, forceRefresh = false): Promise<SchoolsResponse> {
  const now = Date.now();
  if (!forceRefresh && cachedSchools && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedSchools;
  }

  const failedDistricts: string[] = [];
  const allMerged = new Map<string, School>();
  let successDistricts = 0;

  // Process in chunks of 5 requests to avoid overwhelming the upstream API while keeping total time low
  const CHUNK_SIZE = 5;
  for (let i = 0; i < SEOUL_DISTRICTS.length; i += CHUNK_SIZE) {
    const chunk = SEOUL_DISTRICTS.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(chunk.map((d) => fetchDistrictSchools(apiKey, d)));

    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      const district = chunk[j];

      if (r.status === "fulfilled") {
        successDistricts++;
        const { list } = r.value;
        console.log(`[학교알리미] ${district.name}: ${list.length}개`);
        for (const rawItem of list) {
          const school = normalizeSchool(rawItem, district);
          if (school.schoolCode) {
            allMerged.set(school.schoolCode, school);
          }
        }
      } else {
        failedDistricts.push(district.name);
        console.warn(`[학교알리미] ${district.name} 조회 실패: ${r.reason?.message || "Unknown error"}`);
      }
    }
  }

  const schools = Array.from(allMerged.values());
  const withLoc = schools.filter((s) => s.hasLocation).length;
  const withoutLoc = schools.length - withLoc;

  console.log(`[학교알리미] 성공 지역: ${successDistricts}/25, 실패 지역: ${failedDistricts.length}/25`);
  console.log(`[학교알리미] 전체 학교: ${schools.length}개, 좌표 있는 학교: ${withLoc}개, 좌표 없는 학교: ${withoutLoc}개`);

  if (schools.length === 0 && failedDistricts.length === SEOUL_DISTRICTS.length) {
    throw new Error("ALL_DISTRICTS_FAILED");
  }

  const response: SchoolsResponse = {
    schools,
    totalCount: schools.length,
    successDistricts,
    failedDistricts,
    fetchedAt: new Date().toISOString()
  };

  if (successDistricts > 0) {
    cachedSchools = response;
    cacheTimestamp = now;
  }

  return response;
}

// Detail disclosure API helper for on-demand lazy loading
export interface SchoolDetailData {
  schoolCode: string;
  studentStats?: {
    totalStudents: number;
    maleStudents?: number;
    femaleStudents?: number;
    grade1Students?: number;
    grade2Students?: number;
    grade3Students?: number;
    totalClasses?: number;
    studentsPerClass?: number;
  };
  teacherStats?: {
    totalTeachers: number;
    maleTeachers?: number;
    femaleTeachers?: number;
  };
  features?: {
    specialPrograms?: string[];
    clubs?: { name: string; count?: number; desc?: string }[];
    afterSchoolPrograms?: string[];
  };
  disclosures: {
    apiType: string;
    title: string;
    year?: string | number;
    rows: Record<string, any>[];
  }[];
  portalUrl: string;
}

export async function fetchSchoolDetails(
  apiKey: string,
  schoolCode: string,
  districtCode: string
): Promise<SchoolDetailData> {
  const result: SchoolDetailData = {
    schoolCode,
    disclosures: [],
    portalUrl: `https://www.schoolinfo.go.kr`
  };

  // Types to query on demand:
  // 62: 학년별·학급별 학생수 (Students & classes)
  // 63: 성별 학생수 (Gender breakdown)
  // 22: 직위별 교원 현황 (Teachers)
  // 56: 동아리 활동 현황 (Clubs)
  // 59: 방과후학교 현황 (After-school)
  // 67: 교육운영 특색사업 계획 (Special educational programs)
  const apiTypesToFetch = [
    { type: "62", title: "학년별·학급별 학생수" },
    { type: "63", title: "성별 학생수" },
    { type: "22", title: "교원 현황" },
    { type: "56", title: "동아리 활동 현황" },
    { type: "67", title: "교육운영 특색사업 계획" }
  ];

  const currentYear = new Date().getFullYear();
  const yearsToTry = ["2025", "2024"];

  const queries = apiTypesToFetch.map(async ({ type, title }) => {
    for (const yr of yearsToTry) {
      try {
        const url = new URL(BASE_URL);
        url.searchParams.set("apiKey", apiKey);
        url.searchParams.set("apiType", type);
        url.searchParams.set("sidoCode", "11");
        url.searchParams.set("sggCode", districtCode);
        url.searchParams.set("schulKndCode", "04");
        url.searchParams.set("pbanYr", yr);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url.toString(), {
          signal: controller.signal,
          headers: { "User-Agent": "SeoulHighSchoolMap/1.0" }
        });
        clearTimeout(timeoutId);

        if (!res.ok) continue;
        const data = await res.json();
        if (data.resultCode !== "success" && data.resultCode !== "SUCCESS") continue;

        const list = Array.isArray(data.list) ? data.list : [];
        const schoolRows = list.filter(
          (r: any) => String(r.SCHUL_CODE ?? r.schulCode ?? "").trim() === schoolCode
        );

        if (schoolRows.length > 0) {
          return { apiType: type, title, year: yr, rows: schoolRows };
        }
      } catch {
        continue;
      }
    }
    return null;
  });

  const queryResults = await Promise.allSettled(queries);
  for (const q of queryResults) {
    if (q.status === "fulfilled" && q.value && q.value.rows.length > 0) {
      result.disclosures.push(q.value);
    }
  }

  // Synthesize student and class counts if apiType 62 was returned
  const disc62 = result.disclosures.find((d) => d.apiType === "62");
  if (disc62 && disc62.rows.length > 0) {
    const row = disc62.rows[0];
    const rawTotalStr = String(row.COL_FGR_SUM ?? row.COL_SUM_FGR4 ?? "");
    const matchTotal = rawTotalStr.match(/^([0-9]+)/);
    const totalStudents = matchTotal ? Number(matchTotal[1]) : Number(row.COL_FGR_SUM ?? 0);

    const rawClassesStr = String(row.COL_SUM ?? row.COL_SUM_4 ?? "");
    const matchClasses = rawClassesStr.match(/^([0-9]+)/);
    const totalClasses = matchClasses ? Number(matchClasses[1]) : Number(row.COL_SUM ?? 0);

    const studentsPerClass = Number(row.AVG_FGR_SUM ?? 0) || (totalClasses > 0 ? Math.round((totalStudents / totalClasses) * 10) / 10 : undefined);

    result.studentStats = {
      totalStudents,
      totalClasses,
      studentsPerClass
    };
  }

  // Gender breakdown from apiType 63
  const disc63 = result.disclosures.find((d) => d.apiType === "63");
  if (disc63 && disc63.rows.length > 0) {
    const row = disc63.rows[0];
    const m = Number(row.COL_MSUM ?? row.COL_M8 ?? 0);
    const w = Number(row.COL_WSUM ?? row.COL_W8 ?? 0);
    const sum = Number(row.SUM ?? (m + w));

    if (!result.studentStats) {
      result.studentStats = { totalStudents: sum };
    } else if (!result.studentStats.totalStudents) {
      result.studentStats.totalStudents = sum;
    }
    result.studentStats.maleStudents = m;
    result.studentStats.femaleStudents = w;
    result.studentStats.grade1Students = Number(row.COL_M1 ?? 0) + Number(row.COL_W1 ?? 0);
    result.studentStats.grade2Students = Number(row.COL_M2 ?? 0) + Number(row.COL_W2 ?? 0);
    result.studentStats.grade3Students = Number(row.COL_M3 ?? 0) + Number(row.COL_W3 ?? 0);
  }

  // Teachers from apiType 22
  const disc22 = result.disclosures.find((d) => d.apiType === "22");
  if (disc22 && disc22.rows.length > 0) {
    const row = disc22.rows[0];
    const totalTeachers = Number(row.COL_S ?? row.TCR_SUM ?? row.SUM ?? 0);
    const maleTeachers = Number(row.COL_SM ?? 0);
    const femaleTeachers = Number(row.COL_SW ?? 0);
    result.teacherStats = {
      totalTeachers,
      maleTeachers: maleTeachers > 0 ? maleTeachers : undefined,
      femaleTeachers: femaleTeachers > 0 ? femaleTeachers : undefined
    };
  }

  // Clubs from apiType 56
  const disc56 = result.disclosures.find((d) => d.apiType === "56");
  if (disc56 && disc56.rows.length > 0) {
    const row = disc56.rows[0];
    const clubCount = Number(row.CREAT_EXPER_ACT_CCCLU_FGR ?? 0);
    const studentCount = Number(row.CREAT_EXPER_ACT_STDNT_FGR ?? 0);
    result.features = result.features || {};
    result.features.clubs = [
      {
        name: "창의적 체험활동 동아리",
        count: studentCount,
        desc: `${clubCount}개 동아리 개설 (${studentCount}명 참여)`
      }
    ];
  }

  // Special programs from apiType 67
  const disc67 = result.disclosures.find((d) => d.apiType === "67");
  if (disc67 && disc67.rows.length > 0) {
    const row = disc67.rows[0];
    const programs: string[] = [];
    if (row.CURR_CCCLA_SYST_YN === "○") programs.push("교육과정 클러스터 / 선택 교육과정 운영");
    if (row.SLCTL_SCHUL_YN === "○") programs.push("특색 선도학교 / 중점학교 프로그램 운영");
    if (row.LEVEL_ACCTO_MVMN_ITRT_OPRTN_YN === "○") programs.push("수준별 이동수업 편성·운영");

    result.features = result.features || {};
    result.features.specialPrograms = programs.length > 0 ? programs : ["기본 특색 교육과정 운영"];
  }

  return result;
}
