import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

interface WidgetInstance {
  id: string;
  type: string;
  config?: Record<string, any>;
}

interface Column {
  id: string;
  width: number;
  widgets?: WidgetInstance[];
}

interface Section {
  id: string;
  padding?: string;
  backgroundColor?: string;
  fullWidth?: boolean;
  columns: Column[];
}

interface PageLayout {
  sections: Section[];
}

@ValidatorConstraint({ name: 'isValidPageLayout', async: false })
export class IsValidPageLayoutConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value !== 'object') return false;

    const layout = value as PageLayout;

    // sections must be an array
    if (!Array.isArray(layout.sections)) return false;

    for (const section of layout.sections) {
      if (typeof section !== 'object' || section === null) return false;
      if (typeof section.id !== 'string' || !section.id) return false;
      if (!Array.isArray(section.columns)) return false;

      for (const column of section.columns) {
        if (typeof column !== 'object' || column === null) return false;
        if (typeof column.id !== 'string' || !column.id) return false;
        if (typeof column.width !== 'number' || column.width < 1 || column.width > 12) return false;

        if (column.widgets) {
          if (!Array.isArray(column.widgets)) return false;
          for (const widget of column.widgets) {
            if (typeof widget !== 'object' || widget === null) return false;
            if (typeof widget.id !== 'string' || !widget.id) return false;
            if (typeof widget.type !== 'string' || !widget.type) return false;
            if (widget.config !== undefined && typeof widget.config !== 'object') return false;
          }
        }
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid page layout structure`;
  }
}

export function IsValidPageLayout(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPageLayoutConstraint,
    });
  };
}
