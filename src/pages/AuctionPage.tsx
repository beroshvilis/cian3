import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge, Button, Icon, Input } from '@/ui';
import { money } from '@/data/listings';
import { auctionGoals, reachAuctionGoal } from '@/metrica';
import s from './AuctionPage.module.css';

type SellerStep = 'form' | 'review' | 'published';
type BidState = 'form' | 'pending' | 'accepted' | 'error';
type Role = 'seller' | 'buyer';

const startPrice = 18_400_000;
const increment = 100_000;
const currentPrice = 18_800_000;
const apartmentImages = [
  '/images/apartment-1.webp',
  '/images/apartment-2.webp',
  '/images/apartment-3.webp',
  '/images/apartment-4.webp',
];

function ScenarioSwitch({ role, onChange }: { role: Role; onChange: (role: Role) => void }) {
  return (
    <section className={s.scenarioSwitch} aria-label="Переключатель сценария">
      <div>
        <span className={s.scenarioEyebrow}>Панель предпросмотра</span>
        <strong>Сценарий аукциона</strong>
      </div>
      <div className={s.scenarioButtons} role="group" aria-label="Роль в прототипе">
        <button
          type="button"
          className={role === 'seller' ? s.scenarioActive : undefined}
          onClick={() => onChange('seller')}
          aria-pressed={role === 'seller'}
        >
          Продавец
        </button>
        <button
          type="button"
          className={role === 'buyer' ? s.scenarioActive : undefined}
          onClick={() => onChange('buyer')}
          aria-pressed={role === 'buyer'}
        >
          Покупатель
        </button>
      </div>
    </section>
  );
}

function ListingGallery({ finished = false }: { finished?: boolean }) {
  const [favorite, setFavorite] = useState(false);
  return (
    <div className={s.listingGallery}>
      <div
        className={s.listingImageTrack}
        aria-label="Фотографии квартиры"
        aria-roledescription="галерея"
        tabIndex={0}
      >
        {apartmentImages.map((src, index) => (
          <figure key={src}>
            <img src={src} alt={`Квартира, фото ${index + 1}`} />
          </figure>
        ))}
      </div>
      <span className={s.photoCounter}>{apartmentImages.length} фото</span>
      <Badge tone={finished ? 'neutral' : 'main'}>{finished ? 'Аукцион завершён' : 'Аукцион'}</Badge>
      {!finished && (
        <button
          type="button"
          className={`${s.favoriteButton} ${favorite ? s.favoriteActive : ''}`}
          aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          aria-pressed={favorite}
          onClick={() => setFavorite((value) => !value)}
        >
          <Icon name="Heart" size={24} />
        </button>
      )}
    </div>
  );
}

function AuctionSummary({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? s.summaryCompact : s.summary} aria-label="Условия аукциона">
      <div className={s.summaryTop}>
        <Badge tone="main">Аукцион</Badge>
        <span className={s.live}>
          <i /> Приём ставок открыт
        </span>
      </div>
      <div className={s.priceRow}>
        <div>
          <span>{compact ? 'Стартовая цена' : 'Текущая ставка'}</span>
          <strong>{money(compact ? startPrice : currentPrice)}</strong>
        </div>
        {!compact && (
          <div className={s.bidsCount}>
            <strong>4</strong>
            <span>ставки</span>
          </div>
        )}
      </div>
      {!compact && (
        <p className={s.nextBid}>
          Следующую ставку можно сделать от <strong>{money(currentPrice + increment)}</strong>
        </p>
      )}
      <div className={s.auctionFacts}>
        <div>
          <b>Минимальный шаг</b>
          <span>+ {money(increment)}</span>
        </div>
        <div>
          <b>Приём ставок</b>
          <span>до завтра, 18:00</span>
        </div>
      </div>
    </section>
  );
}

