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