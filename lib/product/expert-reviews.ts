export function getYouTubeId(url: string): string | undefined {
  return url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1];
}
