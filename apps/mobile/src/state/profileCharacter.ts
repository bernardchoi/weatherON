/** Device-local cosmetic preference; never part of account synchronization. */
export const profileCharacterStorageKey = "weatheron.profile-character.v1";
export const profileCharacterIds = ["default", "main", "solar", "rain", "storm", "wind", "frost", "mist"] as const;
export type ProfileCharacterId = typeof profileCharacterIds[number];
export function normalizeProfileCharacter(value: unknown): ProfileCharacterId {
  if (!value || typeof value !== "object") return "default";
  const record = value as { version?: unknown; id?: unknown };
  return record.version === 1 && profileCharacterIds.includes(record.id as ProfileCharacterId) ? record.id as ProfileCharacterId : "default";
}
export function profileCharacterRecord(id: ProfileCharacterId) {
  if (!profileCharacterIds.includes(id)) throw new Error("Invalid profile character");
  return { version: 1 as const, id };
}