function SellerFlow({
  initialStep,
  onStepChange,
  onSwitch,
}: {
  initialStep: SellerStep;
  onStepChange: (step: SellerStep) => void;
  onSwitch: () => void;
}) {
  const [step, setStep] = useState<SellerStep>(initialStep);
  const [price, setPrice] = useState(String(startPrice));
  const [bidStep, setBidStep] = useState(String(increment));
  const [endDate, setEndDate] = useState('24 ноября, 18:00');
  const canReview = Number(price) > 0 && Number(bidStep) > 0 && Boolean(endDate.trim());

  const changeStep = (next: SellerStep) => {
    setStep(next);
    onStepChange(next);
  };

  useEffect(() => {
    if (step === 'review') {
      reachAuctionGoal(auctionGoals.sellerTermsReviewed, { role: 'seller', step: 'review' });
    }
  }, [step]);

  if (step === 'published') {
    return (
      <section className={s.sellerContent}>
        <div className={s.successHero}>
          <span className={s.successMark}>✓</span>
          <Badge tone="positive">Опубликовано</Badge>
          <h1>Квартира выставлена на аукцион</h1>
          <p>Покупатели увидят условия и смогут делать ставки до завтра, 18:00.</p>
        </div>
        <AuctionSummary />
        <section className={s.infoCard}>
          <h2>Что дальше</h2>
          <p>Мы сообщим, когда появится новая ставка. После окончания выберете покупателя.</p>
        </section>
        <Button fullWidth onClick={onSwitch}>
          Посмотреть карточку покупателя
        </Button>
      </section>
    );
  }

  return (
    <section className={s.sellerContent}>
      <div className={s.flowIntro}>
        <Badge tone="main">Новый способ продажи</Badge>
        <h1>{step === 'form' ? 'Настройте аукцион' : 'Проверьте условия'}</h1>
        <p>
          {step === 'form'
            ? 'Покупатели будут повышать цену с указанным шагом.'
            : 'После публикации условия нельзя будет изменить.'}
        </p>
      </div>
      <div className={s.progress} aria-label={step === 'form' ? 'Шаг 1 из 2' : 'Шаг 2 из 2'}>
        <span className={s.progressDone}>1</span>
        <i />
        <span className={step === 'review' ? s.progressDone : undefined}>2</span>
        <small className={s.progressFirstLabel}>Условия</small>
        <small className={s.progressLastLabel}>Проверка</small>
      </div>
      {step === 'form' ? (
        <form
          className={s.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (canReview) {
              reachAuctionGoal(auctionGoals.sellerTermsSubmitted, { role: 'seller', step: 'terms' });
              changeStep('review');
            }
          }}
        >
          <Input
            label="Стартовая цена, ₽"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
            hint="Цена, с которой начнутся ставки"
          />
          <Input
            label="Минимальный шаг, ₽"
            inputMode="numeric"
            value={bidStep}
            onChange={(e) => setBidStep(e.target.value.replace(/\D/g, ''))}
            hint="На столько покупатели повышают ставку"
          />
          <Input
            label="Окончание аукциона"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            hint="Учебное допущение для прототипа"
          />
          <section className={s.notice}>
            <strong>Важно</strong>
            <span>
              Победитель аукциона не оплачивает квартиру в приложении. Дальнейшие шаги — вне
              прототипа.
            </span>
          </section>
          <Button type="submit" fullWidth disabled={!canReview}>
            Проверить условия
          </Button>
        </form>
      ) : (
        <section className={s.review}>
          <div className={s.flatMini}>
            <img src="/images/apartment-1.webp" alt="Квартира на Русаковской улице" />
            <div>
              <strong>2-комн. квартира, 54 м²</strong>
              <span>Москва, Сокольники</span>
            </div>
          </div>
          <dl>
            <div>
              <dt>Стартовая цена</dt>
              <dd>{money(Number(price))}</dd>
            </div>
            <div>
              <dt>Минимальный шаг</dt>
              <dd>{money(Number(bidStep))}</dd>
            </div>
            <div>
              <dt>Окончание</dt>
              <dd>{endDate}</dd>
            </div>
          </dl>
          <section className={s.notice}>
            <strong>Проверьте внимательно</strong>
            <span>После публикации изменить цену и срок не получится.</span>
          </section>
          <Button
            fullWidth
            onClick={() => {
              reachAuctionGoal(auctionGoals.sellerPublished, { role: 'seller', step: 'published' });
              changeStep('published');
            }}
          >
            Опубликовать аукцион
          </Button>
          <Button fullWidth theme="main_secondary" onClick={() => changeStep('form')}>
            Изменить условия
          </Button>
        </section>
      )}
    </section>
  );
}

