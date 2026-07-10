import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const windRoot = path.join(root, "docs", "Project Wind");
const outputDir = path.join(windRoot, "perfora_air_v1_0_package");
const releaseDate = "2026-07-10";

const source = {
  tokensJson: path.join(windRoot, "perfora_air_tokens_v0_1_package", "perfora-air.tokens.v0.1.json"),
  tokensCss: path.join(windRoot, "perfora_air_tokens_v0_1_package", "perfora-air.v0.1.css"),
  tokenMap: path.join(windRoot, "perfora_air_tokens_v0_1_package", "perfora-air.token-map.v0.1.ts"),
  componentsJson: path.join(windRoot, "perfora_air_components_v0_1_package", "perfora-air.components.v0.1.json"),
  componentsCss: path.join(windRoot, "perfora_air_components_v0_1_package", "perfora-air.components.v0.1.css"),
  componentTypes: path.join(windRoot, "perfora_air_components_v0_1_package", "perfora-air.component-types.v0.1.ts"),
  referenceDashboard: path.join(
    windRoot,
    "perfora_air_a11y_test_v0_1_package",
    "perfora_air_ambient_dashboard_mvp_v0_1_a11y_patched.html",
  ),
};

const readText = (file) => readFile(file, "utf8");
const writeText = (file, value) => writeFile(file, value.endsWith("\n") ? value : `${value}\n`, "utf8");
const pretty = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function token($type, $value, $description) {
  return {
    $type,
    $value,
    ...($description ? { $description } : {}),
  };
}

function mapStrings(value, transform) {
  if (typeof value === "string") return transform(value);
  if (Array.isArray(value)) return value.map((item) => mapStrings(item, transform));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mapStrings(item, transform)]));
  }
  return value;
}

await mkdir(outputDir, { recursive: true });

const [tokensSource, tokensCssSource, tokenMapSource, componentsSource, componentsCssSource, componentTypesSource, dashboardSource] =
  await Promise.all([
    readText(source.tokensJson),
    readText(source.tokensCss),
    readText(source.tokenMap),
    readText(source.componentsJson),
    readText(source.componentsCss),
    readText(source.componentTypes),
    readText(source.referenceDashboard),
  ]);

const tokens = JSON.parse(tokensSource);
tokens.$metadata = {
  ...tokens.$metadata,
  version: "1.0.0",
  status: "stable",
  date: releaseDate,
  codename: "Perfora Air",
  publicNameStatus: "internal-codename-only",
  stability: {
    tokenPaths: "stable-within-1.x",
    semanticStateModel: "stable-within-1.x",
    visualValues: "minor-adjustments-allowed-with-contrast-regression-test",
  },
};
tokens.ref.color.signal.success.$value = "#2F805D";
tokens.sys.color.text.tertiary.$value = "{ref.color.graphite.600}";
tokens.mode.night.secondaryText = token("color", "rgba(247, 250, 255, 0.78)");
tokens.mode.night.tertiaryText = token("color", "rgba(247, 250, 255, 0.76)");
tokens.component.surfaceFrame = {
  borderWidth: token("dimension", "1px"),
  blurCap: token("dimension", "{ref.blur.max}"),
  specularCap: token("number", 0.04),
};
tokens.component.densityField = {
  animatedInstancesPerScreenMax: token("number", 2),
  decorativeByDefault: token("boolean", true),
};
tokens.component.airButton = {
  minHeight: token("dimension", "44px"),
  paddingInline: token("dimension", "{ref.dimension.16}"),
  radius: token("dimension", "{ref.radius.full}"),
};
tokens.component.contextChip.interactiveMinHeight = token("dimension", "44px");
tokens.component.flowDock.itemMinTarget = token("dimension", "44px");
tokens.component.ambientTimeline = {
  minHeight: token("dimension", "96px"),
  summaryRequired: token("boolean", true),
};
tokens.$extensions = {
  "com.weatheron.project-wind": {
    release: "1.0.0",
    compatibility: ["css-custom-properties", "typescript-contracts", "figma-variable-ready"],
    requiredModes: ["day", "dusk", "night", "rainy", "reducedMotion", "reducedTransparency", "highContrast", "lowPower", "focus"],
  },
};

