import { Route } from 'react-router-dom';
import Login from '@/modules/auth/pages/login';

export const PublicRoutes = () => <Route path="/login" element={<Login />} />;
