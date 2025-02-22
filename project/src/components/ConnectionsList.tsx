// ConnectionsList.tsx
import { useState, useEffect, ReactNode } from 'react';
import { MessageCircle, UserCheck, UserX } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Connection {
  partner_profile_image: string;
  partner_full_name: string | undefined;
  partner_expertise: ReactNode;
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles: {
    full_name: string;
    profile_image: string;
    expertise: string;
  }[];
}

interface ConnectionsListProps {
  currentUserId: string;
  isStudent: boolean;
  onSelectConnection: (connectionId: string) => void;
}

export default function ConnectionsList({ currentUserId, isStudent, onSelectConnection }: ConnectionsListProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        const partnerJoin = isStudent
          ? 'profiles!connections_mentor_id_fk(full_name,profile_image,expertise)'
          : 'profiles!connections_student_id_fk(full_name,profile_image,expertise)';
        const filterColumn = isStudent ? 'student_id' : 'mentor_id';
  
        const { data, error } = await supabase
          .from('connections')
          .select(`id,status,created_at,${partnerJoin}`)
          .eq(filterColumn, currentUserId)
          .order('created_at', { ascending: false });
  
        if (error) throw error;
        setConnections(data.map((connection: any) => ({
          ...connection,
          profiles: connection.profiles[0]
        })) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load connections');
      } finally {
        setLoading(false);
      }
    };
  
    fetchConnections();
  }, [currentUserId, isStudent]);
  

  if (loading) return <div className="text-center py-8">Loading connections...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (connections.length === 0) return <div className="text-center py-8">No connections found</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold">Your Connections</h2>
      </div>
      <div className="divide-y">
        {connections.map((connection) => (
          <div key={connection.id} className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={connection.partner_profile_image || '/default-avatar.png'}
                  alt={connection.partner_full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {/* Optionally, add an online indicator if available */}
              </div>
              <div>
                <h3 className="font-medium">{connection.partner_full_name}</h3>
                <p className="text-sm text-gray-500">{connection.partner_expertise}</p>
                <p className="text-xs text-gray-400">Last active {new Date(connection.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {connection.status === 'accepted' ? (
                <button
                  onClick={() => onSelectConnection(connection.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>
              ) : (
                <>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <UserCheck className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <UserX className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
