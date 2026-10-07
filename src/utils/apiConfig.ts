import { DEFAULT_GAS_URL } from '../config';

/**
 * URL Pelayan Awan Berpusat (Cloud Run Live Backend)
 * Digunakan secara automatik apabila aplikasi dijalankan di domain statik
 * seperti GitHub Pages (skmpsite.github.io) yang tidak mempunyai pelayan Node.js sendiri.
 */
export const LIVE_BACKEND_URL = 'https://ais-pre-7xqb6gh5wuvibqt3t3gieb-722257816417.asia-southeast1.run.app';

/**
 * Menghasilkan URL API yang tepat mengikut persekitaran hosting:
 * - Jika di Cloud Run (*.run.app) atau localhost: menggunakan URL relatif (/api/...)
 * - Jika di GitHub Pages (skmpsite.github.io) atau domain statik luar: menggunakan URL penuh Cloud Run
 */
export function getBackendApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (typeof window === 'undefined') {
    return cleanEndpoint;
  }

  const hostname = window.location.hostname || '';

  // Persekitaran yang mempunyai pelayan tempatan Express
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.run.app')
  ) {
    return cleanEndpoint;
  }

  // Persekitaran statik luar (cth: GitHub Pages skmpsite.github.io)
  // Sambungkan terus ke pelayan awan Cloud Run yang aktif
  return `${LIVE_BACKEND_URL}${cleanEndpoint}`;
}
