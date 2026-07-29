import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const packageRoot = join(process.cwd(), "node_modules", "expo-modules-jsi");
const sourceRoot = join(packageRoot, "apple", "Sources", "ExpoModulesJSI");
const expoModulesCoreRoot = join(
  process.cwd(),
  "node_modules",
  "expo",
  "node_modules",
  "expo-modules-core",
  "ios",
);

if (!existsSync(sourceRoot) && !existsSync(expoModulesCoreRoot)) {
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

function patchFile(filePath, transform) {
  if (!existsSync(filePath)) {
    return;
  }

  const original = readFileSync(filePath, "utf8");
  const patched = transform(original)
    .replaceAll("weak let runtime:", "weak var runtime:")
    .replaceAll("Swift.Swift.abs", "Swift.abs")
    .replaceAll(", @unchecked Sendable, @unchecked Sendable", ", @unchecked Sendable");

  if (patched !== original) {
    writeFileSync(filePath, patched);
    patchedCount += 1;
  }
}

for (const relativePath of files) {
  patchFile(join(sourceRoot, relativePath), (original) => {
    let patched = original;
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
    return patched;
  });
}

patchFile(join(expoModulesCoreRoot, "Core/Events/EventEmitter.swift"), (original) =>
  original.replaceAll(
    "nonisolated(unsafe) weak let emitter = self",
    "nonisolated(unsafe) weak var emitter = self",
  ),
);

patchFile(join(expoModulesCoreRoot, "Core/SharedObjects/SharedObjectRegistry.swift"), (original) =>
  original
    .replace(
      "public final class SharedObjectRegistry: Sendable {",
      "public final class SharedObjectRegistry: @unchecked Sendable {",
    )
    .replace("private weak let appContext: AppContext?", "private weak var appContext: AppContext?"),
);

if (patchedCount > 0) {
  console.log(`Patched Expo Swift declarations for Xcode 26 in ${patchedCount} files.`);
}
