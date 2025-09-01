export const generateCSRFToken = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  // Server-side (Next.js API route)
  return require('crypto').randomBytes(32).toString('hex');
};

export const validateCSRFToken = (token: string, csrfToken: string): boolean => {
  return token === csrfToken;
};