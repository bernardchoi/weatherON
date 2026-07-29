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
  "Coding/JavaScriptCodable+Date.swift",
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
  let patched = original
    .replaceAll("weak let runtime:", "weak var runtime:")
    .replaceAll("Swift.Swift.abs", "Swift.abs")
    .replaceAll(", @unchecked Sendable, @unchecked Sendable", ", @unchecked Sendable");
  patched = patched
    .replace(
      "guard milliseconds.isFinite, abs(milliseconds) <= maxJavaScriptDateMilliseconds else",
      "guard milliseconds.isFinite, Swift.abs(milliseconds) <= maxJavaScriptDateMilliseconds else",
    )
    .replace(
      "internal final class HostFunctionContext: Sendable {",
      "internal final class HostFunctionContext: @unchecked Sendable {",
    )
    .replace(
      "internal final class UnownedThisHostFunctionContext: Sendable {",
      "internal final class UnownedThisHostFunctionContext: @unchecked Sendable {",
    )
    .replace(
      "internal final class HostObjectContext: Sendable {",
      "internal final class HostObjectContext: @unchecked Sendable {",
    )
    .replace(
      "public final class JavaScriptPropNameID: JavaScriptType {",
      "public final class JavaScriptPropNameID: JavaScriptType, @unchecked Sendable {",
    )
    .replace(
      "public final class JavaScriptError: Error, Sendable {",
      "public final class JavaScriptError: Error, @unchecked Sendable {",
    )
    .replace(
      "public final class JavaScriptValue: JavaScriptType, Equatable, Escapable {",
      "public final class JavaScriptValue: JavaScriptType, Equatable, Escapable, @unchecked Sendable {",
    )
    .replace(
      "public struct JavaScriptObject: JavaScriptType, Sendable, ~Copyable {",
      "public struct JavaScriptObject: JavaScriptType, @unchecked Sendable, ~Copyable {",
    )
    .replace(
      "public struct JavaScriptBigInt: JavaScriptType, Sendable, ~Copyable {",
      "public struct JavaScriptBigInt: JavaScriptType, @unchecked Sendable, ~Copyable {",
    );

  if (patched !== original) {
    writeFileSync(filePath, patched);
    patchedCount += 1;
  }
}

if (patchedCount > 0) {
  console.log(`Patched expo-modules-jsi Swift weak runtime declarations in ${patchedCount} files.`);
}
