import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SupervisorProgressCard from '../components/supervisor/SupervisorProgressCard';
import { useOutletContext } from 'react-router-dom';

interface EIT {
  id: string;
  full_name: string;
  email: string;
  organization: string;
}

const SupervisorDashboard: React.FC = () => {
  const { appLoaded } = useOutletContext<{ appLoaded: boolean }>();
  const [loading, setLoading] = useState(true);
  const [eits, setEITs] = useState<EIT[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalEITs: 0,
    pendingReviews: 0,
    completedReviews: 0,
    averageTeamProgress: 0
  });
  const [supervisorName, setSupervisorName] = useState('Supervisor');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch supervisor name
      const { data: supervisorProfile } = await supabase
        .from('supervisor_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (supervisorProfile && supervisorProfile.full_name) {
        setSupervisorName(supervisorProfile.full_name);
      }

      // Fetch EIT information
      const { data: relationships, error: relError } = await supabase
        .from('supervisor_eit_relationships')
        .select(`
          eit_id,
          eit_profiles (
            id,
            full_name,
            email,
            organization
          )
        `)
        .eq('supervisor_id', user.id)
        .eq('status', 'active');

      if (relError) throw relError;
      let eitData: EIT[] = [];
      if (relationships) {
        eitData = relationships.map(rel => rel.eit_profiles as unknown as EIT);
        setEITs(eitData);
      }

      // Fetch pending reviews
      const { data: pendingReviews, error: reviewsError } = await supabase
        .from('experiences')
        .select('*')
        .in('eit_id', eitData.map(eit => eit.id))
        .eq('status', 'pending')
        .eq('needs_supervisor_review', true);

      if (reviewsError) throw reviewsError;

      // Fetch completed reviews
      const { data: completedReviews, error: completedError } = await supabase
        .from('experiences')
        .select('*')
        .in('eit_id', eitData.map(eit => eit.id))
        .eq('status', 'approved')
        .eq('needs_supervisor_review', false);

      if (completedError) throw completedError;

      // Calculate metrics
      setMetrics({
        totalEITs: eitData.length,
        pendingReviews: pendingReviews?.length || 0,
        completedReviews: completedReviews?.length || 0,
        averageTeamProgress: 0 // TODO: Calculate based on EIT progress
      });

      // Fetch recent activities
      const { data: activities, error: activitiesError } = await supabase
        .from('experiences')
        .select('*')
        .in('eit_id', eitData.map(eit => eit.id))
        .order('created_at', { ascending: false })
        .limit(5);

      if (activitiesError) throw activitiesError;
      setRecentActivities(activities || []);

      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatLastUpdated = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && appLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            Welcome back, {supervisorName}!
          </h1>
          <p className="text-slate-500 mt-1">Here's an overview of your team's progress</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <span className="text-sm text-slate-500 flex items-center">
            Last updated: {formatLastUpdated(lastUpdated)}
          </span>
          <button
            className={`btn btn-primary ${refreshing ? 'opacity-75 cursor-not-allowed' : ''}`}
            onClick={fetchDashboardData}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SupervisorProgressCard title="Total EITs" value={metrics.totalEITs} description="EITs under your supervision" color="teal" />
        <SupervisorProgressCard title="Pending Reviews" value={metrics.pendingReviews} description="Items awaiting your review" color="blue" />
        <SupervisorProgressCard title="Completed Reviews" value={metrics.completedReviews} description="Reviews completed" color="indigo" />
        <SupervisorProgressCard title="Team Progress" value={metrics.averageTeamProgress} total={100} description="Average team completion rate" color="purple" />
      </div>
      {/* Team Members */}
      {eits.length > 0 && (
        <div className="card mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {eits.map((eit) => (
                <div key={eit.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{eit.full_name}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{eit.email}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Organization</p>
                    <p className="font-medium">{eit.organization}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Recent Activities */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.length === 0 && <div className="text-slate-400">No recent activities</div>}
            {recentActivities.map((activity) => (
              <div key={activity.id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{activity.title}</h3>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SupervisorDashboardContent: React.FC = SupervisorDashboard;
export default SupervisorDashboardContent; 