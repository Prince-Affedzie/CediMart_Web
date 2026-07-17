// src/lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function aiSearch(query) {
  const res = await fetch(`${API_URL}/api/ai/i/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getProduct(slug) {
  const res = await fetch(`${API_URL}/products/slug/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function getTrendingProducts() {
  const res = await fetch(`${API_URL}/products?sort=popular&limit=12`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) return [];
  return res.json();
}

export function getWhatsAppLink(product) {
  const message = encodeURIComponent(
    `Hi! I'm interested in "${product.name}" (GH₵ ${product.price}) listed on CediMart. Is it still available?`
  );
  return `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${message}`;
}

export function getAppDeepLink(productId) {
  return `cedimart://product/${productId}`;
}