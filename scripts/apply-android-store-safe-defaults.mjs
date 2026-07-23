import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { kstDate } from "./lib/markdownDoc.mjs";

const rootDir = process.cwd();
const inputPath = process.argv[2] || process.env.WEATHERON_STORE_INPUTS_FILE || join(
  rootDir,
  "docs/architecture/WeatherON_ANDROID_STORE_INPUTS.local.json",
);
const examplePath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS.example.json");
const statusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SAFE_DEFAULTS_STATUS.md");

const safeDefaults = {
  developerWebsite: "미입력",
  logRetentionMonths: "12",
  emailAuthService: "이메일 인증 미도입",
  targetAge: "만 14세 이상",
};

const issues = [];
const updates = [];

let inputs = {};
if (!existsSync(inputPath)) {
  if (!existsSync(examplePath)) {
    issues.push(`input and example missing: ${inputPath}`);
  } else {
    const example = JSON.parse(readFileSync(examplePath, "utf8"));
    inputs = Object.fromEntries(Object.keys(example).map((key) => [key, ""]));
    mkdirSync(dirname(inputPath), { recursive: true });
  }
} else {
  try {
    inputs = JSON.parse(readFileSync(inputPath, "utf8"));
  } catch (error) {
    issues.push(`input JSON parse failed: ${error.message}`);
  }
}

if (issues.length === 0) {
  for (const [field, value] of Object.entries(safeDefaults)) {
    if (typeof inputs[field] !== "string" || inputs[field].trim() === "") {
      inputs[field] = value;
      updates.push(`${field}=${value}`);
    }
  }
  writeFileSync(inputPath, `${JSON.stringify(inputs, null, 2)}\n`, "utf8");
}

writeStatus();

if (issues.length > 0) {
  console.error(`android store safe defaults failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`android store safe defaults applied: ${updates.length} updates`);

function writeStatus() {
  const report = `# WeatherON Android Store Safe Defaults Status

> 생성일: ${kstDate()}
> 목적: 사용자/법무 확정이 필요 없는 Google Play 입력 기본값만 local JSON에 자동 반영한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 상태 | ${issues.length === 0 ? "정상" : "확인 필요"} |
| issue 수 | ${issues.length} |
| update 수 | ${updates.length} |
| 입력 파일 | ${inputPath} |

## 2. 자동 입력 기준

| 필드 | 값 | 사유 |
|---|---|---|
| developerWebsite | 미입력 | 공개 웹사이트가 확정되지 않은 경우 Play Console에서 미입력 가능 |
| logRetentionMonths | 12 | 정책 초안 권장값 |
| emailAuthService | 이메일 인증 미도입 | 현재 APK에 이메일 인증 발송 서비스 미도입 |
| targetAge | 만 14세 이상 | 현재 정책 초안 기준. 최종 제출 전 법무 검토 필요 |

## 3. Updates

${updates.length === 0 ? "- 없음" : updates.map((item) => `- ${item}`).join("\n")}

## 4. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 5. 주의

- 개발자 이메일, 개인정보처리방침 URL, 운영자명, 고객센터, 개인정보 보호책임자, Play Console 계정 유형은 자동 입력하지 않는다.
- 이 명령은 local JSON만 보정하며 개인정보처리방침/스토어 문서에 적용하지 않는다.
- 실제 반영은 사용자 확정값 입력 후 \`npm run apply:android-store-inputs\`로 수행한다.
`;

  mkdirSync(dirname(statusPath), { recursive: true });
  writeFileSync(statusPath, report, "utf8");
}
