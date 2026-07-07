import { describe, it, expect } from "vitest";
import { getRoleLabel } from "@/lib/ai-utils";

describe("getRoleLabel", () => {
  const cases: [string, string][] = [
    ["frontend", "Frontend Developer"],
    ["backend", "Backend Developer"],
    ["fullstack", "Full Stack Developer"],
    ["devops", "DevOps Engineer"],
    ["data", "Data Engineer"],
    ["datascience", "Data Scientist"],
    ["ml", "Machine Learning Engineer"],
    ["cybersecurity", "Cybersecurity Analyst"],
    ["cloud", "Cloud Architect"],
    ["mobile", "Mobile Developer"],
    ["sysadmin", "Systems Administrator"],
    ["qa", "QA / Test Engineer"],
    ["sre", "Site Reliability Engineer"],
    ["security", "Security Engineer"],
    ["embedded", "Embedded Systems Engineer"],
    ["game", "Game Developer"],
    ["ai", "AI Engineer"],
    ["dba", "Database Administrator"],
    ["network", "Network Engineer"],
    ["blockchain", "Blockchain Developer"],
    ["solutions", "Solutions Architect"],
    ["engmanager", "Engineering Manager"],
    ["staff", "Staff Engineer"],
    ["techlead", "Technical Lead"],
    ["platform", "Platform Engineer"],
  ];

  it.each(cases)("returns %s for role key %s", (key, expected) => {
    expect(getRoleLabel(key)).toBe(expected);
  });

  it("returns the input as-is for unknown role keys", () => {
    expect(getRoleLabel("nonexistent-role")).toBe("nonexistent-role");
  });
});
