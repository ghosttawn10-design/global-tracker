const fs = require("fs");
const path = require("path");
const target = path.resolve(__dirname, "../api-zod/src/index.ts");
fs.writeFileSync(target, "export * from './generated/api';\n");
console.log("Patched lib/api-zod/src/index.ts");
