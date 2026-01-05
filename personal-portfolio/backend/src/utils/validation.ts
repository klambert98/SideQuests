import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationError } from '../errors/AppError';

export async function validateDto<T extends object>(
  dtoClass: new () => T,
  data: any
): Promise<T> {
  const dtoInstance = plainToClass(dtoClass, data);
  const errors = await validate(dtoInstance as object);

  if (errors.length > 0) {
    const formattedErrors = formatValidationErrors(errors);
    throw new ValidationError('Validation failed', formattedErrors);
  }

  return dtoInstance;
}

function formatValidationErrors(errors: ClassValidatorError[]): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  errors.forEach((error) => {
    if (error.constraints) {
      formatted[error.property] = Object.values(error.constraints);
    }
  });

  return formatted;
}
