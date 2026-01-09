import { useState } from 'react';
import { MapPin, Cable, Box, Wifi, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PopForm } from './forms/PopForm';
import { CaboForm } from './forms/CaboForm';
import { CtoForm } from './forms/CtoForm';
import { FibraManager } from './forms/FibraManager';

type ActiveForm = 'pop' | 'cabo' | 'cto' | 'fibra' | null;

export function Sidebar() {
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const { signOut } = useAuth();

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
          >
            <Box className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveForm(activeForm === 'fibra' ? null : 'fibra')}
            className={`p-3 rounded-lg transition ${
              activeForm === 'fibra'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Gerenciar Fibras"
          >
            <Wifi className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="p-3 rounded-lg text-slate-400 hover:bg-red-600 hover:text-white transition"
            title="Sair"
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
              {activeForm === 'fibra' && 'Gerenciar Fibras'}
            </h2>
            <button
              onClick={() => setActiveForm(null)}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {activeForm === 'pop' && <PopForm />}
            {activeForm === 'cabo' && <CaboForm />}
            {activeForm === 'cto' && <CtoForm />}
            {activeForm === 'fibra' && <FibraManager />}
          </div>
        </div>
      )}
    </>
  );
}
