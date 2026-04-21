export const formatCurrency = (value: number, currency = "USD", locale = "en-US") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
};
