import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { auctionGoals } from '@/metrica';

describe('Auction map', () => {
  beforeEach(() => vi.spyOn(window, 'scrollTo').mockImplementation(() => {}));

  it('shows both role flows, annotated transitions, and metric formulas', () => {
    render(
      <MemoryRouter initialEntries={['/map']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Аукцион: продавец и покупатель' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Продавец' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Покупатель' })).toBeVisible();
    expect(screen.getAllByText(auctionGoals.sellerPublished).length).toBeGreaterThan(0);
    expect(screen.getAllByText(auctionGoals.bidSubmitted).length).toBeGreaterThan(0);
    expect(screen.getByText('Целевые метрики')).toBeVisible();
    expect(screen.getByText('bid_accepted ÷ bid_submitted')).toBeVisible();
    expect(screen.getByText('≥ 90%')).toBeVisible();
  });
});
