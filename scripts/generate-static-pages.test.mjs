import assert from 'node:assert/strict';
import test from 'node:test';
import { createStaticPages } from './generate-static-pages.mjs';

const template = `<!doctype html><html lang="pt-BR"><head>
<meta name="description" content="Home description" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://financas.claranhan.com.br/" />
<meta property="og:title" content="Home" />
<meta property="og:description" content="Home description" />
<meta property="og:url" content="https://financas.claranhan.com.br/" />
<meta name="twitter:title" content="Home" />
<meta name="twitter:description" content="Home description" />
<script type="application/ld+json">{"@type":"WebApplication"}</script>
<title>Home</title></head><body><div id="root"></div></body></html>`;

test('creates privacy metadata in the server-delivered document', () => {
  const { privacy } = createStaticPages(template);

  assert.match(privacy, /<title>Política de Privacidade \| Minhas Finanças<\/title>/);
  assert.match(privacy, /rel="canonical" href="https:\/\/financas\.claranhan\.com\.br\/privacidade"/);
  assert.match(privacy, /"@type": "WebPage"/);
  assert.match(privacy, /"inLanguage": "pt-BR"/);
});

test('makes private application and not-found documents non-indexable', () => {
  const { app, notFound } = createStaticPages(template);

  assert.match(app, /name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(app, /rel="canonical"/);
  assert.doesNotMatch(app, /application\/ld\+json/);
  assert.match(notFound, /<title>Página não encontrada \| Minhas Finanças<\/title>/);
  assert.match(notFound, /name="robots" content="noindex, nofollow"/);
});
