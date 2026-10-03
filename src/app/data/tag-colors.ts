/**
 * Kolory tagów i awatarów - w projekcie każdy tag ma własny pastelowy kolor,
 * a kolory są losowane stabilnie (ta sama nazwa = ten sam kolor).
 */

export interface TagColor {
  bg: string;
  text: string;
}

export interface AvatarColor {
  bg: string;
  border: string;
  text: string;
}

const TAG_COLORS: TagColor[] = [
  { bg: '#bacdfd', text: '#1e293b' },
  { bg: '#f8d2d2', text: '#1e293b' },
  { bg: '#fed7aa', text: '#9a3412' },
  { bg: '#e9d5ff', text: '#6b21a8' },
  { bg: '#ccfbf1', text: '#115e59' },
  { bg: '#dcfce7', text: '#15803d' },
  { bg: '#fef9c3', text: '#854d0e' },
];

const AVATAR_COLORS: AvatarColor[] = [
  { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
  { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  { bg: '#e0e7ff', border: '#a5b4fc', text: '#3730a3' },
  { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
];

/** Prosty hash tekstu -> stabilny indeks palety. */
function hash(value: string): number {
  let result = 0;
  for (const char of value) {
    result = (result * 31 + char.charCodeAt(0)) >>> 0;
  }
  return result;
}

export function tagColor(name: string): TagColor {
  return TAG_COLORS[hash(name) % TAG_COLORS.length];
}

export function avatarColor(seed: string): AvatarColor {
  return AVATAR_COLORS[hash(seed) % AVATAR_COLORS.length];
}