# Phase 2 Shared Components - Implementation Demo

## Overview

Phase 2 of the refactoring is now complete! We have successfully created shared components for:

### ✅ Phase 2.1: Header Components (Already Complete)
- `BaseHeader` - Abstract base class for all headers
- `DashboardHeader` - Dashboard screen header with search click
- `SearchHeader` - Search result header with active input
- `SuggestHeader` - Suggest screen header

### ✅ Phase 2.2: Form Components (Newly Created)
- `FormField` - Reusable form input with validation, states, and consistent styling
- `FormSection` - Groups related form fields with titles and descriptions

### ✅ Phase 2.3: Card Components (Newly Created)
- `BaseCard` - Abstract base class for all card types
- `ContentCard` - General-purpose card with title, description, image, and actions
- `ListCard` - Card that displays a list of items (perfect for checkout sections)
- `MetaCard` - Specialized card for advice grid and category items

## Usage Examples

### 1. Form Components in CheckoutScreen

**Before (Legacy Code):**
```typescript
// Old way - manual HTML creation with inline styles
private createPromoCodeField(): HTMLElement {
  const container = document.createElement('div');
  Object.assign(container.style, {
    marginBottom: '16px',
  });
  
  const input = document.createElement('input');
  Object.assign(input.style, {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    fontSize: '15px',
    fontWeight: '400',
    fontFamily: 'SB Sans Text',
    outline: 'none',
    boxSizing: 'border-box',
  });
  
  input.type = 'text';
  input.placeholder = 'Промокод';
  input.value = this.checkoutState.promoCode;
  
  input.addEventListener('input', event => {
    const target = event.target as HTMLInputElement;
    this.props.checkoutService.setPromoCode(target.value);
  });
  
  container.appendChild(input);
  return container;
}
```

**After (Using Shared Components):**
```typescript
import { FormField, FormFieldType } from '../Shared';

// New way - declarative configuration with built-in validation
private createPromoCodeField(): HTMLElement {
  const container = document.createElement('div');
  
  const promoField = new FormField({
    type: FormFieldType.TEXT,
    name: 'promoCode',
    placeholder: 'Промокод',
    value: this.checkoutState.promoCode,
    container: container,
    onChange: (value) => {
      this.props.checkoutService.setPromoCode(value);
    },
    onValidate: (value) => {
      // Optional: Add promo code validation
      if (value && value.length < 3) {
        return 'Промокод должен содержать минимум 3 символа';
      }
      return null;
    }
  });
  
  return container;
}
```

### 2. List Card for Checkout Sections

**Before (Legacy Code):**
```typescript
// Old way - complex manual DOM creation
private createListRow(icon: string, title: string, subtitle: string, badge: string, hasChevron: boolean, onClick?: () => void): HTMLElement {
  const row = document.createElement('div');
  Object.assign(row.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    cursor: onClick ? 'pointer' : 'default',
  });
  
  // ... 50+ lines of manual DOM creation
  
  return row;
}
```

**After (Using Shared Components):**
```typescript
import { ListCard } from '../Shared';

// New way - simple configuration
private createDeliverySection(): HTMLElement {
  const container = document.createElement('div');
  
  const deliveryCard = new ListCard({
    container: container,
    title: 'Доставка',
    items: [
      {
        id: 'delivery-method',
        icon: '🚀',
        title: 'Доставка курьером',
        subtitle: this.checkoutState.address,
        badge: 'Бесплатно',
        hasChevron: true,
        onClick: () => {
          console.log('Delivery method clicked');
          // TODO: Open delivery method selector
        }
      },
      {
        id: 'recipient',
        icon: '👤',
        title: 'Получатель',
        subtitle: `${this.checkoutState.recipientName}, ${this.checkoutState.recipientPhone}`,
        hasChevron: true,
        onClick: () => {
          console.log('Recipient clicked');
          // TODO: Open recipient editor
        }
      }
    ]
  });
  
  return container;
}
```

### 3. Meta Cards for Advice Grid

**Before (Legacy Code):**
```typescript
// Old way - manual creation with hardcoded styles
private createMetaItem(title: string, subtitle: string, icon: string): HTMLElement {
  const item = document.createElement('div');
  item.style.cssText = `
    display: flex;
    padding: 16px;
    align-items: center;
    gap: 12px;
    align-self: stretch;
    border-radius: 12px;
    border: 1px solid rgba(137, 137, 137, 0.15);
    background: #FFF;
    cursor: pointer;
  `;
  
  // ... complex icon and text creation
  
  return item;
}
```

**After (Using Shared Components):**
```typescript
import { MetaCard } from '../Shared';

// New way - clean configuration
private createAdviceItems(): HTMLElement[] {
  const items = [
    { title: 'Спортивная одежда', subtitle: '24 магазина', icon: '👕' },
    { title: 'Спортивное питание', subtitle: '18 магазинов', icon: '🥤' }
  ];
  
  return items.map(item => {
    const container = document.createElement('div');
    
    new MetaCard({
      container: container,
      title: item.title,
      subtitle: item.subtitle,
      icon: item.icon,
      cardType: 'small',
      onClick: () => {
        this.props.onItemClick?.(item.title.toLowerCase());
      }
    });
    
    return container;
  });
}
```

## Benefits Achieved

### 1. **Consistency**
- All form fields now have the same styling, behavior, and validation patterns
- All cards use consistent spacing, colors, and interaction states
- Headers follow unified structure across all screens

### 2. **Reusability**
- Form components can be used in any screen requiring input
- Card components work for any type of content display
- Header components adapt to different screen requirements

### 3. **Maintainability**
- Style changes only need to be made in one place
- Bug fixes automatically apply to all usage locations
- New features (like dark mode) can be added centrally

### 4. **Developer Experience**
- Less code to write for new features
- Declarative configuration instead of imperative DOM manipulation
- Built-in validation and state management

### 5. **Type Safety**
- Full TypeScript support with proper interfaces
- Compile-time checking of component properties
- Auto-completion in IDEs

## Next Steps (Phase 3)

With Phase 2 complete, we can now proceed to Phase 3: Screen Refactoring, where we'll:

1. Break down large screen components using the shared components
2. Extract screen-specific logic into smaller, focused classes
3. Implement proper separation of concerns
4. Add comprehensive testing for all components

The shared components foundation is now solid and ready to support the next phase of refactoring!