import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import { useProgressStore } from '../../store/progress';
import { Clock } from 'lucide-react';

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
  const [refreshing, setRefreshing] = useState(false);
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const { 
    overallProgress, 
    completedSkills, 
    documentedExperiences, 
    supervisorApprovals,
    updateProgress,
    loading: progressLoading 
  } = useProgressStore();

  const fetchDashboardData = async () => {
    if (refreshing) return; // Prevent multiple refreshes
    
    try {
      setRefreshing(true);
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
        .order('updated_at', { ascending: false })
        .limit(5);

      if (activitiesError) throw activitiesError;
      setRecentActivities(activities || []);

      // Update progress with force=true to bypass cache
      await updateProgress(true);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 bg-[#FDFBF7] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2C3E50]">EIT Dashboard</h1>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <span className="text-sm text-[#34495E] flex items-center">
            <Clock size={14} className="mr-2" /> 
            Last updated: {formatLastUpdated(lastUpdated)}
          </span>
          <button 
            className={`px-4 py-2 bg-[#3498DB] text-white rounded-full text-sm font-medium hover:bg-[#2980B9] transition-all duration-300 transform hover:scale-105 ${(refreshing || progressLoading) ? 'opacity-75 cursor-not-allowed' : ''}`}
            onClick={fetchDashboardData}
            disabled={refreshing || progressLoading}
          >
            {(refreshing || progressLoading) ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-2 text-[#2C3E50]">Overall Progress</h3>
          <p className="text-3xl font-bold text-[#3498DB]">{overallProgress}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-2 text-[#2C3E50]">Skills Completed</h3>
          <p className="text-3xl font-bold text-[#3498DB]">{completedSkills}/22</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-2 text-[#2C3E50]">Experiences Documented</h3>
          <p className="text-3xl font-bold text-[#3498DB]">{documentedExperiences}/22</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-2 text-[#2C3E50]">Supervisor Approvals</h3>
          <p className="text-3xl font-bold text-[#3498DB]">{supervisorApprovals}/22</p>
        </div>
      </div>

      {/* Supervisor Information */}
      {supervisor && (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">Supervisor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-[#34495E]">Name</p>
                <p className="font-medium text-[#2C3E50]">{supervisor.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-[#34495E]">Email</p>
                <p className="font-medium text-[#2C3E50]">{supervisor.email}</p>
              </div>
              <div>
                <p className="text-sm text-[#34495E]">Organization</p>
                <p className="font-medium text-[#2C3E50]">{supervisor.organization}</p>
              </div>
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
  );
};

export default EITDashboard; 