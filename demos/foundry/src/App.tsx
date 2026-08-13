import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Landing } from './routes/Landing';
import { OwnerRoute } from './routes/OwnerRoute';
import { SplitView } from './routes/SplitView';
import { WorkerRoute } from './routes/WorkerRoute';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/worker" element={<WorkerRoute />} />
        <Route path="/owner" element={<OwnerRoute />} />
        <Route path="/split" element={<SplitView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
