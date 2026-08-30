import type { AccountGateResultState } from "../state/appStateTypes";

export const outfitSaveCompletionDurationMs = 3_000;

export function shouldShowOutfitSaveCompletion(
  wasSaved: boolean,
  isSaved: boolean,
  accountGateResult: AccountGateResultState | null,
): boolean {
  const justSaved = !wasSaved && isSaved;
  const returnedFromSaveFlow =
    accountGateResult?.pendingAction === "save-outfit"
    && accountGateResult.returnTo === "C4";
  return justSaved || returnedFromSaveFlow;
}
