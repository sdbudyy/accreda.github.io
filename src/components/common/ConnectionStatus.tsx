import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { sendSupervisorRequestNotification } from '../../utils/notifications';

interface ConnectionStatusProps {
  userType: 'eit' | 'supervisor';
}

interface EitProfile {
  id: string;
  full_name: string;
  email: string;
}

interface SupervisorProfile {
  id: string;
  full_name: string;
  email: string;
  organization: string;
}

interface Connection {
  id: string;
  status: string;
  eit_profiles: EitProfile | null;
  supervisor_profiles: SupervisorProfile | null;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ userType }) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('supervisor_eit_relationships')
        .select(`
          id,
          status,
          eit_profiles (
            id,
            full_name,
            email
          ),
          supervisor_profiles (
            id,
            full_name,
            email,
            organization
          )
        `)
        .eq(userType === 'eit' ? 'eit_id' : 'supervisor_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      setConnections(data as unknown as Connection[] || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('supervisor_eit_relationships')
        .update({ 
          status: 'completed',
          end_date: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (error) throw error;

      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      toast.success('Connection cancelled successfully');
    } catch (error) {
      console.error('Error cancelling connection:', error);
      toast.error('Failed to cancel connection');
    }
  };

  const handleRequestConnection = async (supervisorEmail: string) => {
    try {
      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: eitProfile, error: eitError } = await supabase
        .from('eit_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (eitError) throw eitError;

      // Get supervisor's profile
      const { data: supervisorProfile, error: supervisorError } = await supabase
        .from('supervisor_profiles')
        .select('id, full_name')
        .eq('email', supervisorEmail)
        .single();

      if (supervisorError) throw supervisorError;

      // Create connection request
      const { error: connectionError } = await supabase
        .from('supervisor_eit_relationships')
        .insert({
          eit_id: user.id,
          supervisor_id: supervisorProfile.id,
          status: 'pending',
          start_date: new Date().toISOString()
        });

      if (connectionError) throw connectionError;

      // Send notification to supervisor
      await sendSupervisorRequestNotification(supervisorProfile.id, eitProfile.full_name);

      toast.success('Connection request sent successfully');
    } catch (error) {
      console.error('Error requesting connection:', error);
      toast.error('Failed to send connection request');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading connections...</div>;
  }

  if (connections.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No active connections found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => (
        <div
          key={connection.id}
          className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
        >
          <div>
            {userType === 'eit' ? (
              <div>
                <h3 className="font-semibold">{connection.supervisor_profiles?.full_name}</h3>
                <p className="text-sm text-gray-600">{connection.supervisor_profiles?.email}</p>
                <p className="text-sm text-gray-500">{connection.supervisor_profiles?.organization}</p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold">{connection.eit_profiles?.full_name}</h3>
                <p className="text-sm text-gray-600">{connection.eit_profiles?.email}</p>
              </div>
            )}
          </div>
          <button
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            onClick={() => handleCancelConnection(connection.id)}
          >
            Cancel Connection
          </button>
        </div>
      ))}
    </div>
  );
};

export default ConnectionStatus; 