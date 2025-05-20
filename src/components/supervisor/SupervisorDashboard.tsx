import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import { useProgressStore } from '../../store/progress';
import ConnectionStatus from '../common/ConnectionStatus';

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
    <div className="space-y-6 bg-[#FDFBF7] min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
        <h2 className="text-2xl font-semibold mb-4 text-[#2C3E50]">My EITs</h2>
        <ConnectionStatus userType="supervisor" />
      </div>
      
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-[#2C3E50]">Supervisor Dashboard</h1>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold mb-2 text-[#2C3E50]">Total EITs</h3>
            <p className="text-3xl font-bold text-[#3498DB]">{metrics.totalEITs}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold mb-2 text-[#2C3E50]">Pending Reviews</h3>
            <p className="text-3xl font-bold text-[#3498DB]">{metrics.pendingReviews}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold mb-2 text-[#2C3E50]">Completed Reviews</h3>
            <p className="text-3xl font-bold text-[#3498DB]">{metrics.completedReviews}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold mb-2 text-[#2C3E50]">Team Progress</h3>
            <p className="text-3xl font-bold text-[#3498DB]">{metrics.averageTeamProgress}%</p>
          </div>
        </div>

        {/* Team Members */}
        {eits.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">Team Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {eits.map((eit) => (
                  <div key={eit.id} className="border-b border-[#E8E4D9] pb-4 last:border-0">
                    <div>
                      <p className="text-sm text-[#34495E]">Name</p>
                      <p className="font-medium text-[#2C3E50]">{eit.full_name}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-[#34495E]">Email</p>
                      <p className="font-medium text-[#2C3E50]">{eit.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="border-b border-[#E8E4D9] pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[#2C3E50]">{activity.title}</h3>
                      <p className="text-sm text-[#34495E]">{activity.description}</p>
                    </div>
                    <span className="text-sm text-[#34495E]">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'approved' ? 'bg-[#27AE60] bg-opacity-10 text-[#27AE60]' :
                      activity.status === 'pending' ? 'bg-[#F1C40F] bg-opacity-10 text-[#F39C12]' :
                      'bg-[#34495E] bg-opacity-10 text-[#34495E]'
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
    </div>
  );
};

export default SupervisorDashboard; 