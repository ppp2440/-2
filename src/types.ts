export type SchoolTypeCategory =
  | "전체"
  | "일반고"
  | "자사고"
  | "특목고"
  | "영재고"
  | "특성화고"
  | "학력인정고"
  | "기타";

export type GenderCategory = "전체" | "남학교" | "여학교" | "남녀공학";

export type FoundationCategory = "전체" | "공립" | "사립" | "국립" | "기타";

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

export interface SchoolsApiResponse {
  schools: School[];
  totalCount: number;
  successDistricts: number;
  failedDistricts: string[];
  fetchedAt: string;
  error?: string;
  message?: string;
}

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

export interface DistrictInfo {
  name: string;
  code: string;
  eduOffice?: string;
}
