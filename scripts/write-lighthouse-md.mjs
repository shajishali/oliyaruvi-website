import fs from "fs";

if (!fs.existsSync("phase-6-lighthouse.json")) {
  console.error("NO_JSON");
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync("phase-6-lighthouse.json", "utf8"));
const lines = [
  "# Phase 6 Lighthouse",
  "",
  `Recorded against http://localhost:4000/ on ${new Date().toISOString()}`,
  "",
  "| Category | Score |",
  "| --- | --- |",
];

for (const category of Object.values(report.categories || {})) {
  lines.push(`| ${category.title} | ${Math.round((category.score || 0) * 100)} |`);
}

fs.writeFileSync("phase-6-lighthouse.md", `${lines.join("\n")}\n`);
console.log(lines.join("\n"));