let components = JSON.parse(componentsSource);
components = mapStrings(components, (value) =>
  value
    .replaceAll("v0.1", "v1.0")
    .replaceAll("0.1.0", "1.0.0")
    .replaceAll("ref.space.", "ref.dimension."),
);
components.$schema = "./perfora-air.components.schema.v1.0.json";
components.$metadata = {
  ...components.$metadata,
  version: "1.0.0",
  status: "stable",
  date: releaseDate,
  tokenDependency: "perfora-air.tokens.v1.0.json",
  codename: "Perfora Air",
  publicNameStatus: "internal-codename-only",
};
for (const spec of Object.values(components.components)) spec.status = "stable";
components.qualityGates = {
  required: [
    "text-first state description",
    "44px interactive target",
    "visible keyboard focus",
    "reduced motion fallback",
    "reduced transparency fallback",
    "no color-only state communication",
  ],
  visualCaps: components.shared.visualCaps,
};

const componentSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://weatheron.local/project-wind/perfora-air.components.schema.v1.0.json",
  title: "Project Wind component contract v1.0",
  type: "object",
  required: ["$metadata", "shared", "components", "implementationPriority", "qualityGates"],
  properties: {
    $metadata: {
      type: "object",
      required: ["name", "version", "status", "tokenDependency"],
      properties: {
        version: { const: "1.0.0" },
        status: { const: "stable" },
        tokenDependency: { const: "perfora-air.tokens.v1.0.json" },
      },
      additionalProperties: true,
    },
    components: {
      type: "object",
      minProperties: 10,
      additionalProperties: {
        type: "object",
        required: ["status", "exposure", "layer", "purpose", "a11y"],
        properties: { status: { const: "stable" } },
        additionalProperties: true,
      },
    },
    shared: { type: "object" },
    implementationPriority: { type: "array", minItems: 10, items: { type: "string" } },
    qualityGates: { type: "object" },
  },
  additionalProperties: true,
};

const stableTokenCss = `${tokensCssSource
  .replaceAll("Tokens v0.1", "Tokens v1.0")
  .replace("--pa-color-signal-success: #4DA479;", "--pa-color-signal-success: #2F805D;")
  .replace("--pa-text-tertiary: var(--pa-color-graphite-500);", "--pa-text-tertiary: var(--pa-color-graphite-600);")
  .replace(
    "--pa-text-secondary: rgba(247, 250, 255, 0.76);",
    "--pa-text-secondary: rgba(247, 250, 255, 0.78);\n  --pa-text-tertiary: rgba(247, 250, 255, 0.76);",
  )}

/* Project Wind v1.0 stable contract */
:root {
  color-scheme: light;
  --pa-surface-frame-border-width: 1px;
  --pa-air-button-min-height: 44px;
  --pa-interactive-target-min: 44px;
  --pa-density-animated-instances-max: 2;
  --pa-ambient-timeline-min-height: 96px;
}

[data-pa-mode="night"] { color-scheme: dark; }

[data-pa-reduced-motion="true"] {
  --pa-flow-drift-speed: 0;
  --pa-flow-slow-speed: 0;
  --pa-flow-medium-speed: 0;
  --pa-flow-gust-speed: 0;
  --pa-duration-ambient: 0ms;
}

[data-pa-reduced-transparency="true"] {
  --pa-surface-still-fill: var(--pa-color-paper-0);
  --pa-surface-air-fill: var(--pa-color-paper-0);
  --pa-surface-signal-fill: var(--pa-color-paper-0);
  --pa-surface-veil-fill: var(--pa-color-paper-0);
  --pa-surface-still-blur: 0;
  --pa-surface-air-blur: 0;
  --pa-surface-signal-blur: 0;
  --pa-surface-veil-blur: 0;
}
`;

