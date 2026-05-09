import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../api/client';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <>{children}</>;
}
