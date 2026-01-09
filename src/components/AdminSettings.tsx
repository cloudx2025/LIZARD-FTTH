import { useState, useEffect } from 'react';
import { Settings, Palette, Map } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminSettings() {
  const [popColor, setPopColor] = useState('#10B981');
  const [ctoColor, setCtoColor] = useState('#F59E0B');
  const [cableColor, setCableColor] = useState('#3B82F6');
  const [satelliteUrl, setSatelliteUrl] = useState('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data: popColorData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'pop_color')
      .maybeSingle();

    const { data: ctoColorData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'cto_color')
      .maybeSingle();

    const { data: cableColorData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'cable_color')
      .maybeSingle();

    const { data: satelliteData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'satellite_url')
      .maybeSingle();

    if (popColorData?.value) setPopColor(popColorData.value as string);
    if (ctoColorData?.value) setCtoColor(ctoColorData.value as string);
    if (cableColorData?.value) setCableColor(cableColorData.value as string);
    if (satelliteData?.value) setSatelliteUrl(satelliteData.value as string);
  };

  const saveSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('system_settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await Promise.all([
        saveSetting('pop_color', popColor),
        saveSetting('cto_color', ctoColor),
        saveSetting('cable_color', cableColor),
        saveSetting('satellite_url', satelliteUrl),
      ]);

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });

      window.dispatchEvent(new Event('settings-updated'));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-slate-700" />
            <h1 className="text-3xl font-bold text-slate-800">Configurações do Sistema</h1>
          </div>
          <p className="text-slate-600">Personalize as cores e configurações do mapa</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-slate-700" />
              <h2 className="text-xl font-semibold text-slate-800">Cores do Mapa</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cor dos POPs
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={popColor}
                    onChange={(e) => setPopColor(e.target.value)}
                    className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={popColor}
                    onChange={(e) => setPopColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#10B981"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cor dos CTOs
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={ctoColor}
                    onChange={(e) => setCtoColor(e.target.value)}
                    className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={ctoColor}
                    onChange={(e) => setCtoColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#F59E0B"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cor dos Cabos
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={cableColor}
                    onChange={(e) => setCableColor(e.target.value)}
                    className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={cableColor}
                    onChange={(e) => setCableColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Map className="w-5 h-5 text-slate-700" />
              <h2 className="text-xl font-semibold text-slate-800">Camada Satélite</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL do Tile Server
              </label>
              <input
                type="text"
                value={satelliteUrl}
                onChange={(e) => setSatelliteUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <p className="mt-2 text-sm text-slate-500">
                Use {'{z}'}, {'{y}'}, {'{x}'} como placeholders para zoom e coordenadas
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
