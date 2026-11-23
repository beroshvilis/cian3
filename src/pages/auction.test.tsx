import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';

function open(path = '/auction') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('Auction scenario', () => {
  beforeEach(() => vi.spyOn(window, 'scrollTo').mockImplementation(() => {}));

  it('publishes auction from seller terms and opens buyer role', async () => {
    open();
    await userEvent.click(screen.getByRole('button', { name: 'Проверить условия' }));
    expect(screen.getByRole('heading', { name: 'Проверьте условия' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Опубликовать аукцион' }));
    expect(screen.getByRole('heading', { name: 'Квартира выставлена на аукцион' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Посмотреть карточку покупателя' }));
    expect(screen.getByRole('heading', { name: '2-комн. квартира, 54 м²' })).toBeVisible();
  });

  it('validates a low bid and exposes completion and response-error states', async () => {
    open('/auction?role=buyer');
    const bid = screen.getByLabelText('Ваша ставка, ₽');
    await userEvent.clear(bid);
    await userEvent.type(bid, '18800000');
    await userEvent.click(screen.getByRole('button', { name: 'Сделать ставку' }));
    expect(screen.getByText(/Ставка должна быть не ниже/)).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Показать ошибку ответа' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Не удалось отправить ставку');
    open('/auction?role=buyer&state=finished');
    expect(screen.getByText(/Победила ставка/)).toBeVisible();
  });

  it('shows four photos in a horizontally scrollable buyer gallery', () => {
    open('/auction?role=buyer');
    expect(screen.getByLabelText('Фотографии квартиры')).toBeVisible();
    expect(screen.getAllByRole('img', { name: /Квартира, фото/ })).toHaveLength(4);
    expect(screen.getByText('4 фото')).toBeVisible();
  });

  it('animates the favorite control when a buyer saves the listing', async () => {
    open('/auction?role=buyer');
    await userEvent.click(screen.getByRole('button', { name: 'Добавить в избранное' }));
    expect(screen.getByRole('button', { name: 'Убрать из избранного' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('keeps the auction flow free of the common site header and footer', () => {
    open();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
});
