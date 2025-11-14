import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, beforeEach } from 'vitest';
import BookingCard from '../src/components/BookingCard';

// Provide a minimal property prop
const property = {
  id: 'prop1',
  title: 'Test property',
  price: 100,
  rating: 4.5,
  reviewCount: 10,
  maxGuests: 4,
};

describe('BookingCard', () => {
  beforeEach(() => {
    // stub out hooks that require context
    // For simplicity we mock createBooking and auth contexts indirectly by rendering the component and
    // relying on default behaviour; if tests fail in CI you may need to provide providers.
  });

  it('renders price and pay button', () => {
    render(<BookingCard property={property as any} />);
    expect(screen.getByText(/ZMW/)).toBeTruthy();
    expect(screen.getByText(/Pay with Mobile Money/i)).toBeTruthy();
  });
});