const stableComponentCss = `${componentsCssSource
  .replaceAll("Components v0.1", "Components v1.0")
  .replaceAll("perfora-air.v0.1.css", "perfora-air.v1.0.css")}

/* Project Wind v1.0 stable behavior */
:where(.pa-air-button, .pa-context-chip[role="button"], .pa-flow-dock__item) {
  min-width: var(--pa-interactive-target-min);
  min-height: var(--pa-interactive-target-min);
  touch-action: manipulation;
}

:where(.pa-air-button, .pa-context-chip[role="button"], .pa-flow-dock__item):disabled,
:where(.pa-air-button, .pa-context-chip[role="button"], .pa-flow-dock__item)[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.48;
}

[data-pa-loading="true"] { cursor: progress; }
[data-pa-text-first="true"] :where(.pa-density-field, .pa-lumen-layer) { opacity: 0.08; }

@media (forced-colors: active) {
  :where(.pa-surface-frame, .pa-air-button, .pa-context-chip, .pa-flow-dock) {
    border: 1px solid CanvasText;
    background: Canvas;
    color: CanvasText;
    box-shadow: none;
  }

  :where(.pa-density-field, .pa-lumen-layer) { display: none; }
  :where(.pa-air-button, .pa-context-chip, .pa-flow-dock__item):focus-visible { outline: 2px solid Highlight; }
}
`;

const stableTokenMap = `${tokenMapSource
  .replaceAll("Tokens v0.1", "Tokens v1.0")}

export const PERFORA_AIR_VERSION = '1.0.0' as const;
`;

const stableComponentTypes = `${componentTypesSource
  .replaceAll("v0.1", "v1.0")
  .replace("Draft spec-level TypeScript contracts.", "Stable framework-agnostic TypeScript contracts.")}

export type PerforaAccessibilityMode =
  | 'reducedMotion'
  | 'reducedTransparency'
  | 'highContrast'
  | 'lowPower'
  | 'focus';

export const PERFORA_COMPONENT_CONTRACT_VERSION = '1.0.0' as const;
`;

