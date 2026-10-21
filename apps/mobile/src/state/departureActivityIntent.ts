import type { SavedDestination } from "./appStateTypes";

/**
 * A departure Activity follows an explicit, saved care trip. Selecting a
 * search result is browsing state and must never become an implicit cancel.
 */
export function resolveDepartureActivityIntentDestinationId(
  savedDestinations: readonly SavedDestination[],
  persistedIntentDestinationId: string | null | undefined,
  selectedDestinationId: string,
): string | null {
  const hasCareDestination = (id: string) => savedDestinations.some((destination) => destination.place.id === id && destination.careEnabled);
  if (persistedIntentDestinationId && hasCareDestination(persistedIntentDestinationId)) return persistedIntentDestinationId;
  if (hasCareDestination(selectedDestinationId)) return selectedDestinationId;
  return savedDestinations.find((destination) => destination.careEnabled)?.place.id ?? null;
}

/**
 * `undefined` deliberately means "preserve the native Activity" while a
 * confirmed destination is still resolving. `null` is an explicit end.
 */
export function resolveDepartureActivityReconcileValue<T>(params: {
  smartCareEnabled: boolean;
  intentDestinationId: string | null;
  savedDestinations: readonly SavedDestination[];
  buildInput: (destination: SavedDestination) => T | null | undefined;
}): T | null | undefined {
  if (!params.smartCareEnabled || !params.intentDestinationId) return null;
  const destination = params.savedDestinations.find((item) => item.place.id === params.intentDestinationId);
  if (!destination || !destination.careEnabled) return null;
  return params.buildInput(destination);
}

/**
 * The Home surface is the in-app counterpart of the native Activity. It must
 * keep presenting the committed trip while a different destination is only
 * being previewed in the destination flow.
 */
export function resolveDepartureActivityHomeDestination(
  smartCareEnabled: boolean,
  intentDestinationId: string | null,
  savedDestinations: readonly SavedDestination[],
): SavedDestination | null {
  if (!smartCareEnabled || !intentDestinationId) return null;
  return savedDestinations.find((destination) => (
    destination.place.id === intentDestinationId && destination.careEnabled
  )) ?? null;
}
