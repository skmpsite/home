import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for mobile PWA support & home screen icons
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Relative path ensures registration succeeds on GitHub Pages repo subpaths (e.g. /home/) and root domains
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        console.log('SKMP PWA Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('SKMP PWA Service Worker registration skipped:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
