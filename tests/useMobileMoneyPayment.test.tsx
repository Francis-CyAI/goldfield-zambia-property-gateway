import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import useMobileMoneyPayment from '../src/hooks/useMobileMoneyPayment';

function TestInitiate() {
  const { initiate, status, reference } = useMobileMoneyPayment();
  return (
    <div>
      <div>status:{status}</div>
      <div>ref:{reference ?? 'none'}</div>
      <button onClick={() => void initiate({ msisdn: '0972000000', operator: 'airtel', amount: 10 })}>start</button>
    </div>
  );
}

describe('useMobileMoneyPayment', () => {
  beforeEach(() => {
    // reset fetch mock
    // @ts-ignore
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // @ts-ignore
    vi.resetAllMocks();
  });

  it('initiates payment and returns reference', async () => {
    // mock initiate callable response
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ result: { reference: 'ref-123' } }) });

    render(<TestInitiate />);

    fireEvent.click(screen.getByText('start'));

    await waitFor(() => {
      expect(screen.getByText(/ref:/).textContent).toContain('ref-123');
    });
  });
});
