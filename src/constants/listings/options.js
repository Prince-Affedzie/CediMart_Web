// src/constants/listings/options.js
import { GraduationCap, Laptop, Shirt, UtensilsCrossed } from 'lucide-react';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

export const CAMPUS_OPTIONS = [
  { value: '', label: 'All Campuses' },
  { value: 'UG', label: 'University of Ghana' },
  { value: 'KNUST', label: 'KNUST' },
  { value: 'UCC', label: 'UCC' },
  { value: 'UPSA', label: 'UPSA' },
  { value: 'GIMPA', label: 'GIMPA' },
  { value: 'ASHESI', label: 'Ashesi' },
  { value: 'UEW', label: 'UEW' },
  { value: 'ATU', label: 'ATU' },
];

export const HERO_SLIDES = [
  { id: '1', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1780782982/flyer13_1_fyp0xj.png', tagIcon: GraduationCap, tag: 'Campus Marketplace', title: 'Buy & Sell on\nCampus', subtitle: "Connect with students across Ghana's top universities", category: '', btnText: 'Start Browsing' },
  { id: '2', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1780771354/flyer11_qkxwpv.jpg', tagIcon: Laptop, tag: 'Electronics & Gadgets', title: 'Laptops, Phones\n& More', subtitle: 'Student-priced tech from trusted campus sellers', category: 'electronics', btnText: 'Shop Electronics' },
  { id: '3', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1781101245/fashion_banner_ibwmaz.png', tagIcon: Shirt, tag: 'Fashion & Style', title: 'Upgrade Your\nWardrobe', subtitle: 'Trendy outfits, accessories & vintage finds at great prices', category: 'fashion', btnText: 'Shop Fashion' },
  { id: '4', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1781891792/food_nad_provisions_1_m6fvfn.png', tagIcon: UtensilsCrossed, tag: 'Food & Provisions', title: 'Stock Up on\nFood & Provisions', subtitle: 'Groceries, snacks, drinks and daily essentials delivered to your doorstep', category: 'food and drinks', btnText: 'Shop Food' },
];


// src/constants/listings/conditions.js
export const CONDITION_OPTIONS = [
  { value: '',              label: 'Any' },
  { value: 'new',           label: 'New' },
  { value: 'like-new',      label: 'Like New' },
  { value: 'excellent',     label: 'Excellent' },
  { value: 'good',          label: 'Good' },
  { value: 'fair',          label: 'Fair' },
  { value: 'slightly-used', label: 'Slightly Used' },
  { value: 'for-parts',     label: 'For Parts' },
];



export const GHANA_LOCATIONS = {
  'Accra': {
    label: 'Accra',
    region: 'Greater Accra',
    suburbs: [
      'Madina', 'Adenta', 'East Legon', 'West Legon','Legon','Haatso','Kaneshie',
      'Dome', 'Achimota', 'Dansoman', 'Osu','Ablekuma',
      'Labone', 'Cantonments', 'Airport Residential', 'Spintex','Pokuase',
      'Teshie', 'Nungua', 'Tema Community 1', 'Tema Community 25','Amasaman',
      'Ashaiman', 'Lapaz', 'Tesano', 'Awoshie', 'Weija',
      'Mallam', 'Kasoa', 'Other (Accra)',
    ],
  },
  'Kumasi': {
    label: 'Kumasi',
    region: 'Ashanti',
    suburbs: [
      'Adum', 'Asokwa', 'Bantama', 'Suame', 'Tafo',
      'Ayeduase', 'Bomso', 'Kotei', 'Ahodwo', 'Nhyiaeso',
      'Buokrom', 'Manhyia', 'Atonsu', 'Santasi', 'Other (Kumasi)',
    ],
  },
  'Tamale': {
    label: 'Tamale',
    region: 'Northern',
    suburbs: [
      'Tamale Central', 'Sagnarigu', 'Kalpohin', 'Nyohini',
      'Vittin', 'Lamashegu', 'Other (Tamale)',
    ],
  },
  'Takoradi': {
    label: 'Takoradi',
    region: 'Western',
    suburbs: [
      'Takoradi Central', 'Effia-Nkwanta', 'Kwesimintsim', 'Airport Ridge',
      'Anaji', 'Beach Road', 'Other (Takoradi)',
    ],
  },
  'Cape Coast': {
    label: 'Cape Coast',
    region: 'Central',
    suburbs: [
      'Cape Coast Central', 'Abura', 'Pedu', 'Amamoma',
      'Kwaprow', 'Apewosika', 'Other (Cape Coast)',
    ],
  },
  'Tema': {
    label: 'Tema',
    region: 'Greater Accra',
    suburbs: [
      'Tema Community 1', 'Tema Community 2', 'Tema Community 4',
      'Tema Community 7', 'Tema Community 9', 'Tema Community 25',
      'Ashaiman', 'Other (Tema)',
    ],
  },
  'Koforidua': {
    label: 'Koforidua',
    region: 'Eastern',
    suburbs: [
      'Koforidua Central', 'Effiduase', 'Adweso', 'Betom',
      'Nsukwao', 'Other (Koforidua)',
    ],
  },
  'Sunyani': {
    label: 'Sunyani',
    region: 'Bono',
    suburbs: [
      'Sunyani Central', 'Fiapre', 'Area 4', 'Penkwase',
      'Other (Sunyani)',
    ],
  },
  'Ho': {
    label: 'Ho',
    region: 'Volta',
    suburbs: [
      'Ho Central', 'Bankoe', 'Ahoe', 'Dome',
      'Other (Ho)',
    ],
  },
  'Wa': {
    label: 'Wa',
    region: 'Upper West',
    suburbs: [
      'Wa Central', 'Kpaguri', 'Bamahu',
      'Other (Wa)',
    ],
  },
  'Bolgatanga': {
    label: 'Bolgatanga',
    region: 'Upper East',
    suburbs: [
      'Bolgatanga Central', 'Zuarungu', 'Other (Bolgatanga)',
    ],
  },
  'Other': {
    label: 'Other Location',
    region: '',
    suburbs: [],
  },
};


export const CITY_OPTIONS = Object.entries(GHANA_LOCATIONS)
  .map(([id, { label, region }]) => ({ id, label, region }));

//  Suburbs for a given city id — always returns an array.
export const getSuburbs = (cityId) => GHANA_LOCATIONS[cityId]?.suburbs || [];

//  Human-readable location string.
export const formatLocation = ({ city, area, suburb } = {}) => {
  const sub = suburb || area;
  if (sub && city) return `${sub}, ${GHANA_LOCATIONS[city]?.label || city}`;
  if (city) return GHANA_LOCATIONS[city]?.label || city;
  return '';
};