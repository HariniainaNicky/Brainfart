const roleLabels: Record<string, string> = {
  backend: "Backend Developer",
  frontend: "Frontend Developer",
  fullstack: "Full Stack Developer",
  devops: "DevOps Engineer",
  data: "Data Engineer",
  datascience: "Data Scientist",
  ml: "Machine Learning Engineer",
  cybersecurity: "Cybersecurity Analyst",
  cloud: "Cloud Architect",
  mobile: "Mobile Developer",
  sysadmin: "Systems Administrator",
  qa: "QA / Test Engineer",
  sre: "Site Reliability Engineer",
  security: "Security Engineer",
  embedded: "Embedded Systems Engineer",
  game: "Game Developer",
  ai: "AI Engineer",
  dba: "Database Administrator",
  network: "Network Engineer",
  blockchain: "Blockchain Developer",
  solutions: "Solutions Architect",
  engmanager: "Engineering Manager",
  staff: "Staff Engineer",
  techlead: "Technical Lead",
  platform: "Platform Engineer",
};

export function getRoleLabel(roleKey: string): string {
  return roleLabels[roleKey] ?? roleKey;
}
