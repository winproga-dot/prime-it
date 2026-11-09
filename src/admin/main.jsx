import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { schema, fields, getPath, mergeContent, defaults } from '../data/contentSchema.js';
import './admin.css';

// Админка PRIME IT: вход, редактирование текстов и изображений, сохранение и публикация.
// Данные приходят только из защищённого API после входа; сама страница данных не содержит.
const api = (path, options = {}) => fetch(path, {
  credentials: 'same-origin', ...options,
  headers: { 'X-Admin-Request': '1', ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
});

function toForm(content) {
  const merged = mergeContent(content);
  return Object.fromEntries(fields.map(field => {
    const value = getPath(merged, field.path);
    return [field.path, value == null ? '' : String(value).trim()];
  }));
}
function fromForm(form) {
  const content = {};
  for (const field of fields) {
    let value = form[field.path];
    if (field.type === 'number') value = value === '' ? null : Number(value);
    const keys = field.path.split('.'); let node = content;
    keys.slice(0, -1).forEach((key, i) => { node[key] ??= /^\d+$/.test(keys[i + 1]) ? [] : {}; node = node[key]; });
    node[keys[keys.length - 1]] = value;
  }
  return content;
}
const preview = value => /^(https:|\/)/.test(value) ? value : '/media/' + value + '-640.webp';

// Уменьшаем фото в браузере до 1600px и WebP, чтобы сайт не тормозил.
async function shrink(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.85));
    return blob && blob.type === 'image/webp' ? new File([blob], 'image.webp', { type: 'image/webp' }) : file;
  } catch { return file; }
}

function Login({ onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError('');
    const response = await api('/api/login', { method: 'POST', body: JSON.stringify({ password }) });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (response.ok) { setPassword(''); onDone(); } else setError(data.error || 'Не удалось войти');
  };
  return <form className="login" onSubmit={submit}>
    <h1>PRIME IT · Админка</h1>
    <label>Пароль<input type="password" name="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus /></label>
    {error && <p className="error" role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? 'Проверяем…' : 'Войти'}</button>
  </form>;
}

function ImageField({ field, value, onChange }) {
  const [state, setState] = useState('');
  const upload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setState('Загружаем…');
    const body = new FormData(); body.append('file', await shrink(file));
    const response = await api('/api/admin/upload', { method: 'POST', body });
    const data = await response.json().catch(() => ({}));
    if (response.ok) { onChange(data.url); setState('Загружено'); } else setState(data.error || 'Ошибка загрузки');
    event.target.value = '';
  };
  const fallback = getPath(defaults, field.path);
  return <div className="image-field">
    <img src={preview(value || fallback)} alt="" />
    <div>
      <label className="file">Загрузить фото<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} data-path={field.path} /></label>
      {value !== fallback && <button type="button" className="link" onClick={() => onChange(fallback)}>Вернуть исходное</button>}
      {state && <small role="status">{state}</small>}
    </div>
  </div>;
}

function Editor({ onLogout }) {
  const [form, setForm] = useState(null);
  const [tab, setTab] = useState(schema[0].id);
  const [status, setStatus] = useState({});
  const [saving, setSaving] = useState(false);
  const load = async () => {
    const response = await api('/api/admin/content');
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) return onLogout();
    if (!response.ok) return setStatus({ error: data.error || 'Не удалось загрузить данные' });
    setForm(toForm(data.content));
  };
  useEffect(() => { load(); }, []);
  const group = useMemo(() => schema.find(item => item.id === tab), [tab]);
  const set = (path, value) => setForm(current => ({ ...current, [path]: value }));
  const save = async () => {
    setSaving(true); setStatus({});
    const response = await api('/api/admin/content', { method: 'PUT', body: JSON.stringify({ content: fromForm(form) }) });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (response.status === 401) return onLogout();
    if (!response.ok) return setStatus({ error: data.error || 'Ошибка сохранения', errors: data.errors });
    setForm(toForm(data.content));
    setStatus({ ok: data.publish === 'started' ? 'Сохранено. Сайт обновится через 1–2 минуты (идёт сборка).'
      : data.publish === 'not-configured' ? 'Сохранено. Публикация не настроена (нет DEPLOY_HOOK_URL) — изменения видны в предпросмотре.'
      : 'Сохранено, но запуск публикации не удался. Попробуйте сохранить ещё раз.' });
  };
  const logout = async () => { await api('/api/logout', { method: 'POST' }); onLogout(); };
  if (!form) return <main className="editor"><p>{status.error || 'Загружаем…'}</p></main>;
  return <main className="editor">
    <header><strong>PRIME IT · Админка</strong>
      <div><a href="/?preview=1" target="_blank" rel="noopener">Предпросмотр</a><a href="/" target="_blank" rel="noopener">Сайт</a>
        <button type="button" className="ghost" onClick={logout}>Выйти</button></div></header>
    <nav>{schema.map(item => <button key={item.id} type="button" className={item.id === tab ? 'active' : ''} onClick={() => setTab(item.id)}>{item.title}</button>)}</nav>
    <section>{group.fields.map(field => <div className="field" key={field.path}>
      <span>{field.label}</span>
      {field.type === 'image' ? <ImageField field={field} value={form[field.path]} onChange={value => set(field.path, value)} />
        : field.type === 'textarea' ? <textarea name={field.path} maxLength={field.max} rows={3} value={form[field.path]} onChange={e => set(field.path, e.target.value)} />
        : <input name={field.path} type={field.type === 'number' ? 'number' : 'text'} min={0} step={500} maxLength={field.max} value={form[field.path]} onChange={e => set(field.path, e.target.value)} />}
    </div>)}</section>
    <footer>
      {status.ok && <p className="ok" role="status">{status.ok}</p>}
      {status.error && <div className="error" role="alert"><p>{status.error}</p>{status.errors && <ul>{status.errors.map(item => <li key={item}>{item}</li>)}</ul>}</div>}
      <button type="button" onClick={save} disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить и опубликовать'}</button>
    </footer>
  </main>;
}

function App() {
  const [state, setState] = useState('loading');
  const check = async () => {
    const response = await fetch('/api/admin/session', { credentials: 'same-origin' });
    const data = await response.json().catch(() => ({}));
    setState(!data.configured ? 'unconfigured' : data.authenticated ? 'editor' : 'login');
  };
  useEffect(() => { check(); }, []);
  if (state === 'loading') return <p className="center">Загружаем…</p>;
  if (state === 'unconfigured') return <p className="center">Админка не настроена: задайте ADMIN_PASSWORD и SESSION_SECRET в настройках Vercel.</p>;
  if (state === 'login') return <Login onDone={() => setState('editor')} />;
  return <Editor onLogout={() => setState('login')} />;
}

createRoot(document.getElementById('admin-root')).render(<StrictMode><App /></StrictMode>);
