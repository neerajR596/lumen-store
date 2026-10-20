export const notFound = (req, res) => res.status(404).json({ message: `Not found: ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  let status = err.status || 500, message = err.message || 'Server error';
  if (err.name === 'CastError') { status = 404; message = 'Resource not found'; }
  if (err.code === 11000) { status = 400; message = `${Object.keys(err.keyValue || {}).join(', ')} already exists`; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
};