const referenceDashboard = dashboardSource
  .replaceAll("MVP v0.1", "Reference Dashboard v1.0")
  .replaceAll("MVP V0.1", "REFERENCE DASHBOARD V1.0")
  .replaceAll("Ambient Dashboard Reference Dashboard v1.0", "Design System Reference v1.0")
  .replaceAll("v0.1", "v1.0")
  .replaceAll("이 MVP는", "이 참조 화면은")
  .replaceAll("interactive MVP", "interactive reference")
  .replaceAll("MVP system inspector", "Reference system inspector")
  .replaceAll("MVP scope", "Reference scope")
  .replaceAll("#4DA479", "#2F805D")
  .replaceAll("rgba(77,164,121,0.34)", "rgba(47,128,93,0.34)")
  .replace(
    "<button class=\"icon-button\" id=\"gustButton\" aria-label=\"Trigger subtle gust animation\">↗</button>",
    "<button class=\"icon-button\" id=\"gustButton\" aria-label=\"Trigger subtle gust animation\"><img src=\"../../../assets/ui-icons/card-wind.png\" alt=\"\"></button>",
  )
  .replace(
    "<span class=\"weather-symbol\" id=\"weatherSymbol\" aria-hidden=\"true\">☼</span>",
    "<img class=\"weather-symbol\" id=\"weatherSymbol\" src=\"../../../assets/ui-icons/card-uv.png\" alt=\"\">",
  )
  .replace(
    "<span class=\"recommendation-icon\" aria-hidden=\"true\">◌</span>",
    "<span class=\"recommendation-icon\" aria-hidden=\"true\"><img src=\"../../../assets/ui-icons/card-check.png\" alt=\"\"></span>",
  )
  .replace(
    '<button class="pa-flow-dock__item" data-nav="home" aria-current="page" aria-label="Home dashboard"><span aria-hidden="true">⌂</span><small>Home</small></button>',
    '<button class="pa-flow-dock__item" data-nav="home" aria-current="page" aria-label="Home dashboard"><img src="../../../assets/ui-icons/tab-home.png" alt=""><small>Home</small></button>',
  )
  .replace(
    '<button class="pa-flow-dock__item" data-nav="flow" aria-label="Air Flow detail"><span aria-hidden="true">≋</span><small>Flow</small></button>',
    '<button class="pa-flow-dock__item" data-nav="flow" aria-label="Air Flow detail"><img src="../../../assets/ui-icons/card-wind.png" alt=""><small>Flow</small></button>',
  )
  .replace(
    '<button class="pa-flow-dock__item" data-nav="homeair" aria-label="Smart Home Air"><span aria-hidden="true">▣</span><small>Air</small></button>',
    '<button class="pa-flow-dock__item" data-nav="homeair" aria-label="Smart Home Air"><img src="../../../assets/ui-icons/my-display.png" alt=""><small>Air</small></button>',
  )
  .replace(
    '<button class="pa-flow-dock__item" data-nav="schedule" aria-label="Day Flow schedule"><span aria-hidden="true">◷</span><small>Day</small></button>',
    '<button class="pa-flow-dock__item" data-nav="schedule" aria-label="Day Flow schedule"><img src="../../../assets/ui-icons/card-clock.png" alt=""><small>Day</small></button>',
  )
  .replace(
    '<button class="pa-flow-dock__item" data-nav="modes" aria-label="Modes and accessibility settings"><span aria-hidden="true">⚙</span><small>Modes</small></button>',
    '<button class="pa-flow-dock__item" data-nav="modes" aria-label="Modes and accessibility settings"><img src="../../../assets/ui-icons/card-settings.png" alt=""><small>Modes</small></button>',
  )
  .replaceAll("symbol: '☼'", "symbol: '../../../assets/ui-icons/card-uv.png'")
  .replaceAll("symbol: '◌'", "symbol: '../../../assets/ui-icons/card-wind.png'")
  .replaceAll("symbol: '☁'", "symbol: '../../../assets/ui-icons/card-rain.png'")
  .replace(
    "{ icon: '◌', name: 'Air Purifier'",
    "{ icon: '../../../assets/ui-icons/card-wind.png', name: 'Air Purifier'",
  )
  .replace(
    "{ icon: '▣', name: 'Robot Vacuum'",
    "{ icon: '../../../assets/ui-icons/my-display.png', name: 'Robot Vacuum'",
  )
  .replace(
    "{ icon: '◍', name: 'Humidity Sensor'",
    "{ icon: '../../../assets/ui-icons/card-humidity.png', name: 'Humidity Sensor'",
  )
  .replace(
    "{ icon: '⌁', name: 'Window Sensor'",
    "{ icon: '../../../assets/ui-icons/card-check.png', name: 'Window Sensor'",
  )
  .replace(
    '<span class="device-icon" aria-hidden="true">${device.icon}</span>',
    '<span class="device-icon" aria-hidden="true"><img src="${device.icon}" alt=""></span>',
  )
  .replace(
    "setText('weatherSymbol', data.symbol);",
    "const weatherSymbol = document.getElementById('weatherSymbol');\n  if (weatherSymbol) weatherSymbol.setAttribute('src', data.symbol);",
  )
  .replace(
    "      </section>\n      </section>\n      <section class=\"side-section compact-note\">",
    "      </section>\n      <section class=\"side-section compact-note\">",
  )
  .replace(
    "</style>",
    `.icon-button img,
.recommendation-icon img,
.device-icon img,
.pa-flow-dock__item img {
  display: block;
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.weather-symbol {
  display: block;
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.recommendation-icon img { width: 16px; height: 16px; }
.device-icon img { width: 22px; height: 22px; }
.pa-flow-dock__item img { margin: 0 auto 3px; }
</style>`,
  );

const markdown = (lines) => `${lines.join("\n")}\n`;

