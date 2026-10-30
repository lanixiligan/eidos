import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';

// #app is the page grid; the panels App renders are its cells
createRoot(document.getElementById('app')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
