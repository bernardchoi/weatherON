export type AmbientContact = { id: number; phase: "down" | "up" | "cancel" };
export type AmbientTouchSample = { identifier: number; pageX: number; pageY: number; count: number };

// Passive observation only: never claim a responder or prevent a native gesture.
export function createAmbientTouchController(
  point: (x: number, y: number) => void,
  phase: (contact: AmbientContact) => void,
) {
  let generation = 0;
  let finger: number | null = null;
  let latest: AmbientTouchSample | null = null;
  let origin: { x: number; y: number; width: number; height: number } | null = null;
  let visible = false;
  const place = () => {
    if (!origin || !latest) return;
    point(Math.max(0, Math.min(origin.width, latest.pageX - origin.x)), Math.max(0, Math.min(origin.height, latest.pageY - origin.y)));
  };
  const cancel = () => {
    if (finger !== null || visible) phase({ id: generation, phase: "cancel" });
    generation++;
    finger = null; latest = null; origin = null; visible = false;
  };
  return {
    down(sample: AmbientTouchSample, measure: (done: (x: number, y: number, width: number, height: number) => void) => void) {
      cancel();
      if (sample.count !== 1) return;
      const id = ++generation;
      finger = sample.identifier; latest = sample;
      measure((x, y, width, height) => {
        if (generation !== id || finger === null) return;
        origin = { x, y, width, height }; place(); visible = true;
        phase({ id, phase: "down" });
      });
    },
    move(sample: AmbientTouchSample) {
      if (sample.count !== 1) { cancel(); return; }
      if (sample.identifier !== finger) return;
      latest = sample; place();
    },
    up() {
      if (visible) phase({ id: generation, phase: "up" });
      generation++; finger = null; latest = null; origin = null; visible = false;
    },
    cancel,
  };
}
