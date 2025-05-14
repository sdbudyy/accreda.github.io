import React, { useEffect, useState } from 'react';
import { CheckCircle2, FileText, UserCheck, Edit3, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSAOsStore, SAO } from '../../store/saos';
import { useSkillsStore } from '../../store/skills';
import { useNavigate } from 'react-router-dom';
import { SAOModal } from '../../pages/SAOs';
import DocumentPreview from '../documents/DocumentPreview';

interface Activity {
  id: string;
  type: 'completed' | 'document' | 'approval' | 'essay';
  title: string;
  timestamp: string;
  user?: string;
}

const RecentActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSAO, setEditingSAO] = useState<SAO | null>(null);
  const [isSAOModalOpen, setIsSAOModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{ id: string; title: string } | null>(null);
  const { saos } = useSAOsStore();
  const { skillCategories } = useSkillsStore();
  const navigate = useNavigate();

  const fetchActivities = async (userId: string, limit: number = 5) => {
    try {
      console.log('🔄 Starting fetchActivities for user:', userId);
      setLoading(true);

      // Fetch recent SAOs
      console.log('📝 Fetching SAOs...');
      const { data: recentSAOs, error: saosError } = await supabase
        .from('saos')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (saosError) {
        console.error('❌ Error fetching SAOs:', saosError);
        throw saosError;
      }
      console.log('📝 Recent SAOs:', recentSAOs?.length || 0, 'items');

      // Fetch recent documents
      console.log('📄 Fetching documents...');
      const { data: recentDocs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (docsError) {
        console.error('❌ Error fetching documents:', docsError);
        throw docsError;
      }
      console.log('📄 Recent documents:', recentDocs?.length || 0, 'items');

      // Fetch recent skill updates
      console.log('🎯 Fetching skills...');
      const { data: recentSkills, error: skillsError } = await supabase
        .from('user_skills')
        .select(`
          *,
          skills (
            name
          )
        `)
        .eq('user_id', userId)
        .not('rank', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (skillsError) {
        console.error('❌ Error fetching skills:', skillsError);
        throw skillsError;
      }
      console.log('🎯 Recent skills:', recentSkills?.length || 0, 'items');

      // Log raw data for debugging
      console.log('Raw data:', {
        saos: recentSAOs,
        docs: recentDocs,
        skills: recentSkills
      });

      // Combine and sort all activities
      const allActivities: Activity[] = [
        ...(recentSAOs || []).map(sao => ({
          id: sao.id,
          type: 'essay' as const,
          title: `Updated "${sao.title}" SAO`,
          timestamp: sao.updated_at
        })),
        ...(recentDocs || []).map(doc => ({
          id: doc.id,
          type: 'document' as const,
          title: `Updated "${doc.title}" document`,
          timestamp: doc.updated_at
        })),
        ...(recentSkills || []).map(skill => ({
          id: skill.skill_id,
          type: 'completed' as const,
          title: `Completed "${skill.skills?.name || 'Skill'}" skill`,
          timestamp: skill.updated_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, limit);

      console.log('✨ Combined activities:', allActivities.length, 'items');
      console.log('✨ Activities details:', allActivities);
      setActivities(allActivities);
    } catch (error) {
      console.error('❌ Error in fetchActivities:', error);
      setActivities([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let subscriptions: any[] = [];

    const setupSubscriptions = async () => {
      try {
        console.log('🔑 Getting current user...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('❌ No authenticated user found');
          return;
        }
        console.log('✅ User found:', user.id);

        // Initial fetch
        console.log('🔄 Starting initial fetch...');
        await fetchActivities(user.id);

        // Set up real-time subscriptions
        console.log('📡 Setting up real-time subscriptions...');
        
        const saosSubscription = supabase
          .channel('saos-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'saos',
              filter: `user_id=eq.${user.id}`
            }, 
            (payload) => {
              console.log('📝 SAO change detected:', payload);
              if (mounted) {
                fetchActivities(user.id);
              }
            }
          )
          .subscribe((status) => {
            console.log('📝 SAOs subscription status:', status);
          });

        const docsSubscription = supabase
          .channel('docs-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'documents',
              filter: `user_id=eq.${user.id}`
            }, 
            (payload) => {
              console.log('📄 Document change detected:', payload);
              if (mounted) {
                fetchActivities(user.id);
              }
            }
          )
          .subscribe((status) => {
            console.log('📄 Documents subscription status:', status);
          });

        const skillsSubscription = supabase
          .channel('skills-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'user_skills',
              filter: `user_id=eq.${user.id}`
            }, 
            (payload) => {
              console.log('🎯 Skill change detected:', payload);
              if (mounted) {
                fetchActivities(user.id);
              }
            }
          )
          .subscribe((status) => {
            console.log('🎯 Skills subscription status:', status);
          });

        subscriptions = [saosSubscription, docsSubscription, skillsSubscription];
        console.log('✅ All subscriptions set up');
      } catch (error) {
        console.error('❌ Error setting up subscriptions:', error);
      }
    };

    setupSubscriptions();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up subscriptions');
      mounted = false;
      subscriptions.forEach(sub => {
        try {
          sub.unsubscribe();
        } catch (error) {
          console.error('❌ Error unsubscribing:', error);
        }
      });
    };
  }, []); // Empty dependency array since we only want to set up subscriptions once

  const typeIcons = {
    completed: <CheckCircle2 size={16} className="text-green-500" />,
    document: <FileText size={16} className="text-blue-500" />,
    approval: <UserCheck size={16} className="text-purple-500" />,
    essay: <Edit3 size={16} className="text-amber-500" />
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
    if (activity.type === 'completed') {
      navigate('/dashboard/skills');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('scroll-to-skill', { 
          detail: { 
            skillId: activity.id,
            timestamp: Date.now()
          } 
        }));
      }, 500);
    } else if (activity.type === 'essay') {
      navigate(`/dashboard/saos?saoId=${activity.id}`);
    } else if (activity.type === 'document') {
      const titleMatch = activity.title.match(/"([^"]+)"/);
      const documentTitle = titleMatch ? titleMatch[1] : 'Document';
      setPreviewDocument({ id: activity.id, title: documentTitle });
    }
  };

  const handleViewMore = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchActivities(user.id, 10);
      setShowModal(true);
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
                  {activity.user && (
                    <span className="text-xs font-medium text-slate-700 mr-2">{activity.user}</span>
                  )}
                  <span className="text-xs text-slate-500">{formatTimestamp(activity.timestamp)}</span>
                </div>
              </div>
              <button
                className="ml-2 px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded hover:bg-teal-200"
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
          className="w-full text-center py-2 text-sm text-teal-600 hover:text-teal-700 mt-2"
          onClick={handleViewMore}
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
                        {activity.user && (
                          <span className="text-xs font-medium text-slate-700 mr-2">{activity.user}</span>
                        )}
                        <span className="text-xs text-slate-500">{formatTimestamp(activity.timestamp)}</span>
                      </div>
                    </div>
                    <button
                      className="ml-2 px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded hover:bg-teal-200"
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

      {/* SAO Modal */}
      {isSAOModalOpen && editingSAO && (
        <SAOModal
          isOpen={isSAOModalOpen}
          onClose={() => { setIsSAOModalOpen(false); setEditingSAO(null); }}
          editSAO={editingSAO}
        />
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreview
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          documentId={previewDocument.id}
          documentTitle={previewDocument.title}
        />
      )}
    </>
  );
};

export default RecentActivities;