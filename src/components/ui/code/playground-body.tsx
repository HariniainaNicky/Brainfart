"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/shadcn-component/button";

const DEFAULT_CODE = `// Write your JavaScript code here
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("BrainFart"));
console.log("1 + 1 =", 1 + 1);
`;

export const PlaygroundBody = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setOutput("");
    setError("");

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setOutput(data.stdout || "");
        if (data.stderr) setError(data.stderr);
      }
    } catch (e) {
      setError("Network error: " + String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 min-h-[80vh]">
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Code</span>
          <Button onClick={handleRun} disabled={running}>
            {running ? "Running..." : "Run"}
          </Button>
        </div>
        <div className="flex-1 border rounded-lg overflow-hidden min-h-[400px]">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v ?? "")}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <span className="text-sm font-medium">Output</span>
        <pre className="flex-1 bg-muted p-4 rounded-lg overflow-auto font-mono text-sm min-h-[200px] whitespace-pre-wrap">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : output ? (
            output
          ) : (
            <span className="text-muted-foreground">Run your code to see output</span>
          )}
        </pre>
      </div>
    </div>
  );
};
