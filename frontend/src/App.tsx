import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { LoginPage } from './pages/LoginPage';
import { RequireAuth } from './routes/RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/candidates"
          element={
            <RequireAuth>
              <CandidatesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/analytics"
          element={
            <RequireAuth>
              <AnalyticsPage />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/candidates" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
