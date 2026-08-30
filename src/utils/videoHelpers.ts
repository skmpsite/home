/**
 * Helper utility for parsing and formatting YouTube and video URLs
 */

export function getYouTubeEmbedUrl(url?: string): string {
  if (!url || typeof url !== 'string') {
    return 'https://www.youtube.com/embed/i8HoTEU3h_I';
  }

  const trimmed = url.trim();
  if (!trimmed) return 'https://www.youtube.com/embed/i8HoTEU3h_I';

  // If already an embed URL
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  // Handle standard youtube.com/watch?v=ID or /v/ID or /shorts/ID or youtu.be/ID
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|v\/|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
  }

  // If user pasted just the 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}?autoplay=0&rel=0`;
  }

  // Fallback return trimmed if it starts with http
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return 'https://www.youtube.com/embed/i8HoTEU3h_I';
}
