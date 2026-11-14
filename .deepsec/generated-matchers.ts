import { compileDeclarativeMatchers, type DeepsecPlugin } from "deepsec/config";

export const generatedMatchersPlugin: DeepsecPlugin = {
  name: "deepsec-generated-matchers",
  matchers: compileDeclarativeMatchers([{
    version: 1, slug: "weatheron-hook-executable-selection",
    description: "Inventory inherited executable overrides for manual trust review",
    examples: ["OMA_BIN:-"], closesSurfaceIds: ["hook-executable-selection"], noiseTier: "normal", filePatterns: ["**/*.sh"],
    patterns: [{source: "OMA_BIN:-", label: "Inherited executable selection"}],
  }]),
};
