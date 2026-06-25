export type FbiCrimeClientResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; error: string };

export async function fbiCrimeGet(path: string, params: Record<string, string | number | undefined> = {}): Promise<FbiCrimeClientResult> {
  const apiKey = process.env.FBI_CRIME_API_KEY;
  if (!apiKey) {
    return { ok: false, status: 0, error: "FBI Crime Data Explorer API key not configured." };
  }

  const baseUrl = (process.env.FBI_CRIME_BASE_URL || "https://api.usa.gov/crime/fbi/cde").replace(/\/+$/, "");
  const url = new URL(`${baseUrl}/${path.replace(/^\/+/, "")}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  url.searchParams.set("API_KEY", apiKey);

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    console.info("FBI CDE request status", response.status);
    if (!response.ok) {
      return { ok: false, status: response.status, error: "FBI Crime Data Explorer request failed." };
    }
    return { ok: true, status: response.status, data: await response.json() };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "FBI Crime Data Explorer request failed.",
    };
  }
}