const readme = markdown([
  "# Project Wind — Perfora Air Design System v1.0",
  "",
  "**상태:** Stable internal design-system release  ",
  "**버전:** 1.0.0  ",
  `**릴리스:** ${releaseDate}  `,
  "**적용 위치:** WeatherON 차기 메이저 UI 개편 후보  ",
  "**네이밍:** Perfora Air는 내부 코드명이며 외부 상표로 확정하지 않음",
  "",
  "## 목적",
  "",
  "Project Wind의 Matte Air / Soft Density / Quiet Signal / Text First를 토큰, 컴포넌트 계약, 접근성 기본값, 참조 화면으로 고정함. 현행 WeatherON MVP UI를 즉시 대체하지 않으며 별도 채택 ADR과 제품 화면 검증 후 적용함.",
  "",
  "## v1.0 엔트리포인트",
  "",
  "| 산출물 | 역할 |",
  "|---|---|",
  "| perfora-air.tokens.v1.0.json | DTCG 형식 기반 foundation·semantic·mode·component 토큰 |",
  "| perfora-air.v1.0.css | CSS custom properties와 접근성 모드 fallback |",
  "| perfora-air.token-map.v1.0.ts | 날씨·일정·공기질 데이터를 semantic state로 변환 |",
  "| perfora-air.components.v1.0.json | 10개 컴포넌트의 상태·variant·접근성 계약 |",
  "| perfora-air.components.schema.v1.0.json | 컴포넌트 계약 검증용 JSON Schema |",
  "| perfora-air.component-types.v1.0.ts | 프레임워크 비종속 TypeScript 계약 |",
  "| perfora-air.components.v1.0.css | 참조 CSS와 forced-colors fallback |",
  "| reference-dashboard.v1.0.html | 접근성 패치를 포함한 자가완결 참조 화면 |",
  "| release-manifest.v1.0.json | 버전·해시·안정성 범위 |",
  "",
  "## 안정성 계약",
  "",
  "- 1.x에서 token path, 5단계 state 모델, 9개 mode 이름을 유지함.",
  "- 색상값·모션값은 대비와 정보 전달 회귀 검증을 통과하는 범위에서 조정 가능함.",
  "- alert와 critical은 텍스트 설명이 필수임.",
  "- 상호작용 타깃 44px, 명시적 focus, reduced motion/transparency, forced colors를 기본 계약으로 둠.",
  "- 한 화면의 animated ambient component는 최대 2개로 제한함.",
  "",
  "## 컴포넌트",
  "",
  "SurfaceFrame, DensityField, AirButton, ContextChip, AtmospherePanel, SignalCard, DataVeil, LumenRing, FlowDock, AmbientTimeline을 stable로 고정함.",
  "",
  "## 검증",
  "",
  "    npm run build:project-wind-v1",
  "    npm run check:project-wind-v1",
  "",
  "검증기는 JSON 파싱, token alias, 컴포넌트 token 참조, CSS custom property, 접근성 필수 훅, 산출물 해시를 확인함.",
  "",
  "## 적용 경계",
  "",
  "- 현재 WeatherON v1.0 UI의 source of truth는 docs/design/WeatherON_UI_Design_Spec.md임.",
  "- Project Wind는 차기 메이저 UI의 후보 시스템이며 자동 편입되지 않음.",
  "- 외부 공개명은 상표 검토 완료 전 별도 결정함.",
  "- 실제 제품 채택 전 React Native 토큰 변환, 화면별 목업, iOS/Android 기기 QA, 보조공학 수동 테스트가 필요함.",
]);

