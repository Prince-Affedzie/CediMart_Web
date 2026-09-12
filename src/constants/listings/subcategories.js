// src/constants/listings/subcategories.js

/**
 * Subcategories grouped by parent category key.
 * Shape: { [categoryKey: string]: { id: string; label: string }[] }
 *
 * The `id` field is what gets sent to the API as `subcategory` param,
 * so it must match the `key` values used in your backend schema.
 */
export const SUBCATEGORIES = {
  'electronics': [
    { id: 'headphones-earbuds', label: 'Headphones & Earbuds' },
    { id: 'speakers', label: 'Bluetooth & Home Speakers' },
    { id: 'chargers-cables', label: 'Chargers, Cables & Adapters' },
    { id: 'power-banks', label: 'Power Banks' },
    { id: 'smartwatches', label: 'Smartwatches & Fitness Bands' },
    { id: 'cameras', label: 'Cameras & Vlogging Gear' },
    { id: 'projectors', label: 'Projectors & Screens' },
    { id: 'calculators-scientific', label: 'Scientific & Financial Calculators' },
    { id: 'extensions-plugs', label: 'Extension Boards & Adapters' },
    { id: 'trimmers-clippers', label: 'Hair Trimmers & Clippers' },
    { id: 'other-electronics', label: 'Other Electronics' },
  ],
  'phones and tablets': [
    { id: 'smartphones', label: 'Smartphones' },
    { id: 'tablets', label: 'Android Tablets' },
    { id: 'ipads', label: 'iPads' },
    { id: 'phone-cases', label: 'Phone Cases & Covers' },
    { id: 'screen-protectors', label: 'Screen Protectors' },
    { id: 'tripods-gimbals', label: 'Tripods & Phone Gimbals' },
    { id: 'memory-cards', label: 'MicroSD & Memory Cards' },
    { id: 'other-phone-accessories', label: 'Other Mobile Accessories' },
  ],
  'computers and laptops': [
    { id: 'laptops', label: 'Laptops' },
    { id: 'desktops', label: 'Desktop Towers & iMacs' },
    { id: 'monitors', label: 'Monitors & Displays' },
    { id: 'keyboards', label: 'Keyboards (Mechanical & Wireless)' },
    { id: 'mouse', label: 'Computer Mice' },
    { id: 'laptop-bags', label: 'Laptop Bags & Sleeves' },
    { id: 'hard-drives-ssds', label: 'External Hard Drives & SSDs' },
    { id: 'usb-flash-drives', label: 'USB Flash Drives (Pen Drives)' },
    { id: 'software', label: 'Operating Systems & Software Activation' },
    { id: 'other-computer-accessories', label: 'Other Computer Accessories' },
  ],
  'gaming': [
    { id: 'consoles', label: 'Gaming Consoles (PlayStation, Xbox, Switch)' },
    { id: 'games', label: 'Video Game Discs & Digital Codes' },
    { id: 'controllers', label: 'Gamepads & Controllers' },
    { id: 'gaming-headsets', label: 'Gaming Headsets' },
    { id: 'gaming-accessories', label: 'Gaming Accessories & VR Gear' },
  ],
  'fashion': [
    { id: 'men-clothing', label: 'Men Clothing' },
    { id: 'women-clothing', label: 'Women Clothing' },
    { id: 'unisex-clothing', label: 'Unisex Clothing (Hoodies, Tees)' },
    { id: 'sneakers-footwear', label: 'Sneakers, Crocs & Footwear' },
    { id: 'traditional-wear', label: 'Traditional & Custom Wear' },
    { id: 'thrift-bend-down', label: 'Thrift / Selection Items' },
    { id: 'bags', label: 'Backpacks & Handbags' },
    { id: 'watches-jewelry', label: 'Watches, Chains & Rings' },
    { id: 'caps-hats', label: 'Caps, Bucket Hats & Beanies' },
    { id: 'other-fashion', label: 'Other Fashion & Apparel' },
  ],
  'books-course-materials': [
    { id: 'textbooks', label: 'Academic Textbooks' },
    { id: 'course-notes', label: 'Printed Course Notes & Slides' },
    { id: 'past-questions', label: 'Past Questions & Pamphlets' },
    { id: 'stationery', label: 'Stationery (Notebooks, Pens, Files)' },
    { id: 'lab-coats-equipment', label: 'Lab Coats, Goggles & Science Kits' },
    { id: 'drawing-instruments', label: 'Drawing Boards & T-Squares' },
    { id: 'novels-literature', label: 'Novels & Fiction Literature' },
    { id: 'other-books', label: 'Other Educational Materials' },
  ],
  'hostel-items': [
    { id: 'bedding-mattresses', label: 'Bedsheets, Pillows & Mattresses' },
    { id: 'gas-cylinders-stoves', label: 'Gas Cylinders, Stoves & Regulators' },
    { id: 'kitchenware', label: 'Pots, Plates, Spoons & Bowls' },
    { id: 'buckets-containers', label: 'Buckets, Barrels & Water Storage' },
    { id: 'cleaning-supplies', label: 'Mops, Brooms & Detergents' },
    { id: 'storage-wardrobes', label: 'Plastic Wardrobes, Boxes & Hangers' },
    { id: 'lighting-lamps', label: 'Desk Lamps & Rechargeable Bulbs' },
    { id: 'mirrors', label: 'Body & Wall Mirrors' },
    { id: 'curtains-mats', label: 'Curtains & Door Mats' },
    { id: 'other-hostel', label: 'Other Hostel Room Items' },
  ],
  'appliances': [
    { id: 'fans', label: 'Standing, Desk & Orbit Fans' },
    { id: 'refrigerators', label: 'Mini Fridges & Tabletop Fridges' },
    { id: 'kettles', label: 'Electric Kettles' },
    { id: 'blenders', label: 'Blenders & Food Processors' },
    { id: 'irons', label: 'Pressing Irons' },
    { id: 'microwaves', label: 'Microwaves & Hot Plates' },
    { id: 'rice-cookers', label: 'Rice Cookers & Air Fryers' },
    { id: 'other-appliances', label: 'Other Home & Room Appliances' },
  ],
  'furniture': [
    { id: 'chairs-stools', label: 'Plastic Chairs, Study Chairs & Stools' },
    { id: 'tables-desks', label: 'Study Desks & Center Tables' },
    { id: 'beds-frames', label: 'Wooden & Metal Bed Frames' },
    { id: 'shelves-racks', label: 'Book Shelves & Shoe Racks' },
    { id: 'other-furniture', label: 'Other Furniture' },
  ],
  'beauty and grooming': [
    { id: 'skincare', label: 'Body Lotions, Oils & Serums' },
    { id: 'makeup', label: 'Makeup Kits & Cosmetics' },
    { id: 'hair-care-wigs', label: 'Hair Extensions, Wigs & Oils' },
    { id: 'perfumes-sprays', label: 'Perfumes, Colognes & Body Sprays' },
    { id: 'nail-care', label: 'Nail Polish & Manicure Tools' },
    { id: 'clippers-shavers', label: 'Personal Shavers & Grooming Tools' },
    { id: 'other-beauty', label: 'Other Beauty & Grooming' },
  ],
  'sports and fitness': [
    { id: 'sports-equipment', label: 'Football, Basketball & Tennis Gear' },
    { id: 'gym-gear', label: 'Dumbbells, Resistance Bands & Yoga Mats' },
    { id: 'activewear', label: 'Jerseys, Gym Shorts & Tracksuits' },
    { id: 'water-bottles', label: 'Sports Water Bottles & Shakers' },
    { id: 'other-sports', label: 'Other Sports & Fitness' },
  ],
  'accessories': [
    { id: 'wallets-cardholders', label: 'Wallets & Cardholders' },
    { id: 'belts', label: 'Leather & Casual Belts' },
    { id: 'sunglasses', label: 'Sunglasses & Clear Frames' },
    { id: 'keychains-lanyards', label: 'Keychains & Student Lanyards' },
    { id: 'other-accessories', label: 'Other General Accessories' },
  ],
  'food and drinks': [
    { id: 'provisions', label: 'Provisions (Milk, Milo, Sugar, Gari)' },
    { id: 'snacks', label: 'Chips, Cookies & Plantain Chips' },
    { id: 'drinks', label: 'Water, Soft Drinks & Juices' },
    { id: 'breakfast-packs', label: 'Breakfast Packs & Oatmeal' },
    { id: 'homemade-meals', label: 'Cooked Food & Standard Meals' },
    { id: 'baked-goods', label: 'Cakes, Bread & Pastries' },
    { id: 'night-bites', label: 'Late Night Fast Food' },
    { id: 'spices-raw-food', label: 'Rice, Eggs, Spices & Raw Ingredients' },
    { id: 'other-food', label: 'Other Food & Beverage Items' },
  ],
  'groceries': [
    { id: 'fresh-fruits-veg', label: 'Fresh Fruits & Vegetables' },
    { id: 'tubers-roots', label: 'Yam, Cassava & Plantains' },
    { id: 'grains-beans', label: 'Rice, Beans, Maize & Grains' },
    { id: 'oils-spices', label: 'Cooking Oils, Pepper & Spices' },
    { id: 'meat-fish-eggs', label: 'Eggs, Fresh Meat & Fish' },
    { id: 'other-groceries', label: 'Other Market Groceries' },
  ],
  'tickets and events': [
    { id: 'concerts-shows', label: 'Concerts, Raves & Art Shows' },
    { id: 'campus-dinners', label: 'Hall, Faculty & Department Dinners' },
    { id: 'bus-trips', label: 'Excursions, Weekend Trips & Bus Tickets' },
    { id: 'seminars-webinars', label: 'Student Seminars & Masterclasses' },
    { id: 'other-tickets', label: 'Other Event Tickets' },
  ],
  'transport and logistics': [
    { id: 'bicycles', label: 'Bicycles' },
    { id: 'scooters', label: 'Electric Scooters & Skateboards' },
    { id: 'campus-delivery', label: 'On-Campus Errands & Delivery Services' },
    { id: 'luggage-moving', label: 'Hostel Moving & Luggage Services' },
    { id: 'other-transport', label: 'Other Transport Options' },
  ],
  'services': [
    { id: 'tutoring', label: 'Academic Tutoring & Coding Lessons' },
    { id: 'graphic-design', label: 'Flyer Design, Branding & UI/UX' },
    { id: 'photography', label: 'Photoshoots & Video Editing' },
    { id: 'printing-photocopy', label: 'Bulk Printing, Binding & Photocopying' },
    { id: 'laundry', label: 'Washing & Ironing Services' },
    { id: 'barbering-hairdressing', label: 'Haircuts, Braiding & Wig Styling' },
    { id: 'tech-repairs', label: 'Phone, Laptop & Software Repairs' },
    { id: 'tailoring-alterations', label: 'Clothing Alterations & Tailoring' },
    { id: 'other-services', label: 'Other Student Services' },
  ],
  'tutoring-education': [
    { id: 'math-sciences', label: 'Maths, Physics, Chemistry & Bio' },
    { id: 'languages', label: 'English, French & Local Languages' },
    { id: 'coding-tech', label: 'Coding, Web Dev & Data Science' },
    { id: 'business-econ', label: 'Business, Economics & Accounting' },
    { id: 'exam-prep', label: 'WASSCE, SAT & IELTS Prep' },
    { id: 'music-arts', label: 'Music, Piano & Fine Art Lessons' },
    { id: 'other-tutoring', label: 'Other Subjects' },
  ],
  'photography-media': [
    { id: 'photoshoots', label: 'Portrait & Event Photoshoots' },
    { id: 'videography', label: 'Videography & Video Editing' },
    { id: 'drone', label: 'Drone Photography & Aerial Shots' },
    { id: 'social-media-mgmt', label: 'Social Media Content & Management' },
    { id: 'branding-content', label: 'Brand Content & Reels' },
    { id: 'other-media', label: 'Other Media Services' },
  ],
  'graphic-design-printing': [
    { id: 'flyer-design', label: 'Flyer & Poster Design' },
    { id: 'logo-branding', label: 'Logo & Brand Identity' },
    { id: 'ui-ux', label: 'UI/UX Design' },
    { id: 'printing', label: 'Bulk Printing & Photocopying' },
    { id: 'binding', label: 'Binding & Lamination' },
    { id: 'other-design', label: 'Other Design & Print' },
  ],
  'repair-services': [
    { id: 'phone-repair', label: 'Phone Screen & Battery Repair' },
    { id: 'laptop-repair', label: 'Laptop & Computer Repair' },
    { id: 'software-repair', label: 'Software & OS Installation' },
    { id: 'appliance-repair', label: 'Appliance Repair' },
    { id: 'other-repairs', label: 'Other Repair Services' },
  ],
  'events-catering': [
    { id: 'catering', label: 'Catering & Food Service' },
    { id: 'cake-baking', label: 'Cakes & Pastries' },
    { id: 'decor-setup', label: 'Event Decor & Setup' },
    { id: 'event-mc', label: 'MCs & Event Hosts' },
    { id: 'other-events', label: 'Other Event Services' },
  ],
  'accommodation-housing': [
    { id: 'single-room', label: 'Single Rooms' },
    { id: 'shared-room', label: 'Shared Rooms & Roommates' },
    { id: 'hostel', label: 'Hostel Beds' },
    { id: 'short-stay', label: 'Short Stays & Guest Housing' },
    { id: 'other-housing', label: 'Other Housing Options' },
  ],
  'other': [
    { id: 'miscellaneous', label: 'Miscellaneous Items' },
  ],
};

/**
 * Helper: returns subcategory array for a given category key.
 * Returns [] if the category has no subcategories.
 */
export const getSubcategoriesFor = (categoryKey) =>
  SUBCATEGORIES[categoryKey] || [];

/**
 * Helper: resolves a subcategory id to its human-readable label.
 */
export const getSubcategoryLabel = (categoryKey, subId) => {
  if (!subId) return '';
  const list = SUBCATEGORIES[categoryKey] || [];
  return list.find((s) => s.id === subId)?.label || subId;
};