import { Link } from 'react-router-dom';
import { AppShell, Breadcrumbs, PageLayout } from '@/components/Layout';
import { auctionGoals, METRICA_COUNTER_ID } from '@/metrica';
import s from './AuctionMapPage.module.css';

type ScreenCard = {
  title: string;
  description: string;
  event: string;
  to: string;
  kind: 'form' | 'review' | 'success' | 'listing' | 'warning' | 'pending' | 'error' | 'finished';
};

const sellerScreens: ScreenCard[] = [
  {
    title: 'Условия аукциона',
    description: 'Стартовая цена, шаг и срок',
    event: auctionGoals.sellerTermsSubmitted,
    to: '/auction?role=seller',
    kind: 'form',
  },
  {
    title: 'Проверка условий',
    description: 'Сводка перед публикацией',
    event: auctionGoals.sellerTermsReviewed,
    to: '/auction?role=seller&step=review',
    kind: 'review',
  },
  {
    title: 'Аукцион опубликован',
    description: 'Старт сценария покупателя',
    event: auctionGoals.sellerPublished,
    to: '/auction?role=seller&step=published',
    kind: 'success',
  },
];

const buyerScreens: ScreenCard[] = [
  {
    title: 'Карточка аукциона',
    description: 'Условия и форма ставки',
    event: auctionGoals.buyerCardViewed,
    to: '/auction?role=buyer',
    kind: 'listing',
  },
  {
    title: 'Ставка ниже шага',
    description: 'Валидация суммы',
    event: auctionGoals.bidValidationError,
    to: '/auction?role=buyer&state=low',
    kind: 'warning',
  },
  {
    title: 'Отправляем ставку',
    description: 'Ожидание ответа',
    event: auctionGoals.bidSubmitted,
    to: '/auction?role=buyer&state=pending',
    kind: 'pending',
  },
  {
    title: 'Ставка принята',
    description: 'Успешный статус',
    event: auctionGoals.bidAccepted,
    to: '/auction?role=buyer&state=accepted',
    kind: 'success',
  },
  {
    title: 'Ошибка ответа',
    description: 'Повторная попытка',
    event: auctionGoals.bidResponseError,
    to: '/auction?role=buyer&state=error',
    kind: 'error',
  },
  {
    title: 'Аукцион завершён',
    description: 'Итог для покупателя',
    event: auctionGoals.auctionFinishedViewed,
    to: '/auction?role=buyer&state=finished',
    kind: 'finished',
  },
];

function Miniature({ kind }: { kind: ScreenCard['kind'] }) {
  return (
    <div className={`${s.miniature} ${s[`miniature_${kind}`]}`} aria-hidden="true">
      <i className={s.miniHeader} />
      {kind === 'listing' || kind === 'finished' ? <i className={s.miniPhoto} /> : null}
      {kind === 'form' ? (
        <>
          <i className={s.miniTitle} />
          <i className={s.miniInput} />
          <i className={s.miniInput} />
          <i className={s.miniButton} />
        </>
      ) : kind === 'review' ? (
        <>
          <i className={s.miniTitle} />
          <i className={s.miniRow} />
          <i className={s.miniRow} />
          <i className={s.miniButton} />
        </>
      ) : kind === 'pending' ? (
        <>
          <i className={s.miniTitle} />
          <i className={s.miniInput} />
          <i className={s.miniLoader} />
        </>
      ) : (
        <>
          <i className={s.miniTitle} />
          <i className={s.miniPrice} />
          <i className={s.miniCard} />
          <i className={s.miniButton} />
        </>
      )}
    </div>
  );
}

function ScreenFlow({ role, screens }: { role: 'Продавец' | 'Покупатель'; screens: ScreenCard[] }) {
  return (
    <section className={s.flow} aria-labelledby={`${role}-flow`}>
      <div className={s.flowTitle}>
        <span>{role === 'Продавец' ? '01' : '02'}</span>
        <h2 id={`${role}-flow`}>{role}</h2>
      </div>
      <div className={s.cards}>
        {screens.map((screen, index) => (
          <div className={s.cardWithTransition} key={screen.title}>
            <Link className={s.screenCard} to={screen.to} aria-label={`Открыть экран: ${screen.title}`}>
              <Miniature kind={screen.kind} />
              <div className={s.cardText}>
                <h3>{screen.title}</h3>
                <p>{screen.description}</p>
              </div>
              <code>{screen.event}</code>
            </Link>
            {index < screens.length - 1 ? (
              <div className={s.transition} aria-label={`Переход: ${screens[index + 1].event}`}>
                <span>{screens[index + 1].event}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {role === 'Покупатель' ? (
        <p className={s.branchHint}>
          Из карточки возможны две ветки: некорректная сумма → «Ставка ниже шага»; успешная
          отправка → ожидание → принятая ставка. Ошибка ответа возвращает к форме.
        </p>
      ) : null}
    </section>
  );
}

const metrics = [
  {
    metric: 'Публикация после настройки',
    formula: 'seller_published ÷ seller_terms_submitted',
    target: '≥ 70%',
  },
  {
    metric: 'Конверсия карточки в ставку',
    formula: 'bid_submitted ÷ buyer_card_viewed',
    target: '≥ 12%',
  },
  {
    metric: 'Доля валидных ставок',
    formula: '(bid_submitted − bid_validation_error) ÷ bid_submitted',
    target: '≥ 85%',
  },
  {
    metric: 'Успешная отправка ставки',
    formula: 'bid_accepted ÷ bid_submitted',
    target: '≥ 90%',
  },
];

export function AuctionMapPage() {
  return (
    <AppShell>
      <PageLayout className={s.page}>
        <Breadcrumbs items={[{ label: 'Прототипы', to: '/patterns' }, { label: 'Карта аукциона' }]} />
        <header className={s.hero}>
          <p>Карта сценария · мобильный прототип</p>
          <h1>Аукцион: продавец и покупатель</h1>
          <div>
            <span>Яндекс Метрика</span>
            <code>счётчик {METRICA_COUNTER_ID}</code>
          </div>
        </header>
        <section className={s.legend} aria-label="Легенда">
          <span><i className={s.dotScreen} /> экран</span>
          <span><i className={s.dotEvent} /> событие Метрики</span>
          <span><i className={s.dotArrow} /> переход</span>
        </section>
        <ScreenFlow role="Продавец" screens={sellerScreens} />
        <ScreenFlow role="Покупатель" screens={buyerScreens} />
        <section className={s.metrics} aria-labelledby="metrics-title">
          <div>
            <p>Как проверим гипотезу</p>
            <h2 id="metrics-title">Целевые метрики</h2>
            <span>Значения — условные ориентиры для первого запуска.</span>
          </div>
          <div className={s.metricTable} role="table" aria-label="Целевые метрики аукциона">
            <div className={s.metricHead} role="row">
              <span role="columnheader">Показатель</span>
              <span role="columnheader">Расчёт из целей</span>
              <span role="columnheader">Цель</span>
            </div>
            {metrics.map((item) => (
              <div className={s.metricRow} role="row" key={item.metric}>
                <strong role="cell">{item.metric}</strong>
                <code role="cell">{item.formula}</code>
                <b role="cell">{item.target}</b>
              </div>
            ))}
          </div>
        </section>
      </PageLayout>
    </AppShell>
  );
}
