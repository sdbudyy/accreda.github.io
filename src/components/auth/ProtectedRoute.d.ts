import { FC, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

declare const ProtectedRoute: FC<ProtectedRouteProps>;
export default ProtectedRoute; 