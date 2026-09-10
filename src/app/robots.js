export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/portal/', '/api/'],
      },
    ],
    sitemap: 'https://mecelfabpvtltd.com/sitemap.xml',
  };
}
