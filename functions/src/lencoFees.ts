type FeeTier = {
  min: number;
  max: number | null;
  fee: number;
};

const FEE_TIERS: FeeTier[] = [
  { min: 0, max: 999, fee: 5 },
  { min: 1000, max: 4999, fee: 15 },
  { min: 5000, max: 9999, fee: 25 },
  { min: 10000, max: null, fee: 35 },
];

export const calculateLencoFee = (amount: number): number => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  const tier = FEE_TIERS.find((current) => {
    const withinLower = amount >= current.min;
    const withinUpper = current.max == null ? true : amount <= current.max;
    return withinLower && withinUpper;
  });

  return tier?.fee ?? 0;
};
