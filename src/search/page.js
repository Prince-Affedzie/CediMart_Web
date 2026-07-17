// src/app/search/page.js
import { Suspense } from 'react';
import Link from 'next/link';
import { FaSearch, FaSparkles } from 'react-icons/fa';
import { aiSearch, getWhatsAppLink } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

async function SearchResults({ query }) {
  try {
    const data = await aiSearch(query);

    if (!data.success || data.results?.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-2">No results found for "{query}"</p>
          <p className="text-gray-400 text-sm mb-6">Try different keywords or browse categories</p>
          <Link href="/" className="text-green-600 font-semibold hover:underline">← Back to search</Link>
        </div>
      );
    }

    return (
      <div>
        {/* AI Response */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 border border-green-100 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <FaSparkles className="text-white" size={14} />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700 mb-2">Ask CediAI</p>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">{data.aiResponse}</p>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Found {data.count} product{data.count !== 1 ? 's' : ''} for "{query}"
        </p>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {data.results.map((product) => (
            <ProductCard key={product._id} product={product} whatsappLink={getWhatsAppLink(product)} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg mb-2">Something went wrong</p>
        <p className="text-gray-400 text-sm mb-6">Please try again later</p>
        <Link href="/" className="text-green-600 font-semibold hover:underline">← Back to search</Link>
      </div>
    );
  }
}

function SearchLoading() {
  return (
    <div className="text-center py-16">
      <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-gray-500">Searching with AI...</p>
    </div>
  );
}

export default function SearchPage({ searchParams }) {
  const query = searchParams.q || '';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Bar */}
        <form action="/search" method="GET" className="mb-6 sm:mb-8">
          <div className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <FaSearch className="ml-4 text-gray-400 flex-shrink-0" size={16} />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search again..."
              className="flex-1 px-4 py-3 sm:py-4 text-base text-gray-900 placeholder-gray-400 outline-none"
            />
            <button type="submit" className="px-5 sm:px-6 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition">
              Search
            </button>
          </div>
        </form>

        {query ? (
          <Suspense fallback={<SearchLoading />}>
            <SearchResults query={query} />
          </Suspense>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Enter a search query to find products</p>
            <Link href="/" className="text-green-600 font-semibold mt-4 inline-block hover:underline">← Go to home</Link>
          </div>
        )}
      </div>
    </main>
  );
}