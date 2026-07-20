// weatherClient/placeSearchClient/travelEstimateClient가 공유하는 타임아웃 부착 JSON fetch.
export const PROXY_TOKEN_HEADER = "x-weatheron-proxy-token";

export async function fetchJsonWithTimeout<T>(
  url: URL,
  options: {
    timeoutMs: number;
    errorLabel: string;
    fetchImpl?: typeof fetch;
    headers?: Record<string, string>;
  },
): Promise<T> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) throw new Error("fetch is not available");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const response = await fetchImpl(url.toString(), { signal: controller.signal, headers: options.headers });
    const bodyText = await response.text();
    if (!response.ok) {
      throw new Error(`${options.errorLabel} request failed: ${response.status} ${bodyText.slice(0, 240)}`);
    }
    return JSON.parse(bodyText) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}
