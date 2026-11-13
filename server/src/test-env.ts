import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "oliyaruvi-test-"));
process.env.CMS_DATA_DIR = dir;
