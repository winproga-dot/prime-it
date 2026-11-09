import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { setContent } from './data/content.js';
import { initAnalytics } from './utils/analytics.js';
import './worklouder.css';
const root = document.getElementById('root');
const app = <App pathname={window.location.pathname} />;

// Предпросмотр для администратора: /?preview=1 показывает сохранённые правки сразу,
// не дожидаясь пересборки сайта. Данные доступны только с действующей сессией.
async function start() {
  if (new URLSearchParams(window.location.search).has('preview')) {
    try {
      const response = await fetch('/api/admin/content', { credentials: 'same-origin' });
      if (response.ok) {
        setContent((await response.json()).content);
        document.documentElement.dataset.preview = 'true';
        createRoot(root).render(app);
        return;
      }
    } catch { /* без сессии — обычный сайт */ }
  }
  if (root.dataset.prerendered === 'true') hydrateRoot(root, app);
  else createRoot(root).render(app);
}
start();
initAnalytics();
