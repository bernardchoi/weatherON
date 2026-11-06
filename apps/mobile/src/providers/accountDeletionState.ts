import { readAppValue, writeAppValue } from "./appStorage";

// Separate from ordinary app-state autosaves so a stale render cannot erase it.
// Contains no token, identity, or other account information.
export type PendingAccountDeletion = "requested" | "server-deleted";
const deletionStateKey = "weatheron.accountDeletion.v1";

export async function readPendingAccountDeletion(): Promise<PendingAccountDeletion | null> {
  const value = await readAppValue<unknown>(deletionStateKey, true);
  if (value === null || value === "requested" || value === "server-deleted") return value;
  throw new Error("계정 정리 상태를 확인하지 못했어요. 다시 시도해 주세요.");
}

export function writePendingAccountDeletion(value: PendingAccountDeletion | null): Promise<void> {
  return writeAppValue(deletionStateKey, value, true);
}
