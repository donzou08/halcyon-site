import { Link } from 'react-router-dom';

import { HalcyonFooter, ResetButton } from '../components/Primitives';
import { plantConfig } from '../config/plantConfig';
import { useDocumentLocale } from '../i18n/useTranslation';
import { useStore } from '../store/useStore';
import { WorkerApp } from '../worker/WorkerApp';

export function WorkerRoute() {
  const locale = useStore((s) => s.locale);
  useDocumentLocale(locale, true);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-2.5">
        <Link to="/" className="text-[14px] text-muted hover:text-ink">
          {plantConfig.clientName}
        </Link>
        <span className="ml-auto">
          <ResetButton />
        </span>
      </div>

      <div className="flex min-h-0 flex-1 justify-center">
        <div className="flex w-full max-w-[420px] flex-col border-x border-line">
          <WorkerApp />
        </div>
      </div>

      <div className="shrink-0 bg-canvas">
        <HalcyonFooter />
      </div>
    </div>
  );
}
