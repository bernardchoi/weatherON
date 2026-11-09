export type MascotEyeFrame = "open" | "half" | "closed";
/** Schedule only while visible/motion-enabled. One owned timer, always cancellable. */
export function scheduleMascotBlink(
  setFrame: (frame: MascotEyeFrame) => void,
  clock: { set: (fn: () => void, ms: number) => unknown; clear: (id: unknown) => void } = {
    set: (fn, ms) => setTimeout(fn, ms), clear: id => clearTimeout(id as ReturnType<typeof setTimeout>),
  },
) {
  let canceled = false;
  let timer: unknown;
  const schedule = (fn: () => void, ms: number) => { timer = clock.set(() => { if (!canceled) fn(); }, ms); };
  const blink = () => {
    setFrame("half"); schedule(() => { setFrame("closed"); schedule(() => {
      setFrame("half"); schedule(() => { setFrame("open"); schedule(blink, 6000); }, 60);
    }, 80); }, 60);
  };
  schedule(blink, 6000);
  return () => { canceled = true; clock.clear(timer); };
}
