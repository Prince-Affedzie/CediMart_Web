// src/app/page.js
'use client';

//import Header from '@/components/Layout/Header';
import ReferEarnStrip from '@/components/Home/ReferEarnStrip';
import FeaturedCarousel from '@/components/Home/FeaturedCarousel';
import BrowseByCategory from '@/components/Home/BrowseByCategory';
import VendorSpotlight from '@/components/Home/VendorSpotlight';
import ProductGrid from '@/components/Home/ProductGrid';
import CategorySection from '@/components/Home/CategorySection';
import DealsRail from '@/components/Home/DealsRail';
import EscrowBanner from '@/components/Home/EscrowBanner';
//import Footer from '@/components/Layout/Footer';
import './home.css';

export default function HomePage() {
  return (
    <div className="home-page">
     {/* <Header />*/}

      <main className="home-main">
      

        {/* 2. Featured products carousel — real listings, real prices */}
        <FeaturedCarousel />

        {/* 3. Browse by category — horizontal pills, mobile-parity */}
        <BrowseByCategory />

        {/* 4. Vendor spotlight — avatars + "see all" */}
        <VendorSpotlight title="Featured vendors" subtitle="Top-rated sellers" limit={12} />

        {/* 5. Featured listings grid */}
        <ProductGrid
          title="Featured Listings"
          subtitle="Hand-picked by our team"
          tag="featured"
          limit={12}
          seeAllHref="/listings?tag=featured"
        />

        {/* 6. Category: Fashion */}
        <CategorySection
          category="fashion"
          title="Fashion"
          subtitle="Shop fashion from trusted sellers"
        />

        {/* 7. Category: Computers & Laptops */}
        <CategorySection
          category="computers and laptops"
          title="Computers & Laptops"
          subtitle="Laptops, accessories, and more"
        />

        {/* 8. Flash Sales — horizontal deal cards */}
        <DealsRail
          tag="urgent-sale"
          title="Flash Sales"
          subtitle="Grab them before they're gone"
          accent="danger"
          seeAllHref="/listings?tag=urgent-sale"
        />

        {/* 9. Category: Phones & Tablets */}
        <CategorySection
          category="phones and tablets"
          title="Phones & Tablets"
          subtitle="Smartphones, cases, and accessories"
        />

        {/* 10. Popular */}
        <ProductGrid
          title="Popular"
          subtitle="Most viewed this week"
          tag="popular"
          limit={10}
          seeAllHref="/listings?tag=popular&sort=popular"
        />

        {/* 11. Category: Beauty & Grooming */}
        <CategorySection
          category="beauty and grooming"
          title="Beauty & Grooming"
          subtitle="Skincare, makeup, and more"
        />

        {/* 12. New Arrivals */}
        <DealsRail
          tag="new-arrival"
          title="New Arrivals"
          subtitle="Just listed"
          seeAllHref="/listings?tag=new-arrival&sort=newest"
        />

        {/* 13. Just for you */}
        <ProductGrid
          title="Just for you"
          subtitle="Curated for you"
          tag="student-favorite"
          limit={10}
          seeAllHref="/listings?tag=student-favorite"
        />

        {/* 14. Escrow banner */}
        <EscrowBanner />
      </main>

      {/*<Footer />*/}
    </div>
  );
}