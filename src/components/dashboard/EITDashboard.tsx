import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import { useProgressStore } from '../../store/progress';

interface Supervisor {
  id: string;
  full_name: string;
  email: string;
  organization: string;
}

interface Relationship {
  supervisor_id: string;
  supervisor_profiles: Supervisor;
}

const EITDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const { overallProgress, completedSkills, documentedExperiences, supervisorApprovals } = useProgressStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch supervisor information
        const { data: relationship, error: relError } = await supabase
          .from('supervisor_eit_relationships')
          .select(`
            supervisor_id,
            supervisor_profiles (
              id,
              full_name,
              email,
              organization
            )
          `)
          .eq('eit_id', user.id)
          .eq('status', 'active')
          .single();

        if (relError) throw relError;
        if (relationship?.supervisor_profiles) {
          const supervisorData = relationship.supervisor_profiles as unknown as Supervisor;
          setSupervisor(supervisorData);
        }

        // Fetch recent activities
        const { data: activities, error: activitiesError } = await supabase
          .from('experiences')
          .select('*')
          .eq('eit_id', user.id)
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
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">EIT Dashboard</h1>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Overall Progress</h3>
          <p className="text-3xl font-bold text-teal-600">{overallProgress}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Skills Completed</h3>
          <p className="text-3xl font-bold text-teal-600">{completedSkills}/22</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Experiences Documented</h3>
          <p className="text-3xl font-bold text-teal-600">{documentedExperiences}/24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Supervisor Approvals</h3>
          <p className="text-3xl font-bold text-teal-600">{supervisorApprovals}/24</p>
        </div>
      </div>

      {/* Supervisor Information */}
      {supervisor && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Supervisor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{supervisor.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{supervisor.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Organization</p>
                <p className="font-medium">{supervisor.organization}</p>
              </div>
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

export default EITDashboard; 