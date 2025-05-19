import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import { useProgressStore } from '../../store/progress';

interface EIT {
  id: string;
  full_name: string;
  email: string;
}

interface Relationship {
  eit_id: string;
  eit_profiles: EIT;
}

const SupervisorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [eits, setEITs] = useState<EIT[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalEITs: 0,
    pendingReviews: 0,
    completedReviews: 0,
    averageTeamProgress: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch EIT information
        const { data: relationships, error: relError } = await supabase
          .from('supervisor_eit_relationships')
          .select(`
            eit_id,
            eit_profiles (
              id,
              full_name,
              email
            )
          `)
          .eq('supervisor_id', user.id)
          .eq('status', 'active');

        if (relError) throw relError;
        if (relationships) {
          const eitData = relationships.map(rel => rel.eit_profiles as unknown as EIT);
          setEITs(eitData);
        }

        // Fetch pending reviews
        const { data: pendingReviews, error: reviewsError } = await supabase
          .from('experiences')
          .select('*')
          .in('eit_id', eits.map(eit => eit.id))
          .eq('status', 'pending')
          .eq('needs_supervisor_review', true);

        if (reviewsError) throw reviewsError;

        // Fetch completed reviews
        const { data: completedReviews, error: completedError } = await supabase
          .from('experiences')
          .select('*')
          .in('eit_id', eits.map(eit => eit.id))
          .eq('status', 'approved')
          .eq('needs_supervisor_review', false);

        if (completedError) throw completedError;

        // Calculate metrics
        setMetrics({
          totalEITs: eits.length,
          pendingReviews: pendingReviews?.length || 0,
          completedReviews: completedReviews?.length || 0,
          averageTeamProgress: 0 // TODO: Calculate based on EIT progress
        });

        // Fetch recent activities
        const { data: activities, error: activitiesError } = await supabase
          .from('experiences')
          .select('*')
          .in('eit_id', eits.map(eit => eit.id))
          .order('created_at', { ascending: false })
          .limit(5);

        if (activitiesError) throw activitiesError;
        setRecentActivities(activities || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [eits]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Supervisor Dashboard</h1>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total EITs</h3>
          <p className="text-3xl font-bold text-teal-600">{metrics.totalEITs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Pending Reviews</h3>
          <p className="text-3xl font-bold text-teal-600">{metrics.pendingReviews}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Completed Reviews</h3>
          <p className="text-3xl font-bold text-teal-600">{metrics.completedReviews}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Team Progress</h3>
          <p className="text-3xl font-bold text-teal-600">{metrics.averageTeamProgress}%</p>
        </div>
      </div>

      {/* Team Members */}
      {eits.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
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

export default SupervisorDashboard; 