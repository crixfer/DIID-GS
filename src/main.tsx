import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Starting DIID GS Application...');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Environment check:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'API Key present' : 'API Key missing');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
