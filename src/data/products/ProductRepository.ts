import { Product, ProductCategory } from '../../types';
import {
  FITNESS_ACCESSORIES_PRODUCTS,
  SPORTS_CLOTHING_PRODUCTS,
  SPORTS_EQUIPMENT_PRODUCTS,
} from './MockProducts';

/**
 * Centralized product data access and management
 * Replaces duplicate product arrays across OrganizationScreen, ShopScreen, and CartService
 */
export class ProductRepository {
  private static instance: ProductRepository;
  private products: Product[];

  private constructor() {
    this.products = [
      ...SPORTS_CLOTHING_PRODUCTS,
      ...SPORTS_EQUIPMENT_PRODUCTS,
      ...FITNESS_ACCESSORIES_PRODUCTS,
    ];
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ProductRepository {
    if (!ProductRepository.instance) {
      ProductRepository.instance = new ProductRepository();
    }
    return ProductRepository.instance;
  }

  /**
   * Get all sports clothing products (main use case)
   */
  getSportsClothing(): Product[] {
    return [...SPORTS_CLOTHING_PRODUCTS];
  }

  /**
   * Get all products
   */
  getAllProducts(): Product[] {
    return [...this.products];
  }

  /**
   * Get products by category
   */
  getByCategory(category: string): Product[] {
    return this.products.filter(product => product.category === category);
  }

  /**
   * Get product by ID
   */
  getById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  /**
   * Get products by brand
   */
  getByBrand(brand: string): Product[] {
    return this.products.filter(product => product.brand === brand);
  }

  /**
   * Get products by price range
   */
  getByPriceRange(minPrice: number, maxPrice: number): Product[] {
    return this.products.filter(product => product.price >= minPrice && product.price <= maxPrice);
  }

  /**
   * Search products by text (title, description, brand)
   */
  search(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return this.products.filter(
      product =>
        product.title.toLowerCase().includes(lowerQuery) ||
        product.description?.toLowerCase().includes(lowerQuery) ||
        product.brand?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get product categories with product counts
   */
  getCategories(): ProductCategory[] {
    const categoryMap = new Map<string, Product[]>();

    this.products.forEach(product => {
      const category = product.category || 'Разное';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(product);
    });

    return Array.from(categoryMap.entries()).map(([name, products]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      count: products.length,
      products,
    }));
  }

  /**
   * Get featured products (with specific badges)
   */
  getFeaturedProducts(): Product[] {
    const featuredBadges = ['Премиум', 'Хит продаж', 'Новинка'];
    return this.products.filter(product =>
      product.badges?.some(badge => featuredBadges.includes(badge))
    );
  }

  /**
   * Get products by size
   */
  getBySize(size: string): Product[] {
    return this.products.filter(product => product.size === size);
  }

  /**
   * Get available sizes
   */
  getAvailableSizes(): string[] {
    const sizes = new Set<string>();
    this.products.forEach(product => {
      if (product.size) {
        sizes.add(product.size);
      }
    });
    return Array.from(sizes).sort();
  }

  /**
   * Get available brands
   */
  getAvailableBrands(): string[] {
    const brands = new Set<string>();
    this.products.forEach(product => {
      if (product.brand) {
        brands.add(product.brand);
      }
    });
    return Array.from(brands).sort();
  }


}

/**
 * Convenience function to get the repository instance
 */
export function getProductRepository(): ProductRepository {
  return ProductRepository.getInstance();
}