const migration = markdown([
  "# Perfora Air v0.1 → v1.0 마이그레이션", "", "## 변경 요약", "",
  "1. 문서 상태를 draft에서 stable internal release로 변경함.",
  "2. 작은 보조 텍스트와 success 색상의 대비를 보강함.",
  "3. Night 모드 secondary/tertiary text를 분리함.",
  "4. 10개 컴포넌트를 stable 계약으로 고정함.",
  "5. interactive target 44px, forced colors, reduced motion/transparency를 필수화함.",
  "6. token path와 state/mode 이름의 1.x 호환 규칙을 도입함.",
  "7. 가짜 원격 component schema 경로를 로컬 JSON Schema로 교체함.",
  "", "## 교체 경로", "", "| v0.1 | v1.0 |", "|---|---|",
  "| perfora-air.tokens.v0.1.json | perfora-air.tokens.v1.0.json |",
  "| perfora-air.v0.1.css | perfora-air.v1.0.css |",
  "| perfora-air.token-map.v0.1.ts | perfora-air.token-map.v1.0.ts |",
  "| perfora-air.components.v0.1.json | perfora-air.components.v1.0.json |",
  "| perfora-air.component-types.v0.1.ts | perfora-air.component-types.v1.0.ts |",
  "| perfora-air.components.v0.1.css | perfora-air.components.v1.0.css |",
  "", "## 동작 변경", "",
  "- sys.color.text.tertiary: graphite 500 → 600",
  "- ref.color.signal.success: #4DA479 → #2F805D",
  "- interactive ContextChip: 최소 높이 44px",
  "- data-pa-text-first=true: density/lumen 존재감 자동 축소",
  "- forced-colors 환경: 장식 레이어 제거, 시스템 색상과 outline 사용",
  "", "기존 v0.1 산출물은 연구 이력으로 보존하며 신규 구현은 v1.0 엔트리포인트만 사용함.",
]);

const changelog = markdown([
  "# Changelog", "", `## 1.0.0 — ${releaseDate}`, "",
  "- v0.1 토큰·컴포넌트·wireframe·대시보드·접근성 패치를 단일 안정 패키지로 통합함.",
  "- 10개 컴포넌트와 5단계 state 모델을 stable로 고정함.",
  "- 대비, 44px target, focus, reduced motion/transparency, forced colors 기준을 기본값으로 승격함.",
  "- 로컬 schema, release manifest, build/check 명령을 추가함.",
  "- Perfora Air를 내부 코드명으로 제한하고 현행 WeatherON MVP와의 적용 경계를 명시함.",
]);

const quality = markdown([
  "# Project Wind v1.0 품질 기준", "", "## 자동 통과 항목", "",
  "- token/component JSON 파싱과 버전 메타데이터",
  "- 모든 token alias의 실제 경로 존재",
  "- 컴포넌트 token 참조 무결성",
  "- CSS custom property 참조 무결성",
  "- stable 컴포넌트 10종 존재",
  "- 9개 환경·접근성 mode 존재",
  "- skip link, live region, pressed/current state, 44px target, focus, reduced motion/transparency 존재",
  "", "## v1.0에 포함된 시각 검증 기준", "",
  "- 무광 표면이 유리 굴절이나 강한 광택보다 우선함.",
  "- density는 정보 상태와 연결된 경우에만 사용함.",
  "- lumen은 상태 피드백이며 장식 glow로 사용하지 않음.",
  "- alert/critical은 텍스트와 행동을 시각 효과보다 우선함.",
  "- Day/Dusk/Rainy/Night에서 같은 정보 구조와 조작 순서를 유지함.",
  "", "## 제품 채택 전 추가 기준", "",
  "- VoiceOver/TalkBack/NVDA 중 목표 플랫폼 보조공학 수동 테스트",
  "- React Native 토큰 변환 결과와 참조 CSS의 semantic parity",
  "- Android/iOS 실제 기기에서 low-power·reduced-motion 성능 확인",
  "- WeatherON 핵심 화면별 목업 승인과 mockup-to-device 시각 QA",
]);

