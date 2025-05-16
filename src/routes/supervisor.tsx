import { createBrowserRouter } from 'react-router-dom';
import SupervisorDashboard from '../components/supervisor/SupervisorDashboard';

export const supervisorRouter = createBrowserRouter([
  {
    path: '/supervisor',
    element: <SupervisorDashboard />,
  },
  {
    path: '/supervisor/reviews',
    element: <div>Reviews Page (Coming Soon)</div>,
  },
  {
    path: '/supervisor/team',
    element: <div>Team Management Page (Coming Soon)</div>,
  },
  {
    path: '/supervisor/reports',
    element: <div>Reports Page (Coming Soon)</div>,
  },
]); 