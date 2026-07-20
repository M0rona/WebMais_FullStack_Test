import { Route } from 'react-router-dom';
import Login from '@/modules/auth/pages/login';
import Register from '@/modules/auth/pages/register';

export const PublicRoutes = () => (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </>
);
