import { useState, useEffect } from 'react';
import { Palette, Download, Upload, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function SystemSettings() {
  const [popColor, setPopColor] = useState('#10B981');
  const [ctoColor, setCtoColor] = useState('#F59E0B');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data: settings } = await supabase
      .from('system_settings')
      .select('*')
      .in('key', ['pop_color', 'cto_color']);

    if (settings) {
      settings.forEach(setting => {
        if (setting.key === 'pop_color') setPopColor(setting.value as string);
        if (setting.key === 'cto_color') setCtoColor(setting.value as string);
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase
        .from('system_settings')
        .update({ value: popColor, updated_by: user?.id })
        .eq('key', 'pop_color');

      await supabase
        .from('system_settings')
        .update({ value: ctoColor, updated_by: user?.id })
        .eq('key', 'cto_color');

      alert('Configurações salvas com sucesso!');
      window.location.reload();
    } catch (error) {
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleExportConfig = async () => {
    const { data: settings } = await supabase
      .from('system_settings')
      .select('*');

    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('*');

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings,
      profiles
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const backup = JSON.parse(text);

      if (confirm('Deseja restaurar as configurações? Isso irá sobrescrever as configurações atuais.')) {
        if (backup.settings) {
          for (const setting of backup.settings) {
            await supabase
              .from('system_settings')
              .upsert({
                key: setting.key,
                value: setting.value,
                description: setting.description,
                updated_by: user?.id
              });
          }
        }
        alert('Configurações restauradas com sucesso!');
        loadSettings();
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Configurações do Sistema</h2>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-slate-600" />
          <h3 className="font-medium text-slate-900">Cores dos Ícones</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cor dos POPs (Datacenter)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={popColor}
                onChange={(e) => setPopColor(e.target.value)}
                className="w-20 h-10 rounded border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                value={popColor}
                onChange={(e) => setPopColor(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg flex-1 max-w-xs"
                placeholder="#10B981"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cor dos CTOs (Pin)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={ctoColor}
                onChange={(e) => setCtoColor(e.target.value)}
                className="w-20 h-10 rounded border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                value={ctoColor}
                onChange={(e) => setCtoColor(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg flex-1 max-w-xs"
                placeholder="#F59E0B"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Cores'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-4">Backup e Restore</h3>

        <div className="space-y-3">
          <button
            onClick={handleExportConfig}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition w-full justify-center"
          >
            <Download className="w-4 h-4" />
            Exportar Configurações
          </button>

          <button
            onClick={handleImportConfig}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition w-full justify-center"
          >
            <Upload className="w-4 h-4" />
            Importar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
