
import {
  Headphones, Smartphone, Laptop, Gamepad2, Shirt, BookOpen,
  Home, Plug, Sofa, Sparkles, Dumbbell, UtensilsCrossed, Wrench,
  Watch, Package, Ticket, Car, GraduationCap, Camera, Palette,
  Wrench as WrenchIcon, PartyPopper, Building2, ShoppingBasket,
} from 'lucide-react';

export const CATEGORIES = [
  // ── Electronics cluster ──────────────────────────────────────────
  {
    key: 'electronics',
    label: 'Electronics',
    icon: Headphones,
    sub: [
      'Headphones & Earbuds',
      'Speakers',
      'Chargers, Cables & Adapters',
      'Power Banks',
      'Smartwatches',
      'Cameras',
      'Projectors',
      'Calculators',
      'Other',
    ],
  },
  {
    key: 'phones and tablets',
    label: 'Phones & Tablets',
    icon: Smartphone,
    sub: [
      'Smartphones',
      'Tablets',
      'iPads',
      'Phone Cases',
      'Screen Protectors',
      'Tripods & Gimbals',
      'Memory Cards',
      'Other',
    ],
  },
  {
    key: 'computers and laptops',
    label: 'Computers & Laptops',
    icon: Laptop,
    sub: [
      'Laptops',
      'Desktops',
      'Monitors',
      'Keyboards',
      'Mouse',
      'Laptop Bags',
      'Hard Drives & SSDs',
      'USB Flash Drives',
      'Software',
      'Other',
    ],
  },
  {
    key: 'gaming',
    label: 'Gaming',
    icon: Gamepad2,
    sub: [
      'Consoles',
      'Games',
      'Controllers',
      'Gaming Headsets',
      'Accessories',
    ],
  },

  // ── Fashion cluster ──────────────────────────────────────────────
  {
    key: 'fashion',
    label: 'Fashion',
    icon: Shirt,
    sub: [
      "Men's Clothing",
      "Women's Clothing",
      'Unisex Clothing',
      'Shoes & Footwear',
      'Bags',
      'Watches & Jewelry',
      'Caps & Hats',
      'Other',
    ],
  },
  {
    key: 'accessories',
    label: 'Accessories',
    icon: Watch,
    sub: [
      'Wallets & Cardholders',
      'Belts',
      'Sunglasses',
      'Keychains & Lanyards',
      'Other',
    ],
  },
  {
    key: 'beauty and grooming',
    label: 'Beauty & Grooming',
    icon: Sparkles,
    sub: [
      'Skincare',
      'Makeup',
      'Hair Care & Wigs',
      'Perfumes',
      'Nail Care',
      'Other',
    ],
  },

  // ── Books + education ────────────────────────────────────────────
  {
    key: 'books-course-materials',
    label: 'Books & Materials',
    icon: BookOpen,
    sub: [
      'Textbooks',
      'Course Notes',
      'Past Questions',
      'Stationery',
      'Lab Coats & Equipment',
      'Novels & Literature',
      'Other',
    ],
  },
  {
    key: 'tutoring and education',
    label: 'Tutoring & Education',
    icon: GraduationCap,
    sub: [
      'Academic Tutoring',
      'Language Lessons',
      'Music Lessons',
      'Coding & Tech Lessons',
      'Exam Prep',
      'Professional Training',
      'Other',
    ],
  },

  // ── Home & hostel ────────────────────────────────────────────────
  {
    key: 'hostel-items',
    label: 'Hostel Items',
    icon: Home,
    sub: [
      'Bedding & Mattresses',
      'Kitchenware',
      'Cleaning Supplies',
      'Storage & Wardrobes',
      'Lighting & Lamps',
      'Mirrors',
      'Curtains & Mats',
      'Other',
    ],
  },
  {
    key: 'appliances',
    label: 'Appliances',
    icon: Plug,
    sub: [
      'Fans',
      'Refrigerators',
      'Kettles',
      'Blenders',
      'Irons',
      'Microwaves',
      'Rice Cookers',
      'Other',
    ],
  },
  {
    key: 'furniture',
    label: 'Furniture',
    icon: Sofa,
    sub: [
      'Chairs & Stools',
      'Tables & Desks',
      'Beds & Frames',
      'Shelves & Racks',
      'Other',
    ],
  },

  // ── Food cluster ─────────────────────────────────────────────────
  {
    key: 'food and drinks',
    label: 'Food & Drinks',
    icon: UtensilsCrossed,
    sub: [
      'Provisions',
      'Snacks',
      'Drinks',
      'Breakfast Packs',
      'Homemade Meals',
      'Baked Goods',
      'Night Bites',
      'Spices & Raw Food',
      'Other',
    ],
  },
  {
    key: 'groceries',
    label: 'Groceries',
    icon: ShoppingBasket,
    sub: [
      'Fresh Fruits & Vegetables',
      'Yam, Cassava & Plantains',
      'Rice, Beans & Grains',
      'Oils & Spices',
      'Eggs, Meat & Fish',
      'Other',
    ],
  },
  {
    key: 'events and catering',
    label: 'Events & Catering',
    icon: PartyPopper,
    sub: [
      'Event Planning',
      'Catering',
      'Decoration',
      'DJ & Music',
      'MC & Hosting',
      'Rentals & Equipment',
      'Other',
    ],
  },

  // ── Tickets & events ─────────────────────────────────────────────
  {
    key: 'tickets and events',
    label: 'Tickets & Events',
    icon: Ticket,
    sub: [
      'Concerts & Shows',
      'Seminars & Workshops',
      'Sports Tickets',
      'Bus Trips',
      'Conferences',
      'Other',
    ],
  },

  // ── Media & creative services ────────────────────────────────────
  {
    key: 'photography and media',
    label: 'Photography & Media',
    icon: Camera,
    sub: [
      'Photoshoots',
      'Videography',
      'Video Editing',
      'Drone Services',
      'Podcast & Audio',
      'Social Media',
      'Other',
    ],
  },
  {
    key: 'graphic-design-printing',
    label: 'Design & Printing',
    icon: Palette,
    sub: [
      'Logo & Branding',
      'Flyers & Posters',
      'Business Cards',
      'Bulk Printing',
      'Signage & Stickers',
      'UI/UX & Web Design',
      'Other',
    ],
  },

  // ── Repairs & transport ──────────────────────────────────────────
  {
    key: 'repair and services',
    label: 'Repairs',
    icon: WrenchIcon,
    sub: [
      'Phone Repairs',
      'Laptop & Computer Repairs',
      'TV & Appliance Repairs',
      'Car & Motorbike Repairs',
      'Furniture Repairs',
      'Shoe & Cobbler',
      'Tailoring & Alterations',
      'Other',
    ],
  },
  {
    key: 'transport and logistics',
    label: 'Transport & Delivery',
    icon: Car,
    sub: [
      'Bicycles',
      'Scooters & Skateboards',
      'Car Parts',
      'Motorbike Parts',
      'Delivery Services',
      'Moving & Logistics',
      'Other',
    ],
  },

  // ── Housing & general services ───────────────────────────────────
  {
    key: 'accommodation and housing',
    label: 'Housing',
    icon: Building2,
    sub: [
      'Short-Term Rentals',
      'Long-Term Rentals',
      'Hostel Rooms',
      'Roommate Listings',
      'Furnished Apartments',
      'Other',
    ],
  },
  {
    key: 'services',
    label: 'Services',
    icon: Wrench,
    sub: [
      'Cleaning Services',
      'Laundry',
      'Barbering & Hair',
      'Makeup Artistry',
      'Spa & Massage',
      'Personal Training',
      'Tutoring',
      'Tech Repairs',
      'Tailoring',
      'Car Wash',
      'Other',
    ],
  },

  // ── Sports ───────────────────────────────────────────────────────
  {
    key: 'sports and fitness',
    label: 'Sports & Fitness',
    icon: Dumbbell,
    sub: [
      'Sports Equipment',
      'Gym Gear',
      'Activewear',
      'Water Bottles',
      'Cycling & Skating',
      'Outdoor & Camping',
      'Supplements',
      'Other',
    ],
  },

  // ── Catch-all ────────────────────────────────────────────────────
  {
    key: 'other',
    label: 'Other',
    icon: Package,
    sub: [
      'Miscellaneous',
      'Free Items',
      'Wanted & Requests',
    ],
  },
];

