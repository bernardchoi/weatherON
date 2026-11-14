import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const core = 'node_modules/expo/node_modules/expo-modules-core/ios';
const conversionPaths = ['DynamicSerializableType', 'DynamicWorkletType']
  .map(name => `${core}/Worklets/Core/${name}.swift`);
const fileSystemPath = `${core}/Interfaces/FileSystem/EXFileSystemInterface.h`;
const tabsPath = 'node_modules/react-native-screens/ios/conversion/RNSConversions-Tabs.mm';
const replacement = `    let runtime = try appContext.runtime
    guard let representable = value as? JavaScriptRepresentable else {
      return .undefined
    }
    return JavaScriptValue.representing(value: representable, in: runtime)`;
const fixture = mkdtempSync(join(tmpdir(), 'weatheron-build66-patches-'));
try {
  for (const path of conversionPaths) {
    const source = readFileSync(path, 'utf8');
    assert.ok(source.includes(replacement));
    assert.ok(!source.includes('JavaScriptValue.from(value, runtime: appContext.runtime)'));
    mkdirSync(dirname(join(fixture, path)), { recursive: true });
    writeFileSync(join(fixture, path), source.replace(replacement,
      '    return try JavaScriptValue.from(value, runtime: appContext.runtime)'));
  }
  const fileSystem = readFileSync(fileSystemPath, 'utf8');
  assert.equal(fileSystem.match(/NS_ASSUME_NONNULL_BEGIN/g)?.length, 1);
  assert.equal(fileSystem.match(/NS_ASSUME_NONNULL_END/g)?.length, 1);
  mkdirSync(dirname(join(fixture, fileSystemPath)), { recursive: true });
  writeFileSync(join(fixture, fileSystemPath), fileSystem.replace('NS_ASSUME_NONNULL_BEGIN\n\n', '').replace('\n\nNS_ASSUME_NONNULL_END', ''));
  const tabs = readFileSync(tabsPath, 'utf8');
  assert.ok(tabs.includes('case RNSTabsScreenSystemItemNone:\n      break;'));
  assert.ok(tabs.includes('RCTAssert(systemItem != RNSTabsScreenSystemItemNone,'));
  assert.ok(tabs.includes('return UITabBarSystemItemSearch;'));
  mkdirSync(dirname(join(fixture, tabsPath)), { recursive: true });
  writeFileSync(join(fixture, tabsPath), tabs.replace('    case RNSTabsScreenSystemItemNone:\n      break;\n', ''));
  const patch = () => execFileSync(process.execPath, [resolve('scripts/patch-expo-modules-jsi-swift.mjs')], { cwd: fixture });
  patch();
  for (const path of [...conversionPaths, tabsPath, fileSystemPath]) assert.equal(readFileSync(join(fixture, path), 'utf8'), readFileSync(path, 'utf8'));
  patch();
  for (const path of [...conversionPaths, tabsPath, fileSystemPath]) assert.equal(readFileSync(join(fixture, path), 'utf8'), readFileSync(path, 'utf8'));
  if (process.platform === 'darwin') {
    // Compile the actual replacement body with a minimal API-shaped fixture.
    // Exercise supported/unsupported values and throwing runtime access.
    const swift = `
protocol JavaScriptRepresentable { func toJavaScriptValue(in runtime: Int) -> JavaScriptValue }
struct JavaScriptValue: Equatable {
  let value: Int
  static let undefined = Self(value: -1)
  static func representing(value: any JavaScriptRepresentable, in runtime: Int) -> Self { value.toJavaScriptValue(in: runtime) }
}
struct Supported: JavaScriptRepresentable {
  func toJavaScriptValue(in runtime: Int) -> JavaScriptValue { .init(value: runtime) }
}
enum Failure: Error { case runtime }
final class AppContext {
  var reads = 0
  var shouldThrow = false
  var runtime: Int { get throws { reads += 1; if shouldThrow { throw Failure.runtime }; return 42 } }
}
func convert<ValueType>(_ value: ValueType, appContext: AppContext) throws -> JavaScriptValue {
${replacement}
}
let context = AppContext()
assert(try! convert(Supported(), appContext: context) == JavaScriptValue(value: 42))
assert(try! convert("unsupported", appContext: context) == .undefined)
assert(context.reads == 2)
context.shouldThrow = true
for input in [Supported(), "unsupported"] as [Any] {
  do { _ = try convert(input, appContext: context); fatalError("must preserve runtime error") }
  catch Failure.runtime {} catch { fatalError("unexpected error") }
}
assert(context.reads == 4)
`;
    writeFileSync(join(fixture, 'conversion.swift'), swift);
    execFileSync('xcrun', ['swiftc', '-module-cache-path', join(fixture, 'module-cache'), join(fixture, 'conversion.swift'), '-o', join(fixture, 'conversion')]);
    execFileSync(join(fixture, 'conversion'));
  }
  console.log('Build 66 warning patches: source, idempotency, and conversion behavior checks passed');
} finally { rmSync(fixture, { recursive: true, force: true }); }
