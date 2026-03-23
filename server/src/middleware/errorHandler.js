// Central error handler — returns a consistent JSON shape so the
// frontend always knows how to parse an error response.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log full error in development, minimal in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  } else {
    console.error(`[Error] ${status} ${message}`);
  }

  res.status(status).json({ error: message });
}
