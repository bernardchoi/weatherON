import { defineConfig } from "deepsec/config";
import { generatedMatchersPlugin } from "./generated-matchers.js";

export default defineConfig({
  projects: [
    { id: "weatheron-hooks", root: "../.codex/hooks" },
    // <deepsec:projects-insert-above>
  ],
  plugins: [generatedMatchersPlugin],
});
