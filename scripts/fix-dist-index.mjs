import { copyFileSync, existsSync, unlinkSync } from "node:fs";

const source = "dist/source-index.html";
const target = "dist/index.html";

if (existsSync(source)) {
  copyFileSync(source, target);
  unlinkSync(source);
}
