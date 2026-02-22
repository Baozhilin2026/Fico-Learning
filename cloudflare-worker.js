// Cloudflare Worker 代理脚本
// 用于让国内用户访问 Vercel 部署的网站

export default {
  async fetch(request, env, ctx) {
    // 目标 Vercel 网站
    const TARGET_HOST = 'fico-learning.vercel.app';

    const url = new URL(request.url);

    // 重写路径：将 /Fico-Learning/ 替换为 /
    let pathname = url.pathname;
    if (pathname.startsWith('/Fico-Learning/')) {
      pathname = pathname.replace('/Fico-Learning/', '/');
    } else if (pathname === '/Fico-Learning') {
      pathname = '/';
    }

    const targetUrl = 'https://' + TARGET_HOST + pathname + url.search;

    // 创建新的请求
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'manual'
    });

    // 设置正确的 Host 头
    modifiedRequest.headers.set('Host', TARGET_HOST);
    modifiedRequest.headers.set('X-Forwarded-Host', url.hostname);

    // 获取响应
    let response = await fetch(modifiedRequest);

    // 处理重定向
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('Location') || '';
      if (location.startsWith('https://' + TARGET_HOST)) {
        response = new Response(response.body, {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers),
            'Location': location.replace(
              'https://' + TARGET_HOST,
              'https://' + url.hostname
            )
          }
        });
      }
    }

    return response;
  }
};
