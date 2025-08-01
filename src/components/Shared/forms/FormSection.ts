import { FormField, FormFieldConfig } from './FormField';

/**
 * Form section configuration
 */
export interface FormSectionConfig {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** CSS class */
  className?: string;
  /** Container element */
  container: HTMLElement;
  /** Section padding */
  padding?: string;
  /** Show section divider */
  showDivider?: boolean;
}

/**
 * Form section component
 * Groups related form fields with optional title and description
 */
export class FormSection {
  private config: FormSectionConfig;
  private element: HTMLElement;
  private fieldsContainer!: HTMLElement;
  private fields: Map<string, FormField> = new Map();

  constructor(config: FormSectionConfig) {
    this.config = config;
    this.element = config.container;
    this.initialize();
  }

  /**
   * Initialize the form section
   */
  private initialize(): void {
    this.setupElement();
    this.createSection();
  }

  /**
   * Setup container element
   */
  private setupElement(): void {
    this.element.innerHTML = '';
    Object.assign(this.element.style, {
      marginBottom: '24px',
    });

    if (this.config.className) {
      this.element.className = this.config.className;
    }
  }

  /**
   * Create section structure
   */
  private createSection(): void {
    // Create section wrapper
    const sectionWrapper = document.createElement('div');
    Object.assign(sectionWrapper.style, {
      padding: this.config.padding || '24px 16px 0 16px',
    });

    // Create title if provided
    if (this.config.title) {
      this.createTitle(sectionWrapper);
    }

    // Create description if provided
    if (this.config.description) {
      this.createDescription(sectionWrapper);
    }

    // Create fields container
    this.fieldsContainer = document.createElement('div');
    Object.assign(this.fieldsContainer.style, {
      marginTop: this.config.title || this.config.description ? '16px' : '0',
    });
    sectionWrapper.appendChild(this.fieldsContainer);

    this.element.appendChild(sectionWrapper);

    // Add divider if requested
    if (this.config.showDivider) {
      this.createDivider();
    }
  }

  /**
   * Create section title
   */
  private createTitle(container: HTMLElement): void {
    const title = document.createElement('h2');
    Object.assign(title.style, {
      margin: '0 0 8px 0',
      fontSize: '17px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.43px',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
    });
    title.textContent = this.config.title!;
    container.appendChild(title);
  }

  /**
   * Create section description
   */
  private createDescription(container: HTMLElement): void {
    const description = document.createElement('p');
    Object.assign(description.style, {
      margin: '0',
      fontSize: '15px',
      fontWeight: '400',
      lineHeight: '20px',
      color: '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
    });
    description.textContent = this.config.description!;
    container.appendChild(description);
  }

  /**
   * Create section divider
   */
  private createDivider(): void {
    const divider = document.createElement('div');
    Object.assign(divider.style, {
      height: '1px',
      backgroundColor: 'rgba(137, 137, 137, 0.15)',
      margin: '0 16px',
    });
    this.element.appendChild(divider);
  }

  /**
   * Add a form field to the section
   */
  public addField(fieldConfig: FormFieldConfig): FormField {
    // Create field container
    const fieldContainer = document.createElement('div');
    this.fieldsContainer.appendChild(fieldContainer);

    // Create field
    const field = new FormField({
      ...fieldConfig,
      container: fieldContainer,
    });

    // Store field reference
    this.fields.set(fieldConfig.name, field);

    return field;
  }

  /**
   * Add multiple fields to the section
   */
  public addFields(fieldsConfig: FormFieldConfig[]): FormField[] {
    return fieldsConfig.map(config => this.addField(config));
  }

  /**
   * Get a field by name
   */
  public getField(name: string): FormField | undefined {
    return this.fields.get(name);
  }

  /**
   * Get all fields
   */
  public getFields(): FormField[] {
    return Array.from(this.fields.values());
  }

  /**
   * Get field values as object
   */
  public getValues(): Record<string, string> {
    const values: Record<string, string> = {};
    this.fields.forEach((field, name) => {
      values[name] = field.getValue();
    });
    return values;
  }

  /**
   * Set field values from object
   */
  public setValues(values: Record<string, string>): void {
    Object.entries(values).forEach(([name, value]) => {
      const field = this.fields.get(name);
      if (field) {
        field.setValue(value);
      }
    });
  }

  /**
   * Validate all fields in the section
   */
  public validate(): boolean {
    let isValid = true;
    this.fields.forEach(field => {
      if (!field.validate()) {
        isValid = false;
      }
    });
    return isValid;
  }

  /**
   * Clear all field errors
   */
  public clearErrors(): void {
    this.fields.forEach(field => {
      field.hideError();
    });
  }

  /**
   * Remove a field by name
   */
  public removeField(name: string): void {
    const field = this.fields.get(name);
    if (field) {
      field.destroy();
      this.fields.delete(name);
    }
  }

  /**
   * Clear all fields from the section
   */
  public clearFields(): void {
    this.fields.forEach((field, name) => {
      field.destroy();
    });
    this.fields.clear();
    this.fieldsContainer.innerHTML = '';
  }

  /**
   * Create a list row field (for checkout-style forms)
   */
  public addListRow(config: {
    name: string;
    icon: string;
    title: string;
    subtitle: string;
    badge?: string;
    hasChevron?: boolean;
    onClick?: () => void;
  }): HTMLElement {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      cursor: config.onClick ? 'pointer' : 'default',
    });

    if (config.onClick) {
      row.addEventListener('click', config.onClick);
    }

    // Icon
    const iconElement = document.createElement('div');
    Object.assign(iconElement.style, {
      width: '20px',
      height: '20px',
      flexShrink: '0',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
    iconElement.textContent = config.icon;
    row.appendChild(iconElement);

    // Content
    const contentElement = document.createElement('div');
    Object.assign(contentElement.style, {
      flex: '1',
      minWidth: '0',
    });

    const titleElement = document.createElement('div');
    Object.assign(titleElement.style, {
      fontSize: '15px',
      fontWeight: '500',
      lineHeight: '20px',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      marginBottom: '2px',
    });
    titleElement.textContent = config.title;
    contentElement.appendChild(titleElement);

    const subtitleElement = document.createElement('div');
    Object.assign(subtitleElement.style, {
      fontSize: '13px',
      fontWeight: '400',
      lineHeight: '16px',
      color: '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
    subtitleElement.textContent = config.subtitle;
    contentElement.appendChild(subtitleElement);

    row.appendChild(contentElement);

    // Badge (if provided)
    if (config.badge) {
      const badgeElement = document.createElement('div');
      Object.assign(badgeElement.style, {
        fontSize: '15px',
        fontWeight: '500',
        color: '#10B981',
        fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
        flexShrink: '0',
      });
      badgeElement.textContent = config.badge;
      row.appendChild(badgeElement);
    }

    // Chevron (if enabled)
    if (config.hasChevron) {
      const chevronElement = document.createElement('div');
      Object.assign(chevronElement.style, {
        width: '20px',
        height: '20px',
        flexShrink: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#898989',
      });
      chevronElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      row.appendChild(chevronElement);
    }

    this.fieldsContainer.appendChild(row);
    return row;
  }

  /**
   * Update section configuration
   */
  public updateConfig(newConfig: Partial<FormSectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.createSection(); // Recreate section with new config
  }

  /**
   * Destroy the section
   */
  public destroy(): void {
    this.clearFields();
    this.element.innerHTML = '';
  }

  /**
   * Get the root element
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Get the fields container
   */
  public getFieldsContainer(): HTMLElement {
    return this.fieldsContainer;
  }
}
