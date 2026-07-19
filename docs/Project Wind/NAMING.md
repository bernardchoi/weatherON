# Project Wind 명칭 기준

**결정일:** 2026-07-16

**상태:** 확정

**적용 범위:** Project Wind v1.0 stable 및 v1.1 experimental 문서·표시 명칭

## 공식 명칭 체계

| 계층 | 공식 명칭 | 역할 |
|---|---|---|
| 프로젝트 | **Project Wind** | WeatherON 차기 메이저 UI 연구·개발 트랙 |
| 디자인 시스템 | **Ambient Surface** | 토큰, 컴포넌트, 접근성, 데이터 반응 규칙을 포함하는 시스템 이름 |
| 시각 재료 | **Matte Air** | 무광 표면과 낮은 강도의 공기감을 정의하는 재료 메타포 |
| 핵심 원칙 | **Soft Density · Quiet Signal · Text First** | 밀도, 피드백, 정보 우선순위의 고정 원칙 |

## 표기 규칙

공식 문서 첫 표기는 다음 순서를 사용함.

```txt
Project Wind
Ambient Surface Design System
Visual material: Matte Air
Principles: Soft Density · Quiet Signal · Text First
```

- 시스템 전체를 가리킬 때는 `Ambient Surface`를 사용함.
- 표면 재질이나 시각 효과를 설명할 때만 `Matte Air`를 사용함.
- `Ambient Surface UI`, `Ambient Surface Design System`은 문맥에 따라 사용할 수 있음.
- `Project Wind`는 프로젝트 트랙 이름이며 디자인 시스템 이름처럼 단독 홍보하지 않음.

## 레거시 식별자 호환성

`Perfora Air`는 2026-07-16 이전 연구·구현 산출물의 레거시 코드명임. 새 문서의 공식 표시명으로 사용하지 않음.

다음 식별자는 v1.x 호환성을 위해 유지함.

- 폴더와 파일: `perfora_air_*`, `perfora-air.*`
- CSS custom property: `--pa-*`
- TypeScript·Swift 타입과 접두사: `PerforaAir*`, `PA*`
- 기존 패키지 scope: `@perfora-air/*`

이 식별자들은 코드 호환용이며 사용자에게 노출되는 디자인 시스템 이름을 의미하지 않음. 식별자 변경은 별도 2.0 마이그레이션에서만 검토함.

## 상표와 공개 사용

`Ambient Surface`는 직관성을 우선한 설명형 디자인 언어명임. 독점 상표 등록 가능성을 전제로 하지 않으며, 별도 상업 제품이나 SaaS 브랜드가 필요할 경우 공식 상표 DB와 법률 검토를 다시 진행함.
