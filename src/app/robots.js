export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/portal/', '/auth/', '/api/'],
      },
    ],
    sitemap: 'https://mecelfabpvtltd.com/sitemap.xml',
  };
}
