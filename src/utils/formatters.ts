import { Currency } from '../types/starlink';

export const formatPrice = (amount: number | undefined | null, currency: Currency | string = 'EUR'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    amount = 0;
  }

  // Format spécial pour le FCFA
  if (currency === 'XOF') {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }

  try {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  } catch (error) {
    console.error('Erreur lors du formatage du prix:', error);
    // Fallback au format simple
    return `${amount.toLocaleString('fr-FR')} ${currency}`;
  }
};

