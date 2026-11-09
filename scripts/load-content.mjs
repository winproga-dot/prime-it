// Перед сборкой забирает последние правки из хранилища в src/data/content.generated.json.
// Без хранилища (локально, в CI) — пустой файл, сайт собирается с текстами по умолчанию.
import { writeFile } from 'node:fs/promises';
import { getStore } from '../server/storage.js';
import { validateContent } from '../src/data/contentSchema.js';

let content = {};
const store = getStore();
if (store) {
  try {
    const { content: valid, errors } = validateContent(await store.readContent());
    if (errors.length) console.warn('CONTENT_WARNINGS', errors);
    content = valid;
    console.log('CONTENT_LOADED', store.kind, Object.keys(content).join(',') || '(no overrides)');
  } catch (error) {
    // Не роняем сборку: сайт соберётся с последними текстами по умолчанию.
    console.warn('CONTENT_LOAD_FAILED', error.message);
  }
} else console.log('CONTENT_LOADED none (storage not configured)');
await writeFile('src/data/content.generated.json', JSON.stringify(content, null, 2) + '\n');
