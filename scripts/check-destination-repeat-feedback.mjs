import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const source = readFileSync("apps/mobile/src/state/useWeatherOnAppState.ts", "utf8");
const extract = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
const setter = extract("  const setSelectedDestinationSchedulePreference =", "  const setSelectedDestinationLabel =");
const toggles = extract("  const setSelectedDestinationTargetArrivalTime =", "  const removeSavedDestination =");
const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
function harness(saved) {
  const initial = { repeatEnabled: false, repeatDays: [], targetArrivalTime: "09:00", timeBasis: "arrival", transportMode: "transit" };
  const savedDestinationsRef = { current: saved ? [{ place: { id: "office" }, schedulePreference: initial }, { place: { id: "other" }, schedulePreference: initial }] : [] };
  const previewDestinationSchedulePreferenceRef = { current: initial };
  const bindings = {
    useCallback: (callback) => callback,
    savedDestinationsRef, previewDestinationSchedulePreferenceRef,
    selectedDestinationPlace: { id: "office" }, destinationSaved: saved,
    setPreviewDestinationSchedulePreference: next => { previewDestinationSchedulePreferenceRef.current = next; },
    updateSavedDestinations: update => { savedDestinationsRef.current = update(savedDestinationsRef.current); },
    isValidTimeText: text => /^([01]\d|2[0-3]):[0-5]\d$/.test(text),
    getTodayRepeatDay: () => "fri", compareRepeatDays: (a, b) => days.indexOf(a) - days.indexOf(b),
  };
  const code = stripTypeScriptTypes(`${setter}\n${toggles}`);
  const actions = new Function(...Object.keys(bindings), `${code}; return { toggleSelectedDestinationRepeat, toggleSelectedDestinationRepeatDay, setSelectedDestinationTargetArrivalTime, setSelectedDestinationTimeBasis, setSelectedDestinationTransportMode };`)(...Object.values(bindings));
  return { ...actions, current: () => previewDestinationSchedulePreferenceRef.current, savedDestinationsRef };
}
for (const saved of [false, true]) {
  const h = harness(saved);
  // All events share the SAME callbacks: no render in between.
  for (const day of [...days].reverse()) h.toggleSelectedDestinationRepeatDay(day);
  assert.deepEqual(h.current().repeatDays, days);
  assert.equal(h.current().repeatEnabled, true);
  h.toggleSelectedDestinationRepeatDay("mon"); h.toggleSelectedDestinationRepeatDay("mon");
  assert.deepEqual(h.current().repeatDays, days);
  h.toggleSelectedDestinationRepeat();
  assert.equal(h.current().repeatEnabled, false);
  assert.deepEqual(h.current().repeatDays, days); // off preserves selected days
  h.toggleSelectedDestinationRepeat();
  for (const day of days) h.toggleSelectedDestinationRepeatDay(day);
  assert.equal(h.current().repeatEnabled, false);
  assert.deepEqual(h.current().repeatDays, []);
  h.toggleSelectedDestinationRepeat();
  assert.deepEqual(h.current().repeatDays, ["fri"]);
  h.setSelectedDestinationTargetArrivalTime("10:30");
  h.setSelectedDestinationTimeBasis("departure");
  h.setSelectedDestinationTransportMode("walk");
  assert.deepEqual(h.current().repeatDays, ["fri"]);
  assert.equal(h.current().targetArrivalTime, "10:30");
  h.setSelectedDestinationTargetArrivalTime("99:00");
  assert.equal(h.current().targetArrivalTime, "10:30");
  assert.equal(h.current().transportMode, "walk");
  assert.equal(h.current().timeBasis, "departure");
  if (saved) {
    assert.deepEqual(h.savedDestinationsRef.current[0].schedulePreference, h.current());
    assert.deepEqual(h.savedDestinationsRef.current[1].schedulePreference.repeatDays, []);
    assert.deepEqual(JSON.parse(JSON.stringify(h.savedDestinationsRef.current))[0].schedulePreference, h.current());
  }
}
const screen = readFileSync("apps/mobile/src/screens/DestinationCareScreen.tsx", "utf8");
const chips = screen.slice(screen.indexOf("<View style={styles.repeatDayRow}>"), screen.indexOf("function DropdownMotion"));
assert.match(chips, /<Pressable/);
assert.doesNotMatch(chips, /FeedbackPressable|onPressIn=|setTimeout/);
assert.match(chips, /accessibilityState=\{\{ selected \}\}/);
assert.match(chips, /opacity: pressed \? 0.55 : 1/);
assert.match(screen, /minWidth: 44/);
console.log("PASS destination repeat feedback: rapid taps, off/on, last day, saved/preview, serialization, unrelated destination, accessibility and motion-free press");
