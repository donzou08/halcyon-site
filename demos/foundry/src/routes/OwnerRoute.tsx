import { Link } from 'react-router-dom';

import { HalcyonFooter } from '../components/Primitives';
import { OwnerApp } from '../owner/OwnerApp';

export function OwnerRoute() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="border-b border-line bg-white px-5 py-2">
        <Link to="/" className="text-[13px] text-muted hover:text-ink">
          Back to the three views
        </Link>
      </div>
      <div className="flex-1">
        <OwnerApp />
      </div>
      <HalcyonFooter />
    </div>
  );
}
