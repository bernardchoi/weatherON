import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const packageRoot = join(process.cwd(), "node_modules", "expo-modules-jsi");
const sourceRoot = join(packageRoot, "apple", "Sources", "ExpoModulesJSI");

if (!existsSync(sourceRoot)) {
  process.exit(0);
}

const files = [
  "Contexts/HostFunctionContext.swift",
  "Contexts/HostObjectContext.swift",
  "Runtime/JavaScriptActor.swift",
  "Runtime/JavaScriptPropNameID.swift",
  "Runtime/Values/JavaScriptArray.swift",
  "Runtime/Values/JavaScriptArrayBuffer.swift",
  "Runtime/Values/JavaScriptBigInt.swift",
  "Runtime/Values/JavaScriptError.swift",
  "Runtime/Values/JavaScriptFunction.swift",
  "Runtime/Values/JavaScriptObject.swift",
  "Runtime/Values/JavaScriptPromise.swift",
  "Runtime/Values/JavaScriptTypedArray.swift",
  "Runtime/Values/JavaScriptValue.swift",
  "Runtime/Values/JavaScriptWeakObject.swift",
];

let patchedCount = 0;

for (const relativePath of files) {
  const filePath = join(sourceRoot, relativePath);
  if (!existsSync(filePath)) {
    continue;
  }

  const original = readFileSync(filePath, "utf8");
  const patched = original.replaceAll("weak let runtime:", "weak var runtime:");

  if (patched !== original) {
    writeFileSync(filePath, patched);
    patchedCount += 1;
  }
}

if (patchedCount > 0) {
  console.log(`Patched expo-modules-jsi Swift weak runtime declarations in ${patchedCount} files.`);
}
