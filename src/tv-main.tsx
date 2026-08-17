import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TvApp from './TvApp';
import './index.css';

createRoot(document.getElementById('tv-root')!).render(
  <StrictMode>
    <TvApp />
  </StrictMode>
);
