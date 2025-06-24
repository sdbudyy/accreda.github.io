import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import { useProgressStore } from '../../store/progress';
import SkillsOverview from './SkillsOverview';
import ConnectionStatus from '../common/ConnectionStatus';
import ProgressCard from './ProgressCard';

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
  const [eitProfile, setEitProfile] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch EIT profile for expected progress
        const { data: eitProfileData } = await supabase
          .from('eit_profiles')
          .select('start_date, target_date')
          .eq('id', user.id)
          .single();
        setEitProfile(eitProfileData);

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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">My Supervisor</h2>
        <ConnectionStatus userType="eit" />
      </div>
      
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">EIT Dashboard</h1>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            {/* Enhanced Overall Progress Card */}
            {(() => {
              let expectedProgress = null;
              let progressColor: 'teal' | 'blue' | 'purple' = 'teal';
              let progressDescription = '';
              if (eitProfile && eitProfile.start_date && eitProfile.target_date) {
                const now = new Date();
                const start = new Date(eitProfile.start_date);
                const end = new Date(eitProfile.target_date);
                const total = end.getTime() - start.getTime();
                const elapsed = now.getTime() - start.getTime();
                let percent = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
                expectedProgress = percent;
                const delta = overallProgress - percent;
                if (delta > 5) {
                  progressColor = 'teal';
                  progressDescription = `Ahead of schedule (Expected: ${percent}%) — Great job! Keep up the momentum.`;
                } else if (delta >= -5) {
                  progressColor = 'blue';
                  progressDescription = `On track (Expected: ${percent}%) — Stay consistent and keep updating your progress.`;
                } else {
                  progressColor = 'purple';
                  progressDescription = `Behind schedule (Expected: ${percent}%) — Consider updating your records or catching up soon.`;
                }
              }
              return (
                <ProgressCard
                  title="Overall Progress"
                  value={overallProgress}
                  total={100}
                  description={
                    expectedProgress !== null
                      ? progressDescription
                      : overallProgress >= 75 ? 'Excellent progress!' : 
                        overallProgress >= 50 ? 'Good progress!' : 
                        overallProgress >= 25 ? 'Keep going!' : 'Just getting started!'
                  }
                  color={eitProfile && eitProfile.start_date && eitProfile.target_date ? progressColor : 'teal'}
                />
              );
            })()}
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Skills Completed</h3>
            <p className="text-3xl font-bold text-teal-600">{completedSkills}/22</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Experiences Documented</h3>
            <p className="text-3xl font-bold text-teal-600">{documentedExperiences}/22</p>
          </div>
        </div>

        {/* Skills Overview - Only for EITs */}
        <SkillsOverview />

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
                      activity.status === 'complete' ? 'bg-green-100 text-green-800' :
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
    </div>
  );
};

export default EITDashboard; 