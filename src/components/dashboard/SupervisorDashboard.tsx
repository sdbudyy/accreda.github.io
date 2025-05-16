import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  progress: number;
  last_activity: string;
  completed_saos: number;
  total_saos: number;
  completed_documents: number;
  total_documents: number;
  completed_skills: number;
  total_skills: number;
}

const SupervisorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [totalTeamProgress, setTotalTeamProgress] = useState(0);
  const [totalSAOs, setTotalSAOs] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch team members (EITs under this supervisor)
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

        // Transform and fetch additional data for each team member
        const teamData = await Promise.all(
          (relationships || []).map(async (rel: any) => {
            const eit = rel.eit_profiles;
            // Fetch SAOs progress
            const { data: saosData } = await supabase
              .from('saos')
              .select('status')
              .eq('eit_id', eit.id);
            // Fetch documents progress
            const { data: documentsData } = await supabase
              .from('documents')
              .select('status')
              .eq('eit_id', eit.id);
            // Fetch skills progress
            const { data: skillsData } = await supabase
              .from('eit_skills')
              .select('status')
              .eq('eit_id', eit.id);
            const completedSaos = saosData?.filter(sao => sao.status === 'completed').length || 0;
            const totalSaos = saosData?.length || 0;
            const completedDocuments = documentsData?.filter(doc => doc.status === 'completed').length || 0;
            const totalDocuments = documentsData?.length || 0;
            const completedSkills = skillsData?.filter(skill => skill.status === 'completed').length || 0;
            const totalSkills = skillsData?.length || 0;
            // Calculate overall progress
            const progress = Math.round(
              ((completedSaos + completedDocuments + completedSkills) /
                (totalSaos + totalDocuments + totalSkills || 1)) * 100
            );
            // Fetch last activity
            const { data: lastActivity } = await supabase
              .from('experiences')
              .select('created_at')
              .eq('eit_id', eit.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            return {
              id: eit.id,
              full_name: eit.full_name,
              email: eit.email,
              progress,
              last_activity: lastActivity?.created_at || 'No activity',
              completed_saos: completedSaos,
              total_saos: totalSaos,
              completed_documents: completedDocuments,
              total_documents: totalDocuments,
              completed_skills: completedSkills,
              total_skills: totalSkills
            };
          })
        );
        setTeamMembers(teamData);
        // Calculate total team progress
        const avgProgress = teamData.reduce((acc, member) => acc + member.progress, 0) / (teamData.length || 1);
        setTotalTeamProgress(Math.round(avgProgress));
        // Calculate total SAOs submitted by team
        const teamSAOs = teamData.reduce((acc, member) => acc + member.completed_saos, 0);
        setTotalSAOs(teamSAOs);
        // Fetch pending applications (experiences with status 'pending_review')
        const { data: pending, error: pendingError } = await supabase
          .from('experiences')
          .select('id')
          .eq('supervisor_id', user.id)
          .eq('status', 'pending_review');
        if (pendingError) throw pendingError;
        setPendingApplications(pending?.length || 0);
        // Fetch recent activities (last 5 experiences from any EIT under this supervisor)
        const { data: activities, error: activitiesError } = await supabase
          .from('experiences')
          .select('*')
          .in('eit_id', teamData.map(m => m.id))
          .order('created_at', { ascending: false })
          .limit(5);
        if (activitiesError) throw activitiesError;
        setRecentActivities(activities || []);
      } catch (error) {
        console.error('Error fetching supervisor dashboard data:', error);
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
      <h1 className="text-2xl font-bold mb-6">Supervisor Dashboard</h1>
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Average Progress</h3>
          <p className="text-3xl font-bold text-teal-600">{totalTeamProgress}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Employees</h3>
          <p className="text-3xl font-bold text-teal-600">{teamMembers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total SAOs Submitted by Team</h3>
          <p className="text-3xl font-bold text-teal-600">{totalSAOs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Pending Applications</h3>
          <p className="text-3xl font-bold text-teal-600">{pendingApplications}</p>
        </div>
      </div>
      {/* Employees Overview */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Employees Overview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SAOs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{member.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-teal-600 h-2.5 rounded-full"
                          style={{ width: `${member.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{member.progress}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.completed_saos}/{member.total_saos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.completed_documents}/{member.total_documents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.completed_skills}/{member.total_skills}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(member.last_activity).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-teal-600 hover:text-teal-900"
                        onClick={() => {/* TODO: Implement view details */}}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
                    {activity.status?.charAt(0).toUpperCase() + activity.status?.slice(1)}
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