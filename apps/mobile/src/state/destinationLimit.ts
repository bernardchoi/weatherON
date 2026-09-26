export const maxSavedDestinations = 3;

type DestinationId = { place: { id: string } };

export function canSaveDestination(destinations: readonly DestinationId[], placeId: string) {
  return destinations.some((destination) => destination.place.id === placeId) || destinations.length < maxSavedDestinations;
}
