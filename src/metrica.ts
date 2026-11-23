export const METRICA_COUNTER_ID = '00000000';

export const auctionGoals = {
  sellerTermsSubmitted: 'auction_seller_terms_submitted',
  sellerTermsReviewed: 'auction_seller_terms_reviewed',
  sellerPublished: 'auction_seller_published',
  buyerCardViewed: 'auction_buyer_card_viewed',
  bidSubmitted: 'auction_bid_submitted',
  bidValidationError: 'auction_bid_validation_error',
  bidAccepted: 'auction_bid_accepted',
  bidResponseError: 'auction_bid_response_error',
  auctionFinishedViewed: 'auction_finished_viewed',
} as const;

export type AuctionGoal = (typeof auctionGoals)[keyof typeof auctionGoals];
export type AuctionRole = 'seller' | 'buyer';

export type AuctionGoalParams = {
  role: AuctionRole;
  step: string;
};

/**
 * Точка подключения Яндекс Метрики для прототипа.
 * Счётчик намеренно не подключён: при запуске цель видна только в консоли браузера.
 */
export function reachAuctionGoal(goal: AuctionGoal, params: AuctionGoalParams) {
  const payload = { counterId: METRICA_COUNTER_ID, goal, params };
  window.dispatchEvent(new CustomEvent('cian3:metrica-goal', { detail: payload }));
  console.info('[Metrica stub]', payload);
}
