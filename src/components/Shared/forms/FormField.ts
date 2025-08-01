/**
 * Form field types
 */
export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  TEL = 'tel',
  PASSWORD = 'password',
  NUMBER = 'number',
  TEXTAREA = 'textarea',
  SELECT = 'select',
}

/**
 * Form field validation states
 */
export enum FormFieldState {
  DEFAULT = 'default',
  FOCUSED = 'focused',
  FILLED = 'filled',
  ERROR = 'error',
  SUCCESS = 'success',
  DISABLED = 'disabled',
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  /** Field type */
  type: FormFieldType;
  /** Input name attribute */
  name: string;
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Initial value */
  value?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Help text */
  helpText?: string;
  /** CSS class */
  className?: string;
  /** Container element */
  container: HTMLElement;
  /** Select options (for SELECT type) */
  options?: Array<{ value: string; label: string }>;
  /** Validation pattern */
  pattern?: string;
  /** Min length */
  minLength?: number;
  /** Max length */
  maxLength?: number;
  /** Event callbacks */
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onValidate?: (value: string) => string | null; // Return error message or null
}

/**
 * Base form field component
 * Provides consistent styling and behavior for all form inputs
 */
export class FormField {
  protected element: HTMLElement;
  protected config: FormFieldConfig;
  protected inputElement?: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  protected labelElement?: HTMLElement;
  protected errorElement?: HTMLElement;
  protected helpElement?: HTMLElement;
  protected state: FormFieldState = FormFieldState.DEFAULT;

  constructor(config: FormFieldConfig) {
    this.config = config;
    this.element = config.container;
    this.initialize();
  }

  /**
   * Initialize the form field
   */
  private initialize(): void {
    this.setupElement();
    this.createField();
    this.setupEventListeners();
    this.updateState();
  }

  /**
   * Setup container element
   */
  private setupElement(): void {
    this.element.innerHTML = '';
    Object.assign(this.element.style, {
      marginBottom: '16px',
      width: '100%',
    });

    if (this.config.className) {
      this.element.className = this.config.className;
    }
  }

  /**
   * Create form field elements
   */
  private createField(): void {
    // Create label if provided
    if (this.config.label) {
      this.createLabel();
    }

    // Create input container
    const inputContainer = document.createElement('div');
    Object.assign(inputContainer.style, {
      position: 'relative',
      width: '100%',
    });

    // Create input element based on type
    this.createInput();
    inputContainer.appendChild(this.inputElement!);

    this.element.appendChild(inputContainer);

    // Create help text if provided
    if (this.config.helpText) {
      this.createHelpText();
    }

    // Create error element (hidden by default)
    this.createErrorElement();
  }

  /**
   * Create label element
   */
  private createLabel(): void {
    this.labelElement = document.createElement('label');
    Object.assign(this.labelElement.style, {
      display: 'block',
      marginBottom: '8px',
      fontSize: '15px',
      fontWeight: '500',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
    });

    let labelText = this.config.label!;
    if (this.config.required) {
      labelText += ' *';
    }

    this.labelElement.textContent = labelText;
    this.element.appendChild(this.labelElement);
  }

  /**
   * Create input element based on type
   */
  private createInput(): void {
    let element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    if (this.config.type === FormFieldType.TEXTAREA) {
      element = document.createElement('textarea');
      Object.assign(element.style, {
        minHeight: '80px',
        resize: 'vertical',
      });
    } else if (this.config.type === FormFieldType.SELECT) {
      element = document.createElement('select');
      this.createSelectOptions(element);
    } else {
      element = document.createElement('input');
      element.type = this.config.type;
    }

    // Common styles for all input types
    Object.assign(element.style, {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(137, 137, 137, 0.30)',
      backgroundColor: '#ffffff',
      fontSize: '15px',
      fontWeight: '400',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      color: '#141414',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    });

    // Set attributes
    element.name = this.config.name;
    if (this.config.placeholder && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
      element.placeholder = this.config.placeholder;
    }
    if (this.config.value) {
      element.value = this.config.value;
    }
    if (this.config.disabled) {
      element.disabled = this.config.disabled;
    }
    if (this.config.required) {
      element.required = this.config.required;
    }
    if (this.config.pattern && element instanceof HTMLInputElement) {
      element.pattern = this.config.pattern;
    }
    if (this.config.minLength && element instanceof HTMLInputElement) {
      element.minLength = this.config.minLength;
    }
    if (this.config.maxLength && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
      element.maxLength = this.config.maxLength;
    }

    this.inputElement = element;
  }

