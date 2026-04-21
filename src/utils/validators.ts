export const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isStrongPassword = (value: string) => {
  return value.length >= 8;
};

export const isRequired = (value: string) => {
  return value.trim().length > 0;
};

export const isPositiveNumber = (value: number) => {
  return Number.isFinite(value) && value > 0;
};
