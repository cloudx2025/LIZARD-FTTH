import { useState, useEffect } from 'react';
import { Users, Shield, UserX, UserCheck, Edit2, UserPlus, X } from 'lucide-react';
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'user' as 'admin' | 'user' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
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

  const handleCreateUser = async () => {
    setCreateError('');
    setCreateSuccess('');

    if (!newUser.email || !newUser.password) {
      setCreateError('Email e senha são obrigatórios');
      return;
    }

    if (newUser.password.length < 6) {
      setCreateError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        data: {
          full_name: newUser.full_name
        }
      }
    });

    if (error) {
      setCreateError(error.message);
      return;
    }

    if (data.user) {
      await supabase
        .from('user_profiles')
        .update({ role: newUser.role, full_name: newUser.full_name })
        .eq('id', data.user.id);

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        user_email: user?.email || '',
        action: 'INSERT',
        table_name: 'user_profiles',
        record_id: data.user.id,
        record_name: newUser.email,
        new_data: { email: newUser.email, role: newUser.role, full_name: newUser.full_name }
      });

      setCreateSuccess(`Usuário ${newUser.email} criado com sucesso!`);
      setNewUser({ email: '', password: '', full_name: '', role: 'user' });
      setTimeout(() => {
        setShowCreateForm(false);
        setCreateSuccess('');
        loadUsers();
      }, 2000);
    }
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-slate-700" />
          <h2 className="text-xl font-bold text-slate-800">Gerenciamento de Usuários</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus className="w-4 h-4" />
          Criar Novo Usuário
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white border border-slate-300 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Criar Novo Usuário</h3>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setCreateError('');
                setCreateSuccess('');
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="usuario@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha *</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input
                type="text"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nome do usuário"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Papel</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          {createError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {createError}
            </div>
          )}

          {createSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {createSuccess}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCreateUser}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Criar Usuário
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setCreateError('');
                setNewUser({ email: '', password: '', full_name: '', role: 'user' });
              }}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
