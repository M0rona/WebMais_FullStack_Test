import { Navigate, Route, Routes } from 'react-router-dom';
import { PrivateRoutes } from '@/routes/private.routes';
import { PublicRoutes } from '@/routes/public.routes';

export const AppRoutes = () => (
  <Routes>
    {PublicRoutes()}
    {PrivateRoutes()}
    <Route path="/" element={<Navigate to="/contracts" replace />} />
  </Routes>
);
