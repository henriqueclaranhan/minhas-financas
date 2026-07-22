import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://financas.claranhan.com.br';

const privacyStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Política de Privacidade | Minhas Finanças',
  url: `${SITE_URL}/privacidade`,
  description: 'Saiba como o Minhas Finanças protege e utiliza seus dados pessoais.',
  inLanguage: 'pt-BR',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Minhas Finanças',
    url: `${SITE_URL}/`,
  },
  dateModified: '2026-07-18',
};

function replaceMeta(html, attribute, key, content) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(<meta\\s+${attribute}="${escapedKey}"\\s+content=")[^"]*("\\s*/?>)`);
  return html.replace(pattern, `$1${content}$2`);
}

function replaceTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
}

function replaceCanonical(html, href) {
  return html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/, `$1${href}$2`);
}

function removeCanonical(html) {
  return html.replace(/\s*<link\s+rel="canonical"[^>]*>/, '');
}

function replaceStructuredData(html, data) {
  const script = `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>`;
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, script);
}

function removeStructuredData(html) {
  return html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
}

export function createStaticPages(indexHtml) {
  let privacy = replaceTitle(indexHtml, 'Política de Privacidade | Minhas Finanças');
  privacy = replaceMeta(privacy, 'name', 'description', 'Saiba como o Minhas Finanças protege e utiliza seus dados pessoais.');
  privacy = replaceMeta(privacy, 'property', 'og:title', 'Política de Privacidade | Minhas Finanças');
  privacy = replaceMeta(privacy, 'property', 'og:description', 'Saiba como o Minhas Finanças protege e utiliza seus dados pessoais.');
  privacy = replaceMeta(privacy, 'property', 'og:url', `${SITE_URL}/privacidade`);
  privacy = replaceMeta(privacy, 'name', 'twitter:title', 'Política de Privacidade | Minhas Finanças');
  privacy = replaceMeta(privacy, 'name', 'twitter:description', 'Saiba como o Minhas Finanças protege e utiliza seus dados pessoais.');
  privacy = replaceCanonical(privacy, `${SITE_URL}/privacidade`);
  privacy = replaceStructuredData(privacy, privacyStructuredData);

  let app = replaceMeta(indexHtml, 'name', 'robots', 'noindex, nofollow');
  app = removeCanonical(app);
  app = removeStructuredData(app);

  let notFound = replaceTitle(app, 'Página não encontrada | Minhas Finanças');
  notFound = replaceMeta(notFound, 'name', 'description', 'O endereço pode estar incorreto ou a página pode ter sido movida.');
  notFound = replaceMeta(notFound, 'property', 'og:title', 'Página não encontrada | Minhas Finanças');
  notFound = replaceMeta(notFound, 'property', 'og:description', 'O endereço pode estar incorreto ou a página pode ter sido movida.');

  return { privacy, app, notFound };
}

export async function generateStaticPages(outputDirectory) {
  const indexPath = join(outputDirectory, 'index.html');
  const indexHtml = await readFile(indexPath, 'utf8');
  const pages = createStaticPages(indexHtml);

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(join(outputDirectory, 'privacy.html'), pages.privacy),
    writeFile(join(outputDirectory, 'app.html'), pages.app),
    writeFile(join(outputDirectory, '404.html'), pages.notFound),
  ]);
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && currentFile === process.argv[1]) {
  const projectRoot = dirname(dirname(currentFile));
  await generateStaticPages(join(projectRoot, 'dist'));
}
