import { useState, useEffect } from 'react';
import { Users, Shield, UserX, UserCheck, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
}

export function UserManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    checkAdminStatus();
    loadUsers();
  }, []);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    setIsAdmin(data?.role === 'admin');
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setUsers(data);
  };

  const handleUpdateUser = async (userId: string, updates: Partial<UserProfile>) => {
    await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);

    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      user_email: user?.email || '',
      action: 'UPDATE',
      table_name: 'user_profiles',
      record_id: userId,
      record_name: users.find(u => u.id === userId)?.email || '',
      new_data: updates
    });

    loadUsers();
    setEditingUser(null);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await handleUpdateUser(userId, { is_active: !currentStatus });
  };

  const toggleUserRole = async (userId: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await handleUpdateUser(userId, { role: newRole });
  };

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <Shield className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
        <p className="text-yellow-800 font-medium">Acesso Restrito</p>
        <p className="text-yellow-600 text-sm">Apenas administradores podem gerenciar usuários.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-slate-700" />
        <h2 className="text-xl font-bold text-slate-800">Gerenciamento de Usuários</h2>
      </div>

      <div className="bg-slate-50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-200">
            <tr>
              <th className="text-left p-3 text-sm font-semibold text-slate-700">Email</th>
              <th className="text-left p-3 text-sm font-semibold text-slate-700">Nome</th>
              <th className="text-left p-3 text-sm font-semibold text-slate-700">Papel</th>
              <th className="text-left p-3 text-sm font-semibold text-slate-700">Status</th>
              <th className="text-left p-3 text-sm font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-200">
                <td className="p-3 text-sm text-slate-800">{u.email}</td>
                <td className="p-3 text-sm text-slate-600">
                  {editingUser?.id === u.id ? (
                    <input
                      type="text"
                      value={editingUser.full_name}
                      onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                      className="px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                  ) : (
                    u.full_name || '-'
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleUserRole(u.id, u.role)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    } transition`}
                  >
                    {u.role === 'admin' ? 'Admin' : 'Usuário'}
                  </button>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleUserStatus(u.id, u.is_active)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      u.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    } transition`}
                  >
                    {u.is_active ? (
                      <>
                        <UserCheck className="w-3 h-3" /> Ativo
                      </>
                    ) : (
                      <>
                        <UserX className="w-3 h-3" /> Inativo
                      </>
                    )}
                  </button>
                </td>
                <td className="p-3">
                  {editingUser?.id === u.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateUser(u.id, { full_name: editingUser.full_name })}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="px-3 py-1 bg-slate-300 text-slate-700 text-xs rounded hover:bg-slate-400 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingUser(u)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          Nenhum usuário encontrado
        </div>
      )}
    </div>
  );
}
