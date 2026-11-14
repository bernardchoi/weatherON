import { readAppValue, writeAppValue } from "../providers/appStorage";
import { normalizeProfileCharacter, profileCharacterRecord, profileCharacterStorageKey, type ProfileCharacterId } from "./profileCharacter";
// Shared across screen mounts. Never read an old selection while a prior screen is saving.
let pendingWrite: Promise<void> = Promise.resolve();
export async function readProfileCharacter(): Promise<ProfileCharacterId> {
  await pendingWrite;
  return normalizeProfileCharacter(await readAppValue<unknown>(profileCharacterStorageKey, true));
}
export function writeProfileCharacter(id: ProfileCharacterId): Promise<void> {
  const record = profileCharacterRecord(id);
  const write = pendingWrite.then(() => writeAppValue(profileCharacterStorageKey, record, true));
  pendingWrite = write.catch(() => {});
  return write;
}
