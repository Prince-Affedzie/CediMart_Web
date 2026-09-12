// src/constants/listings/categories.js
import {
  Headphones, Smartphone, Laptop, Gamepad2, Shirt, BookOpen, Home,
  Plug, Sofa, Sparkles, Dumbbell, UtensilsCrossed, Wrench, Watch, Package,
} from 'lucide-react';

// `icon` is a lucide-react component reference (not JSX) so consumers can
// size/color/style it per context: <cat.icon size={15} className="..." />
export const CATEGORIES = [
  { key: 'electronics', label: 'Electronics', icon: Headphones,
    sub: ['Headphones & Earbuds', 'Speakers', 'Chargers & Cables', 'Power Banks', 'Smartwatches', 'Cameras', 'Other'] },
  { key: 'phones and tablets', label: 'Phones & Tablets', icon: Smartphone,
    sub: ['Smartphones', 'Tablets', 'iPads', 'Phone Cases', 'Screen Protectors', 'Other Accessories'] },
  { key: 'computers and laptops', label: 'Computers & Laptops', icon: Laptop,
    sub: ['Laptops', 'Desktops', 'Monitors', 'Keyboards', 'Mouse', 'Laptop Bags', 'Software', 'Other'] },
  { key: 'gaming', label: 'Gaming', icon: Gamepad2,
    sub: ['Consoles', 'Games', 'Controllers', 'Gaming Accessories'] },
  { key: 'fashion', label: 'Fashion', icon: Shirt,
    sub: ["Men's Clothing", "Women's Clothing", 'Unisex Clothing', 'Shoes', 'Bags', 'Watches', 'Jewelry', 'Other'] },
  { key: 'books-course-materials', label: 'Books & Materials', icon: BookOpen,
    sub: ['Textbooks', 'Course Notes', 'Past Questions', 'Stationery', 'Novels', 'Other'] },
  { key: 'hostel-items', label: 'Hostel Items', icon: Home,
    sub: ['Bedding', 'Kitchenware', 'Cleaning Supplies', 'Storage', 'Lighting', 'Other'] },
  { key: 'appliances', label: 'Appliances', icon: Plug,
    sub: ['Fans', 'Irons', 'Kettles', 'Blenders', 'Microwaves', 'Other'] },
  { key: 'furniture', label: 'Furniture', icon: Sofa,
    sub: ['Chairs', 'Tables & Desks', 'Beds & Mattresses', 'Shelves', 'Other'] },
  { key: 'beauty and grooming', label: 'Beauty & Grooming', icon: Sparkles,
    sub: ['Skincare', 'Makeup', 'Hair Care', 'Perfumes', 'Nail Care', 'Other'] },
  { key: 'sports and fitness', label: 'Sports & Fitness', icon: Dumbbell,
    sub: ['Sports Equipment', 'Gym Gear', 'Activewear', 'Other'] },
  { key: 'food and drinks', label: 'Food & Drinks', icon: UtensilsCrossed,
    sub: ['Snacks', 'Drinks', 'Homemade Meals', 'Baked Goods', 'Other'] },
  { key: 'services', label: 'Services', icon: Wrench,
    sub: ['Tutoring', 'Graphic Design', 'Photography', 'Printing', 'Laundry', 'Tech Repairs', 'Other'] },
  { key: 'accessories', label: 'Accessories', icon: Watch,
    sub: ['Phone Accessories', 'Laptop Accessories', 'Fashion Accessories', 'Other'] },
  { key: 'other', label: 'Other', icon: Package,
    sub: ['Miscellaneous'] },
];