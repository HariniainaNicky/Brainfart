const PISTON_API = "https://emkc.org/api/v2/piston/execute";

export type RunResult = {
  stdout: string;
  stderr: string;
  output: string;
  code: number;
  error?: string;
};

export const run = async (code: string, fileName: string, language: string): Promise<RunResult> => {
  const res = await fetch(PISTON_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: language,
      version: "*",
      files: [{ name: fileName, content: code }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    return { stdout: "", stderr: "", output: "", code: 1, error: text };
  }
  const data = await res.json();
  return data.run;
};
