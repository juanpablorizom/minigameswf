const ROOM_CODE_PATTERN = /^[A-Z0-9]{4,8}$/;

export function normalizeRoomCode(value: string) {
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!ROOM_CODE_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

export function buildRoomJoinUrl(code: string) {
  const normalized = normalizeRoomCode(code);
  return normalized ? `https://minigameswf.app/join/${normalized}` : 'https://minigameswf.app/join';
}

export function extractRoomCodeFromValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const directCode = normalizeRoomCode(value);

  if (directCode) {
    return directCode;
  }

  try {
    const url = new URL(value);
    const routePath =
      url.protocol === 'http:' || url.protocol === 'https:'
        ? url.pathname
        : `/${url.host}${url.pathname}`;
    const match = routePath.match(/\/join\/([^/]+)/i);
    return normalizeRoomCode(match?.[1] ?? '');
  } catch {
    return null;
  }
}