  /**
   * Create select options
   */
  private createSelectOptions(selectElement: HTMLSelectElement): void {
    if (!this.config.options) return;

    // Add placeholder option if placeholder provided
    if (this.config.placeholder) {
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = this.config.placeholder;
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      selectElement.appendChild(placeholderOption);
    }

    // Add regular options
    this.config.options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      selectElement.appendChild(optionElement);
    });
  }

  /**
   * Create help text element
   */
  private createHelpText(): void {
    this.helpElement = document.createElement('div');
    Object.assign(this.helpElement.style, {
      marginTop: '4px',
      fontSize: '13px',
      color: '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
    });
    this.helpElement.textContent = this.config.helpText!;
    this.element.appendChild(this.helpElement);
  }

  /**
   * Create error element
   */
  private createErrorElement(): void {
    this.errorElement = document.createElement('div');
    Object.assign(this.errorElement.style, {
      marginTop: '4px',
      fontSize: '13px',
      color: '#EF4444',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      display: 'none',
    });
    this.element.appendChild(this.errorElement);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.inputElement) return;

    // Focus event
    this.inputElement.addEventListener('focus', () => {
      this.setState(FormFieldState.FOCUSED);
      if (this.config.onFocus) {
        this.config.onFocus();
      }
    });

    // Blur event
    this.inputElement.addEventListener('blur', () => {
      const hasValue = this.inputElement!.value.length > 0;
      this.setState(hasValue ? FormFieldState.FILLED : FormFieldState.DEFAULT);

      // Validate on blur
      this.validate();

      if (this.config.onBlur) {
        this.config.onBlur();
      }
    });

    // Input event
    this.inputElement.addEventListener('input', () => {
      const value = this.inputElement!.value;

      // Clear error state when user starts typing
      if (this.state === FormFieldState.ERROR) {
        this.setState(value.length > 0 ? FormFieldState.FILLED : FormFieldState.DEFAULT);
      }

      if (this.config.onChange) {
        this.config.onChange(value);
      }
    });
  }

  /**
   * Set field state and update styling
   */
  private setState(newState: FormFieldState): void {
    this.state = newState;
    this.updateState();
  }

  /**
   * Update visual state based on current state
   */
  private updateState(): void {
    if (!this.inputElement) return;

    // Reset styles
    Object.assign(this.inputElement.style, {
      borderColor: 'rgba(137, 137, 137, 0.30)',
      boxShadow: 'none',
    });

    // Apply state-specific styles
    switch (this.state) {
      case FormFieldState.FOCUSED:
        Object.assign(this.inputElement.style, {
          borderColor: '#8B5CF6',
          boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
        });
        break;
      case FormFieldState.ERROR:
        Object.assign(this.inputElement.style, {
          borderColor: '#EF4444',
          boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
        });
        break;
      case FormFieldState.SUCCESS:
        Object.assign(this.inputElement.style, {
          borderColor: '#10B981',
          boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
        });
        break;
      case FormFieldState.DISABLED:
        Object.assign(this.inputElement.style, {
          backgroundColor: '#F9FAFB',
          color: '#9CA3AF',
          cursor: 'not-allowed',
        });
        break;
    }
  }

  /**
   * Validate field value
   */
  public validate(): boolean {
    if (!this.inputElement) return true;

    const value = this.inputElement.value;
    let errorMessage: string | null = null;

    // Required validation
    if (this.config.required && !value) {
      errorMessage = `${this.config.label || 'Поле'} обязательно для заполнения`;
    }

    // Custom validation
    if (!errorMessage && this.config.onValidate && value) {
      errorMessage = this.config.onValidate(value);
    }

    // Built-in validation for specific types
    if (!errorMessage && value) {
      switch (this.config.type) {
        case FormFieldType.EMAIL:
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errorMessage = 'Введите корректный email адрес';
          }
          break;
        case FormFieldType.TEL:
          const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
          if (!phoneRegex.test(value)) {
            errorMessage = 'Введите корректный номер телефона';
          }
          break;
      }
    }

    // Length validation
    if (!errorMessage && value) {
      if (this.config.minLength && value.length < this.config.minLength) {
        errorMessage = `Минимум ${this.config.minLength} символов`;
      }
      if (this.config.maxLength && value.length > this.config.maxLength) {
        errorMessage = `Максимум ${this.config.maxLength} символов`;
      }
    }

    // Show/hide error
    if (errorMessage) {
      this.showError(errorMessage);
      return false;
    } else {
      this.hideError();
      return true;
    }
  }

  /**
   * Show error message
   */
  public showError(message: string): void {
    if (this.errorElement) {
      this.errorElement.textContent = message;
      this.errorElement.style.display = 'block';
    }
    this.setState(FormFieldState.ERROR);
  }

  /**
   * Hide error message
   */
  public hideError(): void {
    if (this.errorElement) {
      this.errorElement.style.display = 'none';
    }
    if (this.state === FormFieldState.ERROR) {
      const hasValue = this.getValue().length > 0;
      this.setState(hasValue ? FormFieldState.FILLED : FormFieldState.DEFAULT);
    }
  }

  /**
   * Get field value
   */
  public getValue(): string {
    return this.inputElement?.value || '';
  }

  /**
   * Set field value
   */
  public setValue(value: string): void {
    if (this.inputElement) {
      this.inputElement.value = value;
      const hasValue = value.length > 0;
      this.setState(hasValue ? FormFieldState.FILLED : FormFieldState.DEFAULT);
    }
  }

  /**
   * Focus the field
   */
  public focus(): void {
    this.inputElement?.focus();
  }

  /**
   * Disable the field
   */
  public disable(): void {
    if (this.inputElement) {
      this.inputElement.disabled = true;
      this.setState(FormFieldState.DISABLED);
    }
  }

  /**
   * Enable the field
   */
  public enable(): void {
    if (this.inputElement) {
      this.inputElement.disabled = false;
      const hasValue = this.getValue().length > 0;
      this.setState(hasValue ? FormFieldState.FILLED : FormFieldState.DEFAULT);
    }
  }

  /**
   * Update field configuration
   */
  public updateConfig(newConfig: Partial<FormFieldConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.createField(); // Recreate field with new config
  }

  /**
   * Destroy the field
   */
  public destroy(): void {
    this.element.innerHTML = '';
  }

  /**
   * Get the root element
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Get the input element
   */
  public getInputElement(): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | undefined {
    return this.inputElement;
  }
}
