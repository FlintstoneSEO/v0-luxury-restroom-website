export interface GuestCountTier {
  maxGuests: number | null;
  label: string;
  basePrice: number;
}

export interface DefaultPricingConfig {
  guestCountTiers: GuestCountTier[];
  deliveryFee: number;
  mileageRate: number;
  generatorFee: number;
  waterSupplyFee: number;
  extraDayFee: number;
  cleaningFee: number;
  rushBookingFee: number;
  defaultDepositAmount: number;
  defaultDepositPercentage: number;
}

export const defaultPricing: DefaultPricingConfig = {
  guestCountTiers: [
    { maxGuests: 100, label: 'Up to 100 guests', basePrice: 1800 },
    { maxGuests: 150, label: 'Up to 150 guests', basePrice: 2300 },
    { maxGuests: 200, label: 'Up to 200 guests', basePrice: 2800 },
    { maxGuests: 250, label: 'Up to 250 guests', basePrice: 3300 },
    { maxGuests: null, label: '300+ guests', basePrice: 4200 },
  ],
  deliveryFee: 350,
  mileageRate: 3.5,
  generatorFee: 225,
  waterSupplyFee: 150,
  extraDayFee: 600,
  cleaningFee: 175,
  rushBookingFee: 400,
  defaultDepositAmount: 1000,
  defaultDepositPercentage: 0.35,
};
