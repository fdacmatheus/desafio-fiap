import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const PLACA_ANTIGA = /^[A-Z]{3}-?\d{4}$/;
const PLACA_MERCOSUL = /^[A-Z]{3}\d[A-Z]\d{2}$/;

export function isValidPlaca(placa: string): boolean {
  if (typeof placa !== 'string') return false;
  const normalized = placa.toUpperCase().replace(/\s/g, '');
  return PLACA_ANTIGA.test(normalized) || PLACA_MERCOSUL.test(normalized);
}

@ValidatorConstraint({ name: 'isPlaca', async: false })
export class IsPlacaConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && isValidPlaca(value);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Placa inválida (formatos aceitos: ABC-1234 ou ABC1D23)';
  }
}

export function IsPlaca(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsPlacaConstraint,
    });
  };
}
