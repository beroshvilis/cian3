import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge, Button, Input } from '@/ui';
import { AppShell } from '@/components/Layout';
import { money } from '@/data/listings';
import s from './AuctionPage.module.css';

type SellerStep = 'form' | 'review' | 'published';
type BidState = 'form' | 'pending' | 'accepted' | 'error';

const startPrice = 18_400_000;
const increment = 100_000;
const currentPrice = 18_800_000;
const apartmentImages = [
  '/images/apartment-1.webp',
  '/images/apartment-2.webp',
  '/images/apartment-3.webp',
  '/images/apartment-4.webp',
];

function ListingGallery({ finished = false }: { finished?: boolean }) {
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
        <button type="button" aria-label="Добавить в избранное">
          ♡
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
      <div className={s.auctionFacts}>
        <span>
          <b>Шаг</b> {money(increment)}
        </span>
        <span>
          <b>До</b> завтра, 18:00
        </span>
      </div>
    </section>
  );
}

function SellerFlow({ onSwitch }: { onSwitch: () => void }) {
  const [step, setStep] = useState<SellerStep>('form');
  const [price, setPrice] = useState(String(startPrice));
  const [bidStep, setBidStep] = useState(String(increment));
  const [endDate, setEndDate] = useState('24 ноября, 18:00');
  const canReview = Number(price) > 0 && Number(bidStep) > 0 && Boolean(endDate.trim());

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
        <small>{step === 'form' ? 'Условия' : 'Проверка'}</small>
      </div>
      {step === 'form' ? (
        <form
          className={s.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (canReview) setStep('review');
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
          <Button fullWidth onClick={() => setStep('published')}>
            Опубликовать аукцион
          </Button>
          <Button fullWidth theme="main_secondary" onClick={() => setStep('form')}>
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
  const [bidState, setBidState] = useState<BidState>(state === 'error' ? 'error' : 'form');
  const [lowBid, setLowBid] = useState(state === 'low');
  const finished = state === 'finished';
  const minimum = currentPrice + increment;
  const submit = () => {
    if (Number(bid) < minimum) {
      setLowBid(true);
      return;
    }
    setLowBid(false);
    setBidState('pending');
    window.setTimeout(() => setBidState('accepted'), 850);
  };
  if (finished) {
    return (
      <section className={s.buyerContent}>
        <ListingGallery finished />
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
      </section>
    );
  }
  return (
    <section className={s.buyerContent}>
      <ListingGallery />
      <h1>2-комн. квартира, 54 м²</h1>
      <p className={s.address}>Москва, Сокольники, ул. Русаковская, 12 · 7 минут пешком</p>
      <AuctionSummary />
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
              onStateChange('error');
            }}
          >
            Показать ошибку ответа
          </button>
        </section>
      )}
      <section className={s.rules}>
        <h2>Как проходит аукцион</h2>
        <ol>
          <li>Вы делаете ставку. Она отображается только вам и продавцу.</li>
          <li>Если ставку перебьют, пришлём уведомление.</li>
          <li>После окончания продавец выбирает покупателя.</li>
        </ol>
      </section>
      <Link
        className={s.textLink}
        to="/auction?role=buyer&state=finished"
        onClick={() => onStateChange('finished')}
      >
        Посмотреть состояние завершённого аукциона
      </Link>
    </section>
  );
}

export function AuctionPage() {
  const [params, setParams] = useSearchParams();
  const role = params.get('role') === 'buyer' ? 'buyer' : 'seller';
  const state = params.get('state');
  const changeState = (next: string | null) => {
    const value: Record<string, string> = { role: 'buyer' };
    if (next) value.state = next;
    setParams(value);
  };
  return (
    <AppShell>
      <main id="main" className={s.page}>
        <div className={s.mobileShell}>
          {role === 'seller' ? (
            <SellerFlow onSwitch={() => setParams({ role: 'buyer' })} />
          ) : (
            <BuyerFlow state={state} onStateChange={changeState} />
          )}
        </div>
        <p className={s.demoNote}>
          Учебный прототип: оплата и юридическое оформление не входят в сценарий.
        </p>
      </main>
    </AppShell>
  );
}
