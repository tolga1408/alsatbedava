// Shared constants for Alsatbedava platform

export const BRAND = {
  name: 'Alsatbedava',
  tagline: 'Al, sat, komisyon ödeme — hepsi bedava!',
  description: 'Türkiye\'nin adil pazarı. Gerçek ilanlar, adil fiyatlar, modern platform.',
} as const;

export const CATEGORIES = {
  EMLAK: 'emlak',
  VASITA: 'vasita',
  IKINCI_EL: 'ikinci-el',
  // More categories to be added later
} as const;

export const LISTING_STATUS = {
  ACTIVE: 'active',
  SOLD: 'sold',
  EXPIRED: 'expired',
  PENDING: 'pending',
} as const;

export const USER_ROLES = {
  USER: 'user',
  AGENT: 'agent',
  ADMIN: 'admin',
} as const;
