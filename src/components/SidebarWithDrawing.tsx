import { useState } from 'react';
import { MapPin, Cable, Box, Wifi, LogOut, X, GitBranch, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PopForm } from './forms/PopForm';
import { CaboForm } from './forms/CaboForm';
import { CtoForm } from './forms/CtoForm';
import { FibraManager } from './forms/FibraManager';
import { CtoConexaoForm } from './forms/CtoConexaoForm';

type ActiveForm = 'pop' | 'cabo' | 'cto' | 'cto_conexao' | 'fibra' | null;

interface SidebarProps {
  isDrawingRoute: boolean;
  onStopDrawing: () => void;
  onNavigate: (view: 'map' | 'settings') => void;
  currentView: 'map' | 'settings';
}

export function SidebarWithDrawing({ isDrawingRoute, onStopDrawing, onNavigate, currentView }: SidebarProps) {
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const { signOut, userRole } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      <div className="w-20 bg-slate-900 flex flex-col items-center py-6 space-y-6">
        <div className="text-white font-bold text-xl">LF</div>

        <div className="flex-1 flex flex-col space-y-4">
          <button
            onClick={() => setActiveForm(activeForm === 'pop' ? null : 'pop')}
            className={`p-3 rounded-lg transition ${
              activeForm === 'pop'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Gerenciar POPs"
            disabled={isDrawingRoute}
          >
            <MapPin className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveForm(activeForm === 'cabo' ? null : 'cabo')}
            className={`p-3 rounded-lg transition ${
              activeForm === 'cabo'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Gerenciar Cabos"
            disabled={isDrawingRoute}
          >
            <Cable className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveForm(activeForm === 'cto' ? null : 'cto')}
            className={`p-3 rounded-lg transition ${
              activeForm === 'cto'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Gerenciar CTOs"
            disabled={isDrawingRoute}
          >
            <Box className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveForm(activeForm === 'cto_conexao' ? null : 'cto_conexao')}
            className={`p-3 rounded-lg transition ${
              activeForm === 'cto_conexao'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Conexões CTO"
            disabled={isDrawingRoute}
          >
            <GitBranch className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveForm(activeForm === 'fibra' ? null : 'fibra')}
            className={`p-3 rounded-lg transition ${
              activeForm === 'fibra'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Gerenciar Fibras"
            disabled={isDrawingRoute}
          >
            <Wifi className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {userRole === 'admin' && (
            <button
              onClick={() => {
                setActiveForm(null);
                onNavigate(currentView === 'settings' ? 'map' : 'settings');
              }}
              className={`p-3 rounded-lg transition ${
                currentView === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Configurações"
              disabled={isDrawingRoute}
            >
              <Settings className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-3 rounded-lg text-slate-400 hover:bg-red-600 hover:text-white transition"
            title="Sair"
            disabled={isDrawingRoute}
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {activeForm && (
        <div className="w-96 bg-white shadow-xl overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-semibold text-slate-800">
              {activeForm === 'pop' && 'Gerenciar POPs'}
              {activeForm === 'cabo' && 'Gerenciar Cabos'}
              {activeForm === 'cto' && 'Gerenciar CTOs'}
              {activeForm === 'cto_conexao' && 'Conexões entre CTOs'}
              {activeForm === 'fibra' && 'Gerenciar Fibras'}
            </h2>
            <button
              onClick={() => setActiveForm(null)}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              disabled={isDrawingRoute}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {activeForm === 'pop' && <PopForm />}
            {activeForm === 'cabo' && <CaboForm />}
            {activeForm === 'cto' && <CtoForm />}
            {activeForm === 'cto_conexao' && <CtoConexaoForm />}
            {activeForm === 'fibra' && <FibraManager />}
          </div>

          {isDrawingRoute && (
            <div className="fixed bottom-4 left-24 right-4 bg-red-600 text-white p-4 rounded-lg shadow-xl flex items-center justify-between z-[1001]">
              <span>Modo de desenho ativo - Clique no mapa para adicionar pontos</span>
              <button
                onClick={onStopDrawing}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-slate-100 transition"
              >
                Finalizar Desenho
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
