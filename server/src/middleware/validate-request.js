import { validationResult } from 'express-validator';

export function validateRequest(request, response, next) {
  const result = validationResult(request);

  if (result.isEmpty()) {
    return next();
  }

  response.status(400).json({
    error: 'Validation failed',
    errors: result.array().map(({ location, path, msg }) => ({
      field: path,
      location,
      message: msg
    }))
  });
}
