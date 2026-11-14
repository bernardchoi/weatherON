export type MascotEyeFrame = "open" | "half" | "closed";
export type MascotBlinkMood = "day" | "night";
/** Schedule only while visible/motion-enabled. One owned timer, always cancellable. */
export function scheduleMascotBlink(
  setFrame: (frame: MascotEyeFrame) => void,
  clock: { set: (fn: () => void, ms: number) => unknown; clear: (id: unknown) => void } = {
    set: (fn, ms) => setTimeout(fn, ms), clear: id => clearTimeout(id as ReturnType<typeof setTimeout>),
  },
  mood: MascotBlinkMood = "day",
) {
  // Reuse approved eye frames: quieter night expression, never new eye artwork.
  const pause = mood === "night" ? 8000 : 6000;
  const half = mood === "night" ? 110 : 60;
  const closed = mood === "night" ? 140 : 80;
  let canceled = false;
  let timer: unknown;
  const schedule = (fn: () => void, ms: number) => { timer = clock.set(() => { if (!canceled) fn(); }, ms); };
  const blink = () => {
    setFrame("half"); schedule(() => { setFrame("closed"); schedule(() => {
      setFrame("half"); schedule(() => { setFrame("open"); schedule(blink, pause); }, half);
    }, closed); }, half);
  };
  schedule(blink, pause);
  return () => { canceled = true; clock.clear(timer); };
}
