import { Product } from '../../types';

/**
 * Consolidated mock product data previously duplicated across multiple files
 * Source files: OrganizationScreen.ts, ShopScreen.ts, CartService.ts
 */
export const SPORTS_CLOTHING_PRODUCTS: Product[] = [
  {
    id: 'tommy-hilfiger-pants-blue-s',
    title: 'Мужские спортивные брюки Tommy Hilfiger, синие, S',
    description: 'Стильные спортивные брюки Tommy Hilfiger',
    price: 7349,
    imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720111201494_1.jpg',
    badges: ['Премиум', 'Быстрая доставка'],
    brand: 'Tommy Hilfiger',
    size: 'S',
    color: 'синие',
    category: 'Спортивная одежда',
  },
  {
    id: 'tommy-hilfiger-pants-black-s',
    title: 'Мужские спортивные брюки Tommy Hilfiger, чёрные, S',
    description: 'Элегантные спортивные брюки Tommy Hilfiger',
    price: 7489,
    imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720111205591_1.jpg',
    badges: ['Премиум', 'Хит продаж'],
    brand: 'Tommy Hilfiger',
    size: 'S',
    color: 'чёрные',
    category: 'Спортивная одежда',
  },
  {
    id: 'tommy-hilfiger-pants-green-xl',
    title: 'Брюки Tommy Hilfiger спортивные, зелёные, XL',
    description: 'Комфортные спортивные брюки Tommy Hilfiger',
    price: 10529,
    imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720646433131_1.jpg',
    badges: ['Премиум', 'Новинка'],
    brand: 'Tommy Hilfiger',
    size: 'XL',
    color: 'зелёные',
    category: 'Спортивная одежда',
  },
  {
    id: 'nike-pants-french-terry-gray-s',
    title: 'Мужские спортивные брюки Nike French Terry, серые, S',
    description: 'Дышащие спортивные брюки Nike',
    price: 2455,
    imageUrl: 'https://cm.samokat.ru/processed/l/product_card/7cd57dbc-42aa-4977-859f-37bd02df6309.jpg',
    badges: ['Хит продаж', 'Быстрая доставка'],
    brand: 'Nike',
    size: 'S',
    color: 'серые',
    category: 'Спортивная одежда',
  },
  {
    id: 'nike-pants-repeat-blue-l',
    title: 'Мужские спортивные брюки Nike Repeat, синие, L',
    description: 'Удобные спортивные брюки Nike',
    price: 2438,
    imageUrl: 'https://cm.samokat.ru/processed/l/product_card/195870919801_1.jpg',
    badges: ['Популярные'],
    brand: 'Nike',
    size: 'L',
    color: 'синие',
    category: 'Спортивная одежда',
  },
  {
    id: 'nike-pants-yoga-drifit-gray-l',
    title: 'Мужские спортивные брюки Nike Yoga Dri‑Fit, серые, L',
    description: 'Технологичные спортивные брюки Nike',
    price: 2629,
    imageUrl: 'https://cm.samokat.ru/processed/l/product_card/0194501845649_1.jpg',
    badges: ['Технология Dri-Fit'],
    brand: 'Nike',
    size: 'L',
    color: 'серые',
    category: 'Спортивная одежда',
  },
  {
    id: 'nike-pants-repeat-white-l',
    title: 'Мужские спортивные брюки Nike Repeat, белые, L',
    description: 'Классические спортивные брюки Nike',
    price: 2438,
    imageUrl: 'https://cm.samokat.ru/processed/l/product_card/195870919740_1.jpg',
    badges: ['Классика'],
    brand: 'Nike',
    size: 'L',
    color: 'белые',
    category: 'Спортивная одежда',
  },
  {
    id: 'adidas-pants-gm5542-s',
    title: 'Брюки Adidas GM5542, размер S',
    description: 'Спортивные брюки Adidas',
    price: 1632,
    imageUrl: 'https://cm.samokat.ru/processed/l/product_card/4064044668639_1.jpg',
    badges: ['Доступные'],
    brand: 'Adidas',
    size: 'S',
    color: 'чёрные',
    category: 'Спортивная одежда',
  },
];

/**
 * Additional product categories for future expansion
 */
export const SPORTS_EQUIPMENT_PRODUCTS: Product[] = [
  // Placeholder for future sports equipment products
];

export const FITNESS_ACCESSORIES_PRODUCTS: Product[] = [
  // Placeholder for future fitness accessories
];