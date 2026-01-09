import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { iconTypes } from '../../lib/mapIcons';

interface POP {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  endereco: string;
  descricao: string | null;
  icone: string;
}

export function PopForm() {
  const [pops, setPops] = useState<POP[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nome: '',
    latitude: '',
    longitude: '',
    endereco: '',
    descricao: '',
    icone: 'datacenter'
  });

  useEffect(() => {
    loadPops();
  }, []);

  const loadPops = async () => {
    const { data } = await supabase
      .from('pops')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPops(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const popData = {
      nome: formData.nome,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      endereco: formData.endereco,
      descricao: formData.descricao || null,
      icone: formData.icone,
      created_by: user?.id
    };

    if (editingId) {
      await supabase
        .from('pops')
        .update(popData)
        .eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('pops').insert([popData]);
    }

    setFormData({ nome: '', latitude: '', longitude: '', endereco: '', descricao: '', icone: 'datacenter' });
    setIsAdding(false);
    loadPops();
    window.location.reload();
  };

  const handleEdit = (pop: POP) => {
    setFormData({
      nome: pop.nome,
      latitude: pop.latitude.toString(),
      longitude: pop.longitude.toString(),
      endereco: pop.endereco,
      descricao: pop.descricao || '',
      icone: pop.icone || 'datacenter'
    });
    setEditingId(pop.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este POP?')) {
      await supabase.from('pops').delete().eq('id', id);
      loadPops();
      window.location.reload();
    }
  };

  const handleCancel = () => {
    setFormData({ nome: '', latitude: '', longitude: '', endereco: '', descricao: '', icone: 'datacenter' });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
      >
        <Plus className="w-5 h-5" />
        Adicionar POP
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={2}
            />
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
                      ? 'border-blue-600 bg-blue-50'
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
        {pops.map((pop) => (
          <div key={pop.id} className="bg-slate-50 p-3 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{pop.nome}</h3>
                <p className="text-sm text-slate-600">{pop.endereco}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {pop.latitude}, {pop.longitude}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(pop)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(pop.id)}
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
