export function toStoredWardrobePhotoUri(imageUrl: string): string {
  // 앱 업데이트로 바뀌는 컨테이너 경로 대신 앱이 생성한 사진 파일명만 보관한다.
  return /^(?:file:\/\/[^?#]+\/)?(wardrobe-photos\/photo-[a-z0-9-]+\.jpg)$/iu.exec(imageUrl)?.[1] ?? imageUrl;
}

export function resolveWardrobePhotoUri(imageUrl: string, documentUri: string): string {
  const storedUri = toStoredWardrobePhotoUri(imageUrl);
  return /^wardrobe-photos\/photo-[a-z0-9-]+\.jpg$/iu.test(storedUri)
    ? `${documentUri.replace(/\/$/u, "")}/${storedUri}`
    : imageUrl;
}
