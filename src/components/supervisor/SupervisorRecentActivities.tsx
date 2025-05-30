import React, { useEffect, useState } from 'react';
import { CheckCircle2, FileText, UserCheck, Edit3, X, Briefcase, Users, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  type: 'approval' | 'feedback' | 'validation' | 'review' | 'comment';
  title: string;
  timestamp: string;
  eitName?: string;
  eitId?: string;
  status?: string;
}

const SupervisorRecentActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchActivities = async (supervisorId: string, limit: number = 5) => {
    try {
      console.log('🔄 Starting fetchActivities for supervisor:', supervisorId);
      setLoading(true);

      // Fetch recent skill approvals
      const { data: recentApprovals, error: approvalsError } = await supabase
        .from('skill_approvals')
        .select(`
          id,
          approved_at,
          feedback,
          eit_id,
          supervisor_id,
          skill_id,
          eit_profiles (
            id,
            full_name
          ),
          skills (
            id,
            name
          )
        `)
        .eq('supervisor_id', supervisorId)
        .order('approved_at', { ascending: false })
        .limit(limit);

      if (approvalsError) throw approvalsError;

      // Fetch recent SAO feedback
      const { data: recentSAOs, error: saosError } = await supabase
        .from('saos')
        .select(`
          *,
          eit_profiles (
            id,
            full_name
          )
        `)
        .eq('supervisor_id', supervisorId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (saosError) throw saosError;

      // Fetch recent validations
      const { data: recentValidations, error: validationsError } = await supabase
        .from('validations')
        .select(`
          *,
          eit_profiles (
            id,
            full_name
          )
        `)
        .eq('supervisor_id', supervisorId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (validationsError) throw validationsError;

      // Fetch recent experiences that need review
      const { data: recentExperiences, error: experiencesError } = await supabase
        .from('experiences')
        .select(`
          *,
          eit_profiles (
            id,
            full_name
          )
        `)
        .eq('needs_supervisor_review', true)
        .eq('supervisor_id', supervisorId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (experiencesError) throw experiencesError;

      // Combine and sort all activities
      const allActivities: Activity[] = [
        ...(recentApprovals || []).map(approval => {
          const skill = Array.isArray(approval.skills) ? approval.skills[0] : approval.skills;
          const eitProfile = Array.isArray(approval.eit_profiles) ? approval.eit_profiles[0] : approval.eit_profiles;
          return {
            id: approval.id,
            type: 'approval' as const,
            title: `Approved "${skill?.name || approval.skill_id}" for ${eitProfile?.full_name || approval.eit_id}`,
            timestamp: approval.approved_at,
            eitName: eitProfile?.full_name,
            eitId: eitProfile?.id,
            status: undefined
          };
        }),
        ...(recentSAOs || []).map(sao => ({
          id: sao.id,
          type: 'feedback' as const,
          title: `Provided feedback on "${sao.title}" SAO`,
          timestamp: sao.updated_at,
          eitName: sao.eit_profiles?.full_name,
          eitId: sao.eit_profiles?.id,
          status: sao.status
        })),
        ...(recentValidations || []).map(validation => ({
          id: validation.id,
          type: 'validation' as const,
          title: `Validated "${validation.title}"`,
          timestamp: validation.updated_at,
          eitName: validation.eit_profiles?.full_name,
          eitId: validation.eit_profiles?.id,
          status: validation.status
        })),
        ...(recentExperiences || []).map(exp => ({
          id: exp.id,
          type: 'review' as const,
          title: `Review needed for "${exp.title}"`,
          timestamp: exp.updated_at,
          eitName: exp.eit_profiles?.full_name,
          eitId: exp.eit_profiles?.id,
          status: exp.status
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, limit);

      setActivities(allActivities);
    } catch (error) {
      console.error('❌ Error in fetchActivities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let subscriptions: any[] = [];

    const setupSubscriptions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('❌ No authenticated user found');
          return;
        }

        // Initial fetch
        await fetchActivities(user.id);

        // Set up real-time subscriptions
        const saosSubscription = supabase
          .channel('supervisor-saos-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'saos',
              filter: `supervisor_id=eq.${user.id}`
            }, 
            () => {
              if (mounted) {
                fetchActivities(user.id);
              }
            }
          )
          .subscribe();

        const validationsSubscription = supabase
          .channel('supervisor-validations-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'validations',
              filter: `supervisor_id=eq.${user.id}`
            }, 
            () => {
              if (mounted) {
                fetchActivities(user.id);
              }
            }
          )
          .subscribe();

        const experiencesSubscription = supabase
          .channel('supervisor-experiences-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'experiences',
              filter: `supervisor_id=eq.${user.id}`
            }, 
            () => {
              if (mounted) {
                fetchActivities(user.id);
              }
            }
          )
          .subscribe();

        subscriptions = [
          saosSubscription,
          validationsSubscription,
          experiencesSubscription
        ];
      } catch (error) {
        console.error('❌ Error setting up subscriptions:', error);
      }
    };

    setupSubscriptions();

    return () => {
      mounted = false;
      subscriptions.forEach(sub => {
        try {
          sub.unsubscribe();
        } catch (error) {
          console.error('❌ Error unsubscribing:', error);
        }
      });
    };
  }, []);

  const typeIcons = {
    approval: <CheckCircle2 size={16} className="text-green-500" />,
    feedback: <MessageSquare size={16} className="text-blue-500" />,
    validation: <UserCheck size={16} className="text-purple-500" />,
    review: <Edit3 size={16} className="text-amber-500" />,
    comment: <MessageSquare size={16} className="text-indigo-500" />
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 5) return 'Just now';
    if (diffInMinutes < 30) return `${Math.floor(diffInMinutes / 5) * 5} minutes ago`;
    if (diffInHours < 1) return '30 minutes ago';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const handleView = (activity: Activity) => {
    if (activity.type === 'feedback') {
      navigate(`/supervisor/saos?saoId=${activity.id}`);
    } else if (activity.type === 'validation') {
      navigate(`/supervisor/validations?validationId=${activity.id}`);
    } else if (activity.type === 'review') {
      navigate(`/supervisor/reviews?experienceId=${activity.id}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3 animate-pulse">
            <div className="p-2 rounded-full bg-slate-200 mt-0.5 w-8 h-8" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-slate-100 mt-0.5">
                {typeIcons[activity.type]}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-800">{activity.title}</p>
                <div className="flex items-center mt-1">
                  {activity.eitName && (
                    <span className="text-xs font-medium text-slate-700 mr-2">{activity.eitName}</span>
                  )}
                  <span className="text-xs text-slate-500">{formatTimestamp(activity.timestamp)}</span>
                </div>
              </div>
              <button
                className="ml-2 px-3 py-1 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200"
                onClick={() => handleView(activity)}
              >
                View
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-slate-500">
            No recent activities
          </div>
        )}
        
        <button 
          className="w-full text-center py-2 text-lg text-teal-600 hover:underline font-medium"
          onClick={() => navigate('/supervisor/activities')}
        >
          View more activities
        </button>
      </div>

      {/* Activities Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Recent Activities</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-4rem)]">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-slate-100 mt-0.5">
                      {typeIcons[activity.type]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">{activity.title}</p>
                      <div className="flex items-center mt-1">
                        {activity.eitName && (
                          <span className="text-xs font-medium text-slate-700 mr-2">{activity.eitName}</span>
                        )}
                        <span className="text-xs text-slate-500">{formatTimestamp(activity.timestamp)}</span>
                      </div>
                    </div>
                    <button
                      className="ml-2 px-3 py-1 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200"
                      onClick={() => {
                        handleView(activity);
                        setShowModal(false);
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupervisorRecentActivities; 