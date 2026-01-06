import { useState } from 'react';
import { Settings as SettingsIcon, Users, FileText, Info, BarChart3, Cog } from 'lucide-react';
import { UserManager } from './settings/UserManager';
import { AuditLogs } from './settings/AuditLogs';
import { Statistics } from './settings/Statistics';
import { SystemConfig } from './settings/SystemConfig';

type SettingsTab = 'users' | 'logs' | 'statistics' | 'config' | 'about';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');

  const tabs = [
    { id: 'users' as SettingsTab, label: 'Usuários', icon: Users },
    { id: 'logs' as SettingsTab, label: 'Logs de Auditoria', icon: FileText },
    { id: 'statistics' as SettingsTab, label: 'Estatísticas', icon: BarChart3 },
    { id: 'config' as SettingsTab, label: 'Configurações', icon: Cog },
    { id: 'about' as SettingsTab, label: 'Sobre o Sistema', icon: Info }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-slate-300 text-sm">Gerencie usuários, visualize logs e configurações do sistema</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 bg-slate-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'logs' && <AuditLogs />}
        {activeTab === 'statistics' && <Statistics />}
        {activeTab === 'config' && <SystemConfig />}
        {activeTab === 'about' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Sobre o Sistema</h2>
              <div className="space-y-3 text-slate-600">
                <p>
                  Sistema de Gerenciamento de Rede de Fibra Óptica - uma plataforma completa para
                  gerenciar POPs, CTOs, cabos e conexões da sua infraestrutura de rede.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-1">Versão</h3>
                    <p className="text-sm text-slate-600">1.0.0</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-1">Banco de Dados</h3>
                    <p className="text-sm text-slate-600">Supabase PostgreSQL</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-1">Framework</h3>
                    <p className="text-sm text-slate-600">React + TypeScript</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-1">Mapas</h3>
                    <p className="text-sm text-slate-600">Leaflet + OpenStreetMap</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Recursos Principais</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Gerenciamento de POPs e CTOs no mapa interativo</li>
                <li>• Desenho de rotas de cabos entre pontos</li>
                <li>• Sistema de conexões entre CTOs</li>
                <li>• Controle de usuários e permissões</li>
                <li>• Logs de auditoria completos</li>
                <li>• Ícones personalizáveis no mapa</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
