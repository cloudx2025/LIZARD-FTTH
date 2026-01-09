import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { iconTypes } from '../../lib/mapIcons';

interface Cabo {
  id: string;
  nome: string;
}

interface CTO {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  cabo_id: string | null;
  capacidade: number;
  endereco: string | null;
  status: string;
  icone: string;
}

export function CtoForm() {
  const [ctos, setCtos] = useState<CTO[]>([]);
  const [cabos, setCabos] = useState<Cabo[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nome: '',
    latitude: '',
    longitude: '',
    cabo_id: '',
    capacidade: '8',
    endereco: '',
    status: 'ativo',
    icone: 'datacenter'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [ctosResult, cabosResult] = await Promise.all([
      supabase.from('ctos').select('*').order('created_at', { ascending: false }),
      supabase.from('cabos').select('id, nome')
    ]);

    if (ctosResult.data) setCtos(ctosResult.data);
    if (cabosResult.data) setCabos(cabosResult.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ctoData = {
      nome: formData.nome,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      cabo_id: formData.cabo_id || null,
      capacidade: parseInt(formData.capacidade),
      endereco: formData.endereco || null,
      status: formData.status,
      icone: formData.icone,
      created_by: user?.id
    };

    if (editingId) {
      await supabase.from('ctos').update(ctoData).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('ctos').insert([ctoData]);
    }

    setFormData({
      nome: '',
      latitude: '',
      longitude: '',
      cabo_id: '',
      capacidade: '8',
      endereco: '',
      status: 'ativo',
      icone: 'datacenter'
    });
    setIsAdding(false);
    loadData();
    window.location.reload();
  };

  const handleEdit = (cto: CTO) => {
    setFormData({
      nome: cto.nome,
      latitude: cto.latitude.toString(),
      longitude: cto.longitude.toString(),
      cabo_id: cto.cabo_id || '',
      capacidade: cto.capacidade.toString(),
      endereco: cto.endereco || '',
      status: cto.status,
      icone: cto.icone || 'datacenter'
    });
    setEditingId(cto.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir esta CTO?')) {
      await supabase.from('ctos').delete().eq('id', id);
      loadData();
      window.location.reload();
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: '',
      latitude: '',
      longitude: '',
      cabo_id: '',
      capacidade: '8',
      endereco: '',
      status: 'ativo',
      icone: 'datacenter'
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const getCaboName = (caboId: string | null) => {
    if (!caboId) return 'Não definido';
    const cabo = cabos.find(c => c.id === caboId);
    return cabo?.nome || 'Desconhecido';
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
      >
        <Plus className="w-5 h-5" />
        Adicionar CTO
      </button>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cabo</label>
            <select
              value={formData.cabo_id}
              onChange={(e) => setFormData({ ...formData, cabo_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Selecione um cabo</option>
              {cabos.map(cabo => (
                <option key={cabo.id} value={cabo.id}>{cabo.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Capacidade</label>
              <input
                type="number"
                value={formData.capacidade}
                onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Ícone no Mapa</label>
            <div className="grid grid-cols-2 gap-2">
              {iconTypes.map((icon) => (
                <button
                  key={icon.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, icone: icon.value })}
                  className={`p-3 border-2 rounded-lg transition flex flex-col items-center gap-1 ${
                    formData.icone === icon.value
                      ? 'border-red-600 bg-red-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span className="text-xs font-medium text-slate-700">{icon.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 py-2 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {ctos.map((cto) => (
          <div key={cto.id} className="bg-slate-50 p-3 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{cto.nome}</h3>
                {cto.endereco && <p className="text-sm text-slate-600">{cto.endereco}</p>}
                <p className="text-xs text-slate-500 mt-1">
                  Cabo: {getCaboName(cto.cabo_id)} • {cto.capacidade} portas • {cto.status}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(cto)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cto.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
