import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/layout.css';
import '../styles/theme-vars.css';
import '../styles/dark.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
