export function errorHandler(error, _request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  const statusCode = Number.isInteger(error.statusCode)
    ? error.statusCode
    : Number.isInteger(error.status)
      ? error.status
      : 500;
  const safeStatusCode = statusCode >= 400 && statusCode < 600 ? statusCode : 500;

  if (safeStatusCode >= 500) {
    console.error(error);
  }

  response.status(safeStatusCode).json({
    error: safeStatusCode >= 500 ? 'Internal server error' : error.message
  });
}
