import HomeSearchBar from '@/components/Home/HomeSearchBar';
import ReferEarnStrip from '@/components/Home/ReferEarnStrip';
import HomeTop from '@/components/Home/HomeTop';
import TrustStrip from '@/components/Home/TrustStrip';
import BrowseByCategory from '@/components/Home/BrowseByCategory';
import VendorSpotlight from '@/components/Home/VendorSpotlight';
import ProductGrid from '@/components/Home/ProductGrid';
import CategorySection from '@/components/Home/CategorySection';
import DealsRail from '@/components/Home/DealsRail';
import EscrowBanner from '@/components/Home/EscrowBanner';
import SeoIntro from '@/components/Home/SeoIntro';
import FloatingAiButton from '@/components/Home/FloatingAiButton';
import VisualSearchFab from '@/components/VisualSearchFab';
import WelcomeTips from '@/components/WelcomeTips';
import './home.css';

export default function HomePage() {
  return (
    <div className="home-page">
      <main className="home-main">
        

        <HomeTop />                 {/* sidebar + hero + promos */}
        <div className="only-mobile"><BrowseByCategory /></div>
        <TrustStrip />

        <DealsRail
          tag="urgent-sale" title="Flash Sales" subtitle="Grab them before they're gone"
          accent="danger" seeAllHref="/tag/urgent-sale"
        />

        <ProductGrid
          title="Featured Listings" subtitle="Hand-picked by our team"
          tag="featured" limit={12} seeAllHref="/tag/featured"
        />

        <VendorSpotlight title="New onboarded vendors" subtitle="Vendors who just joined" limit={12} />

        <EscrowBanner />

        <CategorySection category="phones and tablets" title="Phones & Tablets" subtitle="Smartphones, cases, and accessories" />
        <CategorySection category="computers and laptops" title="Computers & Laptops" subtitle="Laptops, accessories, and more" />

        <DealsRail tag="new-arrival" title="New Arrivals" subtitle="Just listed" accent="brand"  seeAllHref="/tag/new-arrival" />

        <CategorySection category="fashion" title="Fashion" subtitle="Shop fashion from trusted sellers" />

        <ProductGrid
          title="Popular" subtitle="Most viewed this week"
          tag="popular" limit={6} seeAllHref="/tag/popular?sort=popular"
        />

        <CategorySection category="beauty and grooming" title="Beauty & Grooming" subtitle="Skincare, makeup, and more" />

        <ProductGrid
          title="Just for you" subtitle="Curated for you"
          tag="student-favorite" limit={6} seeAllHref="/tag/student-favorite"
        />

        <SeoIntro />

        <WelcomeTips />
        <VisualSearchFab />
        <FloatingAiButton />
      </main>
    </div>
  );
}