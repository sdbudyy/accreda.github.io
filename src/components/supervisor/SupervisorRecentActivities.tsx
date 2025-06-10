import React, { useEffect, useState } from 'react';
import { CheckCircle2, FileText, UserCheck, Edit3, X, Briefcase, Users, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

type ActivityBase = {
  id: string;
  type: 'approval' | 'feedback' | 'validation' | 'review' | 'comment';
  title: string;
  timestamp: string;
  eitName?: string;
  eitId?: string;
  status?: string;
  skillId?: string;
};

type Activity = ActivityBase;

const SupervisorRecentActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchActivities = async (supervisorId: string, supervisorEmail: string, limit: number = 5) => {
    try {
      setLoading(true);

      // Fetch recent skill validations (actions taken by this supervisor)
      const { data: skillValidations, error: skillValidationsError } = await supabase
        .from('skill_validations')
        .select(`id, validated_at, feedback, eit_id, skill_id, score, skills (name)`)
        .eq('validator_id', supervisorId)
        .order('validated_at', { ascending: false })
        .limit(limit);
      if (skillValidationsError) throw skillValidationsError;

      // Fetch recent SAO feedback (actions taken by this supervisor)
      const { data: saoFeedback, error: saoFeedbackError } = await supabase
        .from('sao_feedback')
        .select(`id, sao_id, feedback, status, updated_at, sao:saos (title, eit_id)`)
        .eq('supervisor_id', supervisorId)
        .order('updated_at', { ascending: false })
        .limit(limit);
      if (saoFeedbackError) throw saoFeedbackError;

      // Fetch recent validator actions (where supervisor is assigned as validator and status is not pending)
      const { data: validatorActions, error: validatorActionsError } = await supabase
        .from('validators')
        .select('id, updated_at, status, skill_id, eit_id, description, score')
        .eq('email', supervisorEmail)
        .neq('status', 'pending')
        .order('updated_at', { ascending: false })
        .limit(limit);
      if (validatorActionsError) throw validatorActionsError;

      // Combine all activities and collect unique EIT IDs and skill IDs
      const allActivitiesRaw = [
        ...(skillValidations || []).map(v => {
          let skillName = v.skill_id;
          if (v.skills && typeof v.skills === 'object' && !Array.isArray(v.skills) && (v.skills as Record<string, any>).name) {
            skillName = (v.skills as Record<string, any>).name;
          }
          return {
            id: v.id,
            type: 'validation' as const,
            title: `Validated "${skillName}"`,
            timestamp: v.validated_at ? String(v.validated_at) : '',
            eitId: v.eit_id,
            skillId: v.skill_id,
            status: v.score ? `Score: ${v.score}` : undefined
          };
        }),
        ...(saoFeedback || []).map(fb => {
          let saoTitle = fb.sao_id;
          let eitId = undefined;
          if (fb.sao && typeof fb.sao === 'object' && !Array.isArray(fb.sao)) {
            saoTitle = (fb.sao as Record<string, any>).title || fb.sao_id;
            eitId = (fb.sao as Record<string, any>).eit_id;
          }
          return {
            id: fb.id,
            type: 'feedback' as const,
            title: `Provided SAO feedback for "${saoTitle}"`,
            timestamp: fb.updated_at ? String(fb.updated_at) : '',
            eitId: eitId,
            skillId: undefined,
            status: fb.status
          };
        }),
        ...(validatorActions || []).map(v => {
          return {
            id: v.id,
            type: 'validation' as const,
            title: `Scored "${v.skill_id}"`,
            timestamp: v.updated_at ? String(v.updated_at) : '',
            eitId: v.eit_id,
            skillId: v.skill_id,
            status: v.score ? `Score: ${v.score}` : v.status
          };
        }),
      ];

      // Sort and slice to limit
      const allActivitiesSorted = allActivitiesRaw.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);

      // Collect unique EIT IDs and skill IDs
      const eitIds = Array.from(new Set(allActivitiesSorted.map(a => a.eitId).filter(Boolean)));
      const skillIds = Array.from(new Set(allActivitiesSorted.map(a => a.skillId).filter(Boolean)));

      // Fetch EIT names for these IDs
      let eitNameMap: Record<string, string> = {};
      if (eitIds.length > 0) {
        const { data: eitProfiles, error: eitProfilesError } = await supabase
          .from('eit_profiles')
          .select('id, full_name')
          .in('id', eitIds);
        if (!eitProfilesError && eitProfiles) {
          eitNameMap = eitProfiles.reduce((acc, curr) => {
            acc[curr.id] = curr.full_name;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Fetch skill names for these IDs
      let skillNameMap: Record<string, string> = {};
      if (skillIds.length > 0) {
        const { data: skills, error: skillsError } = await supabase
          .from('skills')
          .select('id, name')
          .in('id', skillIds);
        if (!skillsError && skills) {
          skillNameMap = skills.reduce((acc, curr) => {
            acc[curr.id] = curr.name;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Type guard for validation activities
      function isValidationActivity(a: any): a is Activity & { skillId: string } {
        return a.type === 'validation' && 'skillId' in a && !!a.skillId;
      }

      const allActivities: Activity[] = allActivitiesSorted.map(a => {
        let title = a.title;
        if (isValidationActivity(a)) {
          title = a.title.replace(/".*"/, `"${skillNameMap[a.skillId] || a.skillId}"`);
        }
        return {
          ...a,
          eitName: a.eitId ? eitNameMap[a.eitId] : undefined,
          title
        };
      });

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
        await fetchActivities(user.id, user.email || '');

        // Set up real-time subscriptions
        const skillValidationsSub = supabase
          .channel('skill-validations-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'skill_validations', filter: `validator_id=eq.${user.id}` },
            (payload) => { if (mounted) fetchActivities(user.id, user.email || ''); }
          )
          .subscribe();

        const saoFeedbackSub = supabase
          .channel('sao-feedback-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'sao_feedback', filter: `supervisor_id=eq.${user.id}` },
            (payload) => { if (mounted) fetchActivities(user.id, user.email || ''); }
          )
          .subscribe();

        const validatorsSub = supabase
          .channel('validators-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'validators', filter: `email=eq.${user.email}` },
            (payload) => { if (mounted) fetchActivities(user.id, user.email || ''); }
          )
          .subscribe();

        subscriptions = [skillValidationsSub, saoFeedbackSub, validatorsSub];
      } catch (error) {
        console.error('❌ Error setting up subscriptions:', error);
      }
    };

    setupSubscriptions();

    return () => {
      mounted = false;
      subscriptions.forEach(sub => {
        try { sub.unsubscribe(); } catch (e) {}
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
      navigate('/dashboard/supervisor/reviews', {
        state: {
          tab: 'saos',
          showHistory: true,
          scrollToId: activity.id,
          scrollToType: 'sao'
        }
      });
    } else if (activity.type === 'validation') {
      navigate('/dashboard/supervisor/reviews', {
        state: {
          tab: 'skills',
          showHistory: true,
          scrollToEitId: activity.eitId,
          scrollToSkillId: activity.skillId,
          scrollToType: 'validator'
        }
      });
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
          onClick={() => setShowModal(true)}
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