export type WidgetLocation = { id: string; name: string; kind: "current" | "destination" };

// The editor's catalog must not depend on a successful weather request.
export function createWidgetLocations(
  currentName: string,
  destinations: readonly { place: { id: string; name: string } }[],
): WidgetLocation[] {
  return [
    { id: "__current__", name: currentName, kind: "current" },
    ...destinations.map(({ place }) => ({ id: place.id, name: place.name, kind: "destination" as const })),
  ];
}
