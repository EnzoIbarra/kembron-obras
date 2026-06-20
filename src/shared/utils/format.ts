const currencyFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a Decimal (string from API) or number as a currency string with $ prefix. */
export function formatCurrency(value: string | number): string {
  return '$ ' + currencyFormatter.format(Number(value));
}
