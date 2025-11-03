/**
 * Cloudflare Worker para servir frontend estático do oConnector
 * Usa Workers Sites para servir arquivos estáticos
 */

export default {
  async fetch(request, env) {
    // Workers Sites usa __STATIC_CONTENT e __STATIC_CONTENT_MANIFEST
    // Mas com a nova API, podemos usar diretamente o env.ASSETS
    const url = new URL(request.url);
    let pathname = url.pathname;
    
    // Normalizar caminho
    if (pathname === '/') {
      pathname = '/index.html';
    } else if (!pathname.includes('.')) {
      // Se não tem extensão, é uma rota SPA - servir index.html
      pathname = '/index.html';
    }
    
    // Criar novo request para buscar o asset
    const assetRequest = new Request(new URL(pathname, url.origin).toString(), request);
    
    try {
      // Tentar buscar arquivo usando o binding ASSETS
      let response = await env.ASSETS.fetch(assetRequest);
      
      // Se não encontrar e não for index.html, tentar index.html (SPA routing)
      if (response.status === 404 && pathname !== '/index.html') {
        const indexRequest = new Request(new URL('/index.html', url.origin).toString(), request);
        response = await env.ASSETS.fetch(indexRequest);
        
        if (response.status === 200) {
          return new Response(response.body, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
            },
          });
        }
      }
      
      // Se encontrou o arquivo, retornar com headers apropriados
      if (response.status === 200) {
        const headers = new Headers(response.headers);
        headers.set('Content-Type', getContentType(pathname));
        headers.set('Cache-Control', pathname.includes('_next') 
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=3600');
        
        return new Response(response.body, {
          status: response.status,
          headers: headers,
        });
      }
      
      return response;
    } catch (e) {
      // Em caso de erro, tentar servir index.html
      try {
        const indexRequest = new Request(new URL('/index.html', url.origin).toString(), request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);
        
        if (indexResponse.status === 200) {
          return new Response(indexResponse.body, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
            },
          });
        }
      } catch (e2) {
        console.error('Error serving assets:', e2);
      }
      
      return new Response('Not Found', { status: 404 });
    }
  }
};

function getContentType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const types = {
    'html': 'text/html; charset=utf-8',
    'js': 'application/javascript',
    'css': 'text/css',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'eot': 'application/vnd.ms-fontobject',
    'txt': 'text/plain',
  };
  return types[ext] || 'application/octet-stream';
}

