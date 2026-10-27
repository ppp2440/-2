import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAllSeoulSchools, fetchSchoolDetails } from "./server/schoolinfo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());

// API route: 서울 25개 자치구 고등학교 전체 조회
app.get("/api/schools", async (req, res) => {
  const apiKey = process.env.SCHOOLINFO_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return res.status(503).json({
      error: "SCHOOLINFO_API_KEY_MISSING",
      message:
        "학교알리미 인증키(SCHOOLINFO_API_KEY)가 설정되지 않았습니다. AI Studio의 Settings > Secrets(또는 배포 사이트의 환경변수)에 키를 추가하면 학교 목록이 나타납니다."
    });
  }

  const forceRefresh = req.query.refresh === "true";

  try {
    const data = await fetchAllSeoulSchools(apiKey.trim(), forceRefresh);
    return res.json(data);
  } catch (err: any) {
    console.error("[서버 오류] 학교 목록 조회 실패:", err?.message || err);
    return res.status(502).json({
      error: "SCHOOLINFO_FETCH_FAILED",
      message: "학교알리미 연결에 실패했습니다. 잠시 후 다시 시도해 주세요."
    });
  }
});

// API route: 특정 학교 상세 공시정보 (On-demand Lazy loading)
app.get("/api/school-detail", async (req, res) => {
  const apiKey = process.env.SCHOOLINFO_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return res.status(503).json({
      error: "SCHOOLINFO_API_KEY_MISSING",
      message: "학교알리미 인증키가 필요합니다."
    });
  }

  const schoolCode = String(req.query.schoolCode ?? "").trim();
  const districtCode = String(req.query.districtCode ?? "").trim();

  if (!schoolCode) {
    return res.status(400).json({ error: "MISSING_SCHOOL_CODE" });
  }

  try {
    const detail = await fetchSchoolDetails(apiKey.trim(), schoolCode, districtCode);
    return res.json(detail);
  } catch (err: any) {
    console.error("[서버 오류] 학교 상세 조회 실패:", err?.message || err);
    return res.status(502).json({
      error: "SCHOOLINFO_DETAIL_FAILED",
      message: "학교 상세 정보를 불러오지 못했습니다."
    });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.SCHOOLINFO_API_KEY && process.env.SCHOOLINFO_API_KEY.trim() !== "")
  });
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[서버] 서울 고교 지도 서비스가 포트 ${PORT}에서 실행 중입니다.`);
  });
}

startServer().catch((err) => {
  console.error("[서버] 시작 실패:", err);
  process.exit(1);
});