const audit = markdown([
  "# Project Wind v1.0 완성도 감사", "", `**감사일:** ${releaseDate}  `,
  "**대상:** Project Wind v0.1 토큰, 컴포넌트, wireframe, Ambient Dashboard, 접근성 패치",
  "", "## 판정", "",
  "v0.1은 방향성과 핵심 화면은 성립했으나 release contract가 없어서 디자인 연구 패키지 상태였음. v1.0에서는 아래 차이를 닫아 stable internal design system으로 승격함.",
  "", "| 발견 | 영향 | v1.0 조치 |", "|---|---|---|",
  "| draft 산출물이 여러 폴더에 분산 | 기준점 불명확 | 단일 v1.0 package와 root README 지정 |",
  "| 접근성 개선이 별도 patched HTML에만 존재 | 원본과 검증본 불일치 | patched 결과를 v1.0 reference dashboard로 승격 |",
  "| tertiary/success 대비 부족 이력 | 작은 텍스트 가독성 위험 | 검증된 대비값을 token/CSS 기본값으로 반영 |",
  "| 가짜 원격 component schema | 자동 검증 불가 | 로컬 JSON Schema 추가 |",
  "| 10개 컴포넌트 모두 draft | 구현 호환성 불명확 | stable status와 1.x 호환 계약 고정 |",
  "| 44px·focus·환경 mode가 문서와 패치에 분산 | 구현 누락 위험 | token, CSS, component quality gate에 중복 고정 |",
  "| 외부 이름 리스크 | 공개 브랜드 오인 가능 | Perfora Air를 내부 코드명으로 제한 |",
  "", "## 브라우저 검증", "",
  "| 항목 | 결과 |",
  "|---|---|",
  "| 1440×1200 기준 뷰 | 가로 overflow 없음, interactive target 최소 44px, 이미지 로드 실패 0 |",
  "| 390×844 모바일 뷰 | 가로 overflow 없음, device width 370px, 하단 내비게이션 노출, interactive target 최소 44px |",
  "| 상태 전환 | Alert → Night → Modes와 Reduced Motion 활성화가 화면 state와 live region에 반영 |",
  "| 콘솔 | warning/error 0 |",
  "| 무드보드 비교 | Matte Air 표면, 점밀도, 24° hierarchy, metric 3열, FlowDock, day palette 유지 |",
  "", "## 남은 제한", "",
  "- v1.0은 디자인·웹 참조 구현 수준의 stable release임.",
  "- React Native production component와 Figma library 자체는 아직 포함하지 않음.",
  "- WCAG 인증이 아니며 실제 보조공학·저시력 사용자 테스트가 남아 있음.",
  "- WeatherON 현행 MVP UI에는 자동 적용하지 않음.",
]);

const output = {
  "perfora-air.tokens.v1.0.json": pretty(tokens),
  "perfora-air.v1.0.css": stableTokenCss,
  "perfora-air.token-map.v1.0.ts": stableTokenMap,
  "perfora-air.components.v1.0.json": pretty(components),
  "perfora-air.components.schema.v1.0.json": pretty(componentSchema),
  "perfora-air.component-types.v1.0.ts": stableComponentTypes,
  "perfora-air.components.v1.0.css": stableComponentCss,
  "reference-dashboard.v1.0.html": referenceDashboard,
  "README.md": readme,
  "MIGRATION.md": migration,
  "CHANGELOG.md": changelog,
  "QUALITY_GATES.md": quality,
};

for (const [name, content] of Object.entries(output)) await writeText(path.join(outputDir, name), content);

const files = Object.entries(output).map(([name, content]) => ({
  path: name,
  sha256: sha256(content.endsWith("\n") ? content : `${content}\n`),
}));
const manifest = {
  name: "Project Wind / Perfora Air",
  version: "1.0.0",
  status: "stable-internal",
  date: releaseDate,
  currentWeatherOnUiReplacement: false,
  publicNameStatus: "internal-codename-only",
  entrypoints: {
    tokens: "perfora-air.tokens.v1.0.json",
    tokenCss: "perfora-air.v1.0.css",
    tokenMap: "perfora-air.token-map.v1.0.ts",
    components: "perfora-air.components.v1.0.json",
    componentTypes: "perfora-air.component-types.v1.0.ts",
    componentCss: "perfora-air.components.v1.0.css",
    referenceDashboard: "reference-dashboard.v1.0.html",
  },
  files,
};
await writeText(path.join(outputDir, "release-manifest.v1.0.json"), pretty(manifest));
await writeText(path.join(windRoot, "PROJECT_WIND_V1_AUDIT.md"), audit);

console.log(`Project Wind v1.0 generated: ${path.relative(root, outputDir)}`);
console.log(`Artifacts: ${files.length + 1}`);
