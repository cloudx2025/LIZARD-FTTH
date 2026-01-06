import { useState } from 'react';
import { Settings, Users, FileText } from 'lucide-react';
import UserManagement from './admin/UserManagement';
import AuditLogs from './admin/AuditLogs';

type Tab = 'users' | 'logs';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Configurações do Sistema
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie usuários, visualize logs de auditoria e configure o sistema
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                Gerenciar Usuários
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
                Logs de Auditoria
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'logs' && <AuditLogs />}
          </div>
        </div>
      </div>
    </div>
  );
}
