// src/components/ProductCard.jsx
import Link from 'next/link';
import { FaWhatsapp, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const PLACEHOLDER = 'https://via.placeholder.com/400x300/F5F5F5/BDBDBD?text=No+Image';

const CONDITION_COLORS = {
  'new': { bg: '#E8F5E9', text: '#2E7D32', label: 'New' },
  'like-new': { bg: '#E3F2FD', text: '#1565C0', label: 'Like New' },
  'excellent': { bg: '#EDE7F6', text: '#4527A0', label: 'Excellent' },
  'good': { bg: '#FFF8E1', text: '#F57F17', label: 'Good' },
  'fair': { bg: '#FFF3E0', text: '#E65100', label: 'Fair' },
  'slightly-used': { bg: '#EFEBE9', text: '#4E342E', label: 'Slightly Used' },
  'for-parts': { bg: '#FFEBEE', text: '#C62828', label: 'For Parts' },
};

export default function ProductCard({ product, whatsappLink }) {
  const imageUrl = product.images?.[0] || PLACEHOLDER;
  const condition = CONDITION_COLORS[product.condition] || CONDITION_COLORS['good'];
  const appDeepLink = `cedimart://product/${product._id}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all group">
      <Link href={`/product/${product.slug}`} className="block relative overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: condition.bg, color: condition.text }}>
          {condition.label}
        </span>
        {product.negotiable && (
          <span className="absolute top-3 right-3 bg-green-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold">Negotiable</span>
        )}
      </Link>

      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 hover:text-green-600 transition">
            {product.name}
          </h3>
        </Link>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} size={11} className={i < Math.floor(product.rating) ? 'text-amber-400' : 'text-gray-200'} />
            ))}
            <span className="text-xs text-gray-500 ml-1">{product.rating.toFixed(1)}</span>
          </div>
        )}

        <div className="flex items-center gap-1 mb-3 text-xs text-gray-400">
          <FaMapMarkerAlt size={10} />
          <span>{product.campus}{product.location?.campusArea ? ` · ${product.location.campusArea}` : ''}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-extrabold text-green-700">GH₵ {product.price?.toLocaleString()}</span>
        </div>

        <div className="flex gap-2">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-bold transition">
            <FaWhatsapp size={14} /> Chat on WhatsApp
          </a>
          <a href={appDeepLink}
            className="flex-1 flex items-center justify-center gap-1 border border-green-200 hover:bg-green-50 text-green-700 py-2.5 rounded-xl text-xs font-bold transition text-center">
            View in App
          </a>
        </div>
      </div>
    </div>
  );
}