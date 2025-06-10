import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SupervisorProgressCard from '../components/supervisor/SupervisorProgressCard';
import { useOutletContext } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { supervisorService, SupervisorCategoryAverage } from '../services/supervisorService';
import SupervisorRecentActivities from '../components/supervisor/SupervisorRecentActivities';
import WeeklyDigest from '../components/dashboard/WeeklyDigest';
import ScrollToTop from '../components/ScrollToTop';
import QuickLinks from '../components/eitdashboard/QuickLinks';

interface EIT {
  id: string;
  full_name: string;
  email: string;
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
  const [pendingValidationRequests, setPendingValidationRequests] = useState(0);
  const [pendingSAOFeedbackRequests, setPendingSAOFeedbackRequests] = useState(0);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [categoryAverages, setCategoryAverages] = useState<SupervisorCategoryAverage[]>([]);

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
            email
          )
        `)
        .eq('supervisor_id', user.id)
        .eq('status', 'active');

      if (relError) throw relError;
      
      const eitData: EIT[] = relationships ? relationships.map(rel => rel.eit_profiles as unknown as EIT) : [];
      console.log('DEBUG relationships:', relationships);
      console.log('DEBUG eitData:', eitData);
      setEITs(eitData);

      // Fetch pending validation requests
      const { count: validationCount } = await supabase
        .from('validators')
        .select('*', { count: 'exact', head: true })
        .eq('email', user.email)
        .eq('status', 'pending');
      setPendingValidationRequests(validationCount || 0);

      // Fetch pending SAO feedback requests
      const { count: saoFeedbackCount } = await supabase
        .from('sao_feedback')
        .select('*', { count: 'exact', head: true })
        .eq('supervisor_id', user.id)
        .eq('status', 'pending');
      setPendingSAOFeedbackRequests(saoFeedbackCount || 0);

      if (eitData.length > 0) {
        // Fetch pending reviews (legacy, for backward compatibility)
        const { data: pendingReviews, error: reviewsError } = await supabase
          .from('experiences')
          .select('*')
          .in('eit_id', eitData.map(eit => eit.id))
          .eq('supervisor_approved', false);

        if (reviewsError) throw reviewsError;

        // Fetch completed reviews
        const { data: completedReviews, error: completedError } = await supabase
          .from('experiences')
          .select('*')
          .in('eit_id', eitData.map(eit => eit.id))
          .eq('supervisor_approved', true);

        if (completedError) throw completedError;

        // Calculate metrics
        setMetrics({
          totalEITs: eitData.length,
          pendingReviews: (pendingValidationRequests + pendingSAOFeedbackRequests),
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
      } else {
        // Reset metrics if no EITs
        setMetrics({
          totalEITs: 0,
          pendingReviews: 0,
          completedReviews: 0,
          averageTeamProgress: 0
        });
        setRecentActivities([]);
      }

      // Fetch category averages
      try {
        const averages = await supervisorService.getCategoryAverages(user.id);
        setCategoryAverages(averages);
      } catch (err) {
        console.error('Error fetching category averages:', err);
        setCategoryAverages([]);
      }

      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch EIT progress for all EITs
  const fetchEITProgress = async (eitIds: string[]) => {
    const progressResults = await Promise.all(
      eitIds.map(async (eitId) => {
        // Calculate progress for each EIT (reuse logic from SupervisorTeam)
        const [skillsRes, expRes, apprRes] = await Promise.all([
          supabase
            .from('eit_skills')
            .select('id', { count: 'exact', head: true })
            .eq('eit_id', eitId)
            .not('rank', 'is', null),
          supabase
            .from('experiences')
            .select('id', { count: 'exact', head: true })
            .eq('eit_id', eitId),
          supabase
            .from('experiences')
            .select('id', { count: 'exact', head: true })
            .eq('eit_id', eitId)
            .eq('supervisor_approved', true),
        ]);
        const completedSkills = skillsRes.count || 0;
        const documentedExperiences = expRes.count || 0;
        const supervisorApprovals = apprRes.count || 0;
        const skillsProgress = completedSkills / 22;
        const experiencesProgress = documentedExperiences / 22;
        const approvalsProgress = supervisorApprovals / 22;
        const overallProgress = Math.round(((skillsProgress + experiencesProgress + approvalsProgress) / 3) * 100);
        return [eitId, overallProgress];
      })
    );
    setProgressMap(Object.fromEntries(progressResults));
    return progressResults;
  };

  // Poll for live team progress
  useEffect(() => {
    if (eits.length > 0) {
      fetchEITProgress(eits.map(e => e.id));
      const interval = setInterval(() => {
        fetchEITProgress(eits.map(e => e.id));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [eits]);

  // Calculate average team progress
  const averageTeamProgress = eits.length > 0 ? Math.round(eits.reduce((sum, eit) => sum + (progressMap[eit.id] || 0), 0) / eits.length) : 0;

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
    <>
      <div className="container mx-auto px-4 pt-0 pb-4">
        <WeeklyDigest />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Welcome back, {supervisorName}!</h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">SUPERVISOR</span>
            </div>
            <p className="text-slate-500 mt-1 text-base">Here's an overview of your team's progress</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0 w-full md:w-auto justify-end">
            <span className="text-sm text-slate-500 flex items-center">
              <Clock size={14} className="mr-1" />
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
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 min-w-[220px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg text-slate-800">Team Progress</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-600">{averageTeamProgress}%</span>
            </div>
            <div className="w-full h-2 rounded bg-slate-100">
              <div className="h-full rounded bg-teal-500 transition-all duration-700" style={{ width: `${averageTeamProgress}%` }}></div>
            </div>
            <div className="text-xs text-slate-500 mt-1">Average team completion rate</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 min-w-[220px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg text-slate-800">Total EITs</span>
            </div>
            <span className="block text-3xl font-extrabold text-slate-900 leading-tight">{metrics.totalEITs}</span>
            <div className="text-xs text-slate-500 mt-1">EITs under your supervision</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 min-w-[220px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg text-slate-800">Pending Reviews</span>
            </div>
            <span className="block text-3xl font-extrabold text-slate-900 leading-tight">{pendingValidationRequests + pendingSAOFeedbackRequests}</span>
            <div className="text-xs text-slate-500 mt-1">Validations: {pendingValidationRequests}, SAOs: {pendingSAOFeedbackRequests}</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 min-w-[220px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg text-slate-800">Completed Reviews</span>
            </div>
            <span className="block text-3xl font-extrabold text-slate-900 leading-tight">{metrics.completedReviews}</span>
            <div className="text-xs text-slate-500 mt-1">Reviews completed</div>
          </div>
        </div>
        {/* Category Averages Cards */}
        {categoryAverages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {categoryAverages.map((cat) => (
              <div key={cat.category} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2 min-w-[220px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg text-slate-800">{cat.category}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                    {cat.average_score?.toFixed(2) ?? '0.00'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Avg. self-score (from {cat.num_eits} EIT{cat.num_eits !== 1 ? 's' : ''})</div>
              </div>
            ))}
          </div>
        )}
        {/* Main Dashboard Content: Team Members, Recent Activities, Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Members */}
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Team Members</h2>
              {eits.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
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
              ) : (
                <p className="text-slate-500">No team members found.</p>
              )}
            </div>
          </div>
          {/* Recent Activities */}
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">Recent Activities</h2>
              <SupervisorRecentActivities />
            </div>
          </div>
          {/* Quick Links */}
          <div className="card">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">Quick Links</h2>
              </div>
              <QuickLinks />
            </div>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </>
  );
};

const SupervisorDashboardContent: React.FC = SupervisorDashboard;
export default SupervisorDashboardContent; 