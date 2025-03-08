export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencyDisplay: 'name'
  }).format(price).replace('francs CFA', 'FCFA');
}; 