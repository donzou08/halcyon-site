import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { HalcyonFooter, Num } from '../components/Primitives';
import { plantConfig } from '../config/plantConfig';

const cards = [
  {
    to: '/split',
    title: 'See both together',
    body: 'The phone on the left, the office on the right, sharing one set of numbers.',
    primary: true,
  },
  {
    to: '/worker',
    title: 'The phone',
    body: 'What an operator holds at the end of a shift.',
    primary: false,
  },
  {
    to: '/owner',
    title: 'The office',
    body: 'What you see the moment a shift closes.',
    primary: false,
  },
];

export function Landing() {
  const gap = plantConfig.dailyMouldsPoured - plantConfig.dailyDispatched;

  return (
    <div className="flex min-h-screen flex-col bg-canvas px-6 py-10">
      <p className="text-[14px] text-muted">
        {plantConfig.clientName} · {plantConfig.plantLocation}
      </p>

      <div className="mx-auto my-auto w-full max-w-[860px] py-10">
        <h1 className="text-[clamp(32px,4.6vw,52px)] leading-[1.08] font-bold tracking-tight">
          Every casting counted, at every stage, by the person who handled it.
        </h1>

        <p className="mt-6 max-w-[58ch] text-[18px] leading-relaxed text-muted">
          <Num value={plantConfig.dailyMouldsPoured} className="font-semibold text-ink" /> poured a
          day, <Num value={plantConfig.dailyDispatched} className="font-semibold text-ink" />{' '}
          dispatched. That leaves{' '}
          <Num value={gap} className="font-semibold text-bad" /> castings a day nobody can place at
          a stage, a shift or a name.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className={`card flex min-h-[150px] flex-col p-5 transition-shadow hover:shadow-lift ${
                card.primary ? 'sm:col-span-3 sm:min-h-0 sm:flex-row sm:items-center sm:gap-6' : ''
              }`}
            >
              <div className="flex-1">
                <h2 className="text-[20px] font-semibold">{card.title}</h2>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{card.body}</p>
              </div>
              <span
                className={`mt-auto flex items-center gap-2 pt-4 text-[15px] font-semibold sm:pt-0 ${
                  card.primary ? 'text-white' : 'text-ink'
                }`}
              >
                {card.primary ? (
                  <span className="flex items-center gap-2 rounded-control bg-ink px-5 py-3 text-white">
                    Start here
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </span>
                ) : (
                  <>
                    Open
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-[13px] text-faint">
        Demonstration data. These figures are illustrative and are not taken from plant records.
      </p>
      <HalcyonFooter />
    </div>
  );
}
