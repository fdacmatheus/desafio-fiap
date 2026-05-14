import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidCpf(cpf: string): boolean {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcCheck = (slice: string, factor: number): number => {
    let total = 0;
    for (const char of slice) {
      total += parseInt(char, 10) * factor--;
    }
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const check1 = calcCheck(digits.slice(0, 9), 10);
  if (check1 !== parseInt(digits[9], 10)) return false;

  const check2 = calcCheck(digits.slice(0, 10), 11);
  return check2 === parseInt(digits[10], 10);
}

export function isValidCnpj(cnpj: string): boolean {
  const digits = onlyDigits(cnpj);
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcCheck = (slice: string, factors: number[]): number => {
    let total = 0;
    for (let i = 0; i < slice.length; i++) {
      total += parseInt(slice[i], 10) * factors[i];
    }
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const factors1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const factors2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const check1 = calcCheck(digits.slice(0, 12), factors1);
  if (check1 !== parseInt(digits[12], 10)) return false;

  const check2 = calcCheck(digits.slice(0, 13), factors2);
  return check2 === parseInt(digits[13], 10);
}

@ValidatorConstraint({ name: 'isCpfOrCnpj', async: false })
export class IsCpfOrCnpjConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return isValidCpf(value) || isValidCnpj(value);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'CPF ou CNPJ inválido';
  }
}

export function IsCpfOrCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsCpfOrCnpjConstraint,
    });
  };
}
