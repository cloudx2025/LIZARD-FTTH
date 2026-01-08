import { useState } from 'react';
import { Settings, Users, FileText, Shield } from 'lucide-react';
import UserManagement from './admin/UserManagement';
import AuditLogs from './admin/AuditLogs';
import { SystemSettings } from './admin/SystemSettings';
import { SecurityLogs } from './admin/SecurityLogs';
import { usePermissions } from '../hooks/usePermissions';

type Tab = 'settings' | 'users' | 'logs' | 'security';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const { isAdmin, loading } = usePermissions();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-600">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-slate-600">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Administração do Sistema
          </h1>
          <p className="text-gray-600 mt-2">
            Configure o sistema, gerencie usuários e monitore segurança
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4" />
                Configurações
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                Usuários
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                Auditoria
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className="w-4 h-4" />
                Segurança
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'settings' && <SystemSettings />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'logs' && <AuditLogs />}
            {activeTab === 'security' && <SecurityLogs />}
          </div>
        </div>
      </div>
    </div>
  );
}