function BuyerFlow({
  state,
  onStateChange,
}: {
  state: string | null;
  onStateChange: (state: string | null) => void;
}) {
  const [bid, setBid] = useState(String(currentPrice + increment));
  const [promoExpanded, setPromoExpanded] = useState(false);
  const [bidState, setBidState] = useState<BidState>(
    state === 'error' || state === 'pending' || state === 'accepted' ? state : 'form',
  );
  const [lowBid, setLowBid] = useState(state === 'low');
  const finished = state === 'finished';
  const minimum = currentPrice + increment;
  const submit = () => {
    if (Number(bid) < minimum) {
      setLowBid(true);
      reachAuctionGoal(auctionGoals.bidValidationError, { role: 'buyer', step: 'bid_form' });
      return;
    }
    setLowBid(false);
    reachAuctionGoal(auctionGoals.bidSubmitted, { role: 'buyer', step: 'bid_pending' });
    setBidState('pending');
  };

  useEffect(() => {
    if (bidState !== 'pending' || state === 'pending') return;
    const timer = window.setTimeout(() => {
      setBidState('accepted');
      reachAuctionGoal(auctionGoals.bidAccepted, { role: 'buyer', step: 'bid_accepted' });
    }, 850);
    return () => window.clearTimeout(timer);
  }, [bidState, state]);
  if (finished) {
    return (
      <section className={s.buyerFlow}>
        <ListingGallery finished />
        <div className={s.buyerContent}>
          <h1>2-комн. квартира, 54 м²</h1>
          <p className={s.address}>Москва, Сокольники, ул. Русаковская, 12</p>
          <section className={s.finishedCard}>
            <Badge tone="positive">Аукцион завершён</Badge>
            <h2>Победила ставка {money(currentPrice)}</h2>
            <p>Продавец выбирает покупателя. Мы сообщим, если он выберет вас.</p>
          </section>
          <Link className={s.textLink} to="/auction?role=buyer" onClick={() => onStateChange(null)}>
            Вернуться к активному аукциону
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className={s.buyerFlow}>
      <ListingGallery />
      <div className={s.buyerContent}>
        <h1>2-комн. квартира, 54 м²</h1>
        <p className={s.address}>Москва, Сокольники, ул. Русаковская, 12 · 7 минут пешком</p>
        <AuctionSummary />
        <section className={s.auctionPromo} aria-labelledby="auction-promo-title">
          <Badge tone="main">Покупателям</Badge>
          <h2 id="auction-promo-title">Аукцион без скрытых условий</h2>
          <p className={s.promoLead}>
            Все ставки и минимальный шаг видны заранее. Вы сами решаете, до какой суммы готовы
            участвовать.
          </p>
          <Button
            className={s.promoToggle}
            theme="main_secondary"
            size="XS"
            aria-expanded={promoExpanded}
            aria-controls="auction-promo-details"
            onClick={() => setPromoExpanded((value) => !value)}
          >
            {promoExpanded ? 'Скрыть подробности' : 'Подробнее об аукционе'}
          </Button>
          {promoExpanded && (
            <div id="auction-promo-details" className={s.promoPoints}>
              <section>
                <span>1</span>
                <div>
                  <h3>Как это работает</h3>
                  <p>
                    Сделайте ставку от {money(minimum)} и следите за ходом аукциона до его
                    окончания.
                  </p>
                </div>
              </section>
              <section>
                <span>2</span>
                <div>
                  <h3>В чём преимущество</h3>
                  <p>
                    Цена меняется только на шаг ставки, поэтому условия одинаково понятны всем
                    участникам.
                  </p>
                </div>
              </section>
              <section>
                <span>3</span>
                <div>
                  <h3>Кому подходит</h3>
                  <p>Тем, кто уже выбрал квартиру и готов оперативно участвовать в торгах.</p>
                </div>
              </section>
            </div>
          )}
        </section>
        {bidState === 'accepted' ? (
          <section className={s.accepted} role="status">
            <span className={s.successMark}>✓</span>
            <h2>Ваша ставка принята</h2>
            <p>Ставка {money(Number(bid))} сейчас лидирует. Мы сообщим, если её перебьют.</p>
            <Button
              fullWidth
              theme="main_secondary"
              onClick={() => {
                setBidState('form');
                setBid(String(Number(bid) + increment));
              }}
            >
              Повысить ставку
            </Button>
          </section>
        ) : bidState === 'error' ? (
          <section className={s.bidBox} role="alert">
            <Badge tone="negative">Не удалось отправить ставку</Badge>
            <h2>Проверьте соединение</h2>
            <p>Условия аукциона не изменились. Попробуйте ещё раз.</p>
            <Button
              fullWidth
              onClick={() => {
                setBidState('form');
                onStateChange(null);
              }}
            >
              Попробовать снова
            </Button>
          </section>
        ) : (
          <section className={s.bidBox}>
            <h2>Сделать ставку</h2>
            <p>Минимальная ставка — {money(minimum)}</p>
            <Input
              label="Ваша ставка, ₽"
              inputMode="numeric"
              value={bid}
              onChange={(e) => {
                setBid(e.target.value.replace(/\D/g, ''));
                setLowBid(false);
              }}
              error={lowBid ? `Ставка должна быть не ниже ${money(minimum)}` : undefined}
            />
            {bidState === 'pending' ? (
              <Button fullWidth loading>
                Отправляем ставку
              </Button>
            ) : (
              <Button fullWidth onClick={submit}>
                Сделать ставку
              </Button>
            )}
            <button
              className={s.errorDemo}
              type="button"
              onClick={() => {
                setBidState('error');
                reachAuctionGoal(auctionGoals.bidResponseError, { role: 'buyer', step: 'bid_error' });
                onStateChange('error');
              }}
            >
              Показать ошибку ответа
            </button>
          </section>
        )}
        <Link
          className={s.textLink}
          to="/auction?role=buyer&state=finished"
          onClick={() => onStateChange('finished')}
        >
          Посмотреть состояние завершённого аукциона
        </Link>
      </div>
    </section>
  );
}

export function AuctionPage() {
  const [params, setParams] = useSearchParams();
  const role: Role = params.get('role') === 'buyer' ? 'buyer' : 'seller';
  const state = params.get('state');
  const requestedSellerStep = params.get('step');
  const sellerStep: SellerStep =
    requestedSellerStep === 'review' || requestedSellerStep === 'published'
      ? requestedSellerStep
      : 'form';
  const changeState = (next: string | null) => {
    const value: Record<string, string> = { role: 'buyer' };
    if (next) value.state = next;
    setParams(value);
  };
  const changeSellerStep = (next: SellerStep) => {
    setParams(next === 'form' ? {} : { role: 'seller', step: next });
  };
  const changeRole = (next: Role) => {
    setParams(next === 'buyer' ? { role: 'buyer' } : {});
  };
  useEffect(() => {
    if (role !== 'buyer') return;
    if (state === 'finished') {
      reachAuctionGoal(auctionGoals.auctionFinishedViewed, { role: 'buyer', step: 'finished' });
    } else if (!state || state === 'low') {
      reachAuctionGoal(auctionGoals.buyerCardViewed, { role: 'buyer', step: 'listing' });
    }
  }, [role, state]);
  return (
    <main id="main" className={s.page}>
      <ScenarioSwitch role={role} onChange={changeRole} />
      <div className={s.mobileShell}>
        {role === 'seller' ? (
          <SellerFlow
            key={sellerStep}
            initialStep={sellerStep}
            onStepChange={changeSellerStep}
            onSwitch={() => setParams({ role: 'buyer' })}
          />
        ) : (
          <BuyerFlow key={state} state={state} onStateChange={changeState} />
        )}
      </div>
      <p className={s.demoNote}>
        Учебный прототип: оплата и юридическое оформление не входят в сценарий.
      </p>
    </main>
  );
}
