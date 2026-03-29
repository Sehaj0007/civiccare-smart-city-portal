import crypto from 'crypto';

// Store CSRF tokens (in production, use Redis)
const csrfTokens = new Set();

// Generate CSRF token
export const generateCSRFToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.add(token);

  // Clean up old tokens after 1 hour
  setTimeout(() => {
    csrfTokens.delete(token);
  }, 60 * 60 * 1000);

  return token;
};

// Validate CSRF token
export const validateCSRFToken = (token) => {
  if (!token || !csrfTokens.has(token)) {
    return false;
  }
  csrfTokens.delete(token); // One-time use
  return true;
};

// CSRF protection middleware
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;

  if (!validateCSRFToken(token)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next();
};