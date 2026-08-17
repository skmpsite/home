/**
 * Utilities for Smart TV Signage Media: Video, YouTube, Image extraction and duration calculation.
 */

// Regex patterns for YouTube detection and extraction
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

/**
 * Extract YouTube Video ID from any YouTube URL or string
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If already an 11-character alphanumeric YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(YOUTUBE_REGEX);
  return match && match[1] ? match[1] : null;
}

/**
 * Check if the given URL is a YouTube video
 */
export function isYouTubeUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return !!extractYouTubeId(url);
}

/**
 * Check if the given URL is a direct video file or video stream
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();

  return (
    trimmed.startsWith('data:video/') ||
    trimmed.startsWith('blob:') ||
    trimmed.endsWith('.mp4') ||
    trimmed.endsWith('.webm') ||
    trimmed.endsWith('.ogg') ||
    trimmed.endsWith('.mov') ||
    trimmed.includes('.mp4?') ||
    trimmed.includes('.webm?') ||
    trimmed.includes('drive.google.com/file/d/') && trimmed.includes('view') ||
    trimmed.includes('video/mp4')
  );
}

/**
 * Detect media type from URL and explicit selection
 */
export function detectMediaType(
  url?: string | null,
  declaredType?: 'image' | 'video' | 'youtube'
): 'image' | 'video' | 'youtube' {
  if (declaredType) return declaredType;
  if (isYouTubeUrl(url)) return 'youtube';
  if (isVideoUrl(url)) return 'video';
  return 'image';
}

/**
 * Get YouTube high quality poster thumbnail
 */
export function getYouTubeThumbnail(videoId: string): string {
  if (!videoId) return 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1920';
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Get YouTube standard thumbnail fallback
 */
export function getYouTubeHqThumbnail(videoId: string): string {
  if (!videoId) return 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1920';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Build optimized YouTube Iframe Embed URL for Smart TV & Kiosk
 */
export function buildYouTubeEmbedUrl(
  videoId: string,
  options: {
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
  } = {}
): string {
  const { autoplay = true, muted = false, loop = false, controls = false } = options;

  const params = new URLSearchParams({
    enablejsapi: '1',
    autoplay: autoplay ? '1' : '0',
    mute: muted ? '1' : '0',
    controls: controls ? '1' : '0',
    modestbranding: '1',
    rel: '0',
    showinfo: '0',
    iv_load_policy: '3',
    fs: '0',
    playsinline: '1'
  });

  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Read duration in seconds from an uploaded video File
 */
export function getVideoDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const objectUrl = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        const duration = Math.round(video.duration);
        resolve(duration > 0 ? duration : 15);
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(15); // Safe fallback
      };

      video.src = objectUrl;
    } catch {
      resolve(15);
    }
  });
}

/**
 * Read duration in seconds from a direct video URL
 */
export function getVideoDurationFromUrl(url: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration);
        resolve(duration > 0 ? duration : 15);
      };

      video.onerror = () => {
        resolve(15); // Fallback
      };

      video.src = url;
    } catch {
      resolve(15);
    }
  });
}

/**
 * Format seconds to readable human duration (e.g. 2m 15s or 10s)
 */
export function formatMediaDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);

  if (mins > 0) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  return `${secs}s`;
}
