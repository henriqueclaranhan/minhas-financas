export function getPlanReference(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index++) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash.toString(36).toUpperCase().padStart(6, '0').slice(-6);
}
