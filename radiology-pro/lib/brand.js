// Product name in one place (server side). The browser reads it from /api/me and /brand.json.
export const BRAND = {
  name: process.env.BRAND_NAME || 'RadVox Pro',
  tagline: 'Dyktowanie opisów radiologicznych z AI',
  supportEmail: process.env.SUPPORT_EMAIL || '',
  company: process.env.COMPANY_NAME || '',
};
