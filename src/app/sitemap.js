export default async function sitemap() {
  const baseUrl = 'https://cedimartgh.com';

  // 1. Define your static routes
  const staticRoutes = [
    '',             // Home page
    '/listings',    // Shop/Products page
    //'/categories',  // Categories page
    '/about',       // About Us
    '/contact'      // Contact page
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Fetch dynamic routes (e.g., from your database or API)
  // const products = await getProducts(); 
  // const dynamicRoutes = products.map((product) => ({
  //   url: `${baseUrl}/products/${product.slug}`,
  //   lastModified: new Date(product.updatedAt),
  //   changeFrequency: 'weekly',
  //   priority: 0.6,
  // }));

  // 3. Combine and return all routes
  return [...staticRoutes /*, ...dynamicRoutes */];
}