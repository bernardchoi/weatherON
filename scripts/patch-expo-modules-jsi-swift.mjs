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

// Both constructors start at refCount 1; Swift must consume that owned reference.
patchFile(join(packageRoot, "apple", "Sources", "ExpoModulesJSI-Cxx", "include", "RuntimeScheduler.h"),
  (source) => source.replace(/^(  )(RuntimeScheduler\((?:void \*scheduler, ScheduleFn fn)?\))/gm,
    "$1SWIFT_RETURNS_RETAINED $2"));

const nodeModules = join(process.cwd(), "node_modules");
patchFile(join(nodeModules, "expo-notifications/ios/ExpoNotifications/Notifications/Scheduling/SchedulerModule.swift"),
  (source) => source.replace("let record: TriggerRecord?", "let record: (any TriggerRecord)?"));

patchFile(join(nodeModules, "react-native-safe-area-context/ios/Fabric/RNCSafeAreaProviderComponentView.mm"),
  (source) => source.replace(
    `                .left = safeAreaInsets.left,
                .bottom = safeAreaInsets.bottom,
                .right = safeAreaInsets.right,`,
    `                .right = safeAreaInsets.right,
                .bottom = safeAreaInsets.bottom,
                .left = safeAreaInsets.left,`,
  ));

patchFile(join(nodeModules, "react-native-svg/apple/Utils/RNSVGFabricConversions.h"),
  (source) => source
    .replace("static id RNSVGConvertFollyDynamicToId(", "static inline id RNSVGConvertFollyDynamicToId(")
    .replace("static RNSVGVBMOS intToRNSVGVBMOS(", "static inline RNSVGVBMOS intToRNSVGVBMOS("));

// The custom back-button image cache only calls this conversion in debug builds.
patchFile(join(nodeModules, "react-native-screens/ios/RNSScreenStackHeaderConfig.mm"),
  (source) => source.replace(
    /(?<!#ifndef NDEBUG\n)^static RCTResizeMode resizeModeFromCppEquiv\([^\n]+\)\n\{[\s\S]*?^\}/m,
    "#ifndef NDEBUG\n$&\n#endif",
  ));

// Expo Constants otherwise skips app.config generation when PROJECT_DIR contains spaces.
patchFile(join(process.cwd(), "node_modules", "expo-constants", "scripts", "get-app-config-ios.sh"),
  (source) => source.replace('$(basename $PROJECT_DIR)', '$(basename "$PROJECT_DIR")'));

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
  original
    .replace(
      "public protocol EventEmitter: AnyObject {",
      "public protocol EventEmitter: AnyObject, Sendable {",
    )
    .replaceAll(
      "nonisolated(unsafe) weak let emitter = self",
      "nonisolated(unsafe) weak var emitter = self",
    ),
);

patchFile(join(expoModulesCoreRoot, "Core/Modules/Module.swift"), (original) =>
  original.replace(
    "extension BaseModule: EventEmitter {",
    "extension BaseModule: EventEmitter, @unchecked Sendable {",
  ),
);

patchFile(join(packageRoot, "apple", "scripts", "build-xcframework.sh"), (original) =>
  original.replace(
    "    SWIFT_COMPILATION_MODE=wholemodule \\\n  )",
    "    SWIFT_COMPILATION_MODE=wholemodule \\\n    2>&1 | sed '/^error: the following command failed with exit code 0 but produced no further output$/d'\n  )",
  ),
);

patchFile(join(expoModulesCoreRoot, "Core/SharedObjects/SharedObject.swift"), (original) =>
  original.replace(
    "extension SharedObject: EventEmitter {",
    "extension SharedObject: EventEmitter, @unchecked Sendable {",
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
  console.log(`Applied iOS build compatibility patches to ${patchedCount} files.`);
}
