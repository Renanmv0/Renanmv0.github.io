// Mapa do site para buscadores (o site tem uma página só)
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${new URL('/', site).href}</loc><lastmod>${hoje}</lastmod></url>
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
