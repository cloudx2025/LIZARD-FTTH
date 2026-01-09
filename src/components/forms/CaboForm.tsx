import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Map, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRouteDrawing } from '../../contexts/RouteDrawingContext';
import { logInsert, logUpdate, logDelete } from '../../lib/auditLogger';

interface Cabo {
  id: string;
  nome: string;
  tipo: string;
  capacidade: number;
  comprimento: number | null;
  descricao: string | null;
  coordenadas: [number, number][] | null;
}

export function CaboForm() {
  const [cabos, setCabos] = useState<Cabo[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { isDrawing, currentRoute, startDrawing, stopDrawing, setRoute, clearRoute } = useRouteDrawing();

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'fibra_optica',
    capacidade: '24',
    comprimento: '',
    descricao: ''
  });

  useEffect(() => {
    loadCabos();
  }, []);

  const loadCabos = async () => {
    const { data } = await supabase
      .from('cabos')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setCabos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDrawing) {
      stopDrawing();
    }

    const caboData = {
      nome: formData.nome,
      tipo: formData.tipo,
      capacidade: parseInt(formData.capacidade),
      comprimento: formData.comprimento ? parseFloat(formData.comprimento) : null,
      descricao: formData.descricao || null,
      coordenadas: currentRoute.length > 0 ? currentRoute : null,
      created_by: user?.id
    };

    if (editingId) {
      const oldCabo = cabos.find(c => c.id === editingId);
      await supabase.from('cabos').update(caboData).eq('id', editingId);
      await logUpdate(user?.id, user?.email, 'cabos', editingId, formData.nome, oldCabo, caboData);
      setEditingId(null);
    } else {
      const { data } = await supabase.from('cabos').insert([caboData]).select();
      if (data && data[0]) {
        await logInsert(user?.id, user?.email, 'cabos', data[0].id, formData.nome, caboData);
      }
    }

    setFormData({ nome: '', tipo: 'fibra_optica', capacidade: '24', comprimento: '', descricao: '' });
    clearRoute();
    setIsAdding(false);
    loadCabos();
  };

  const handleEdit = (cabo: Cabo) => {
    setFormData({
      nome: cabo.nome,
      tipo: cabo.tipo,
      capacidade: cabo.capacidade.toString(),
      comprimento: cabo.comprimento?.toString() || '',
      descricao: cabo.descricao || ''
    });
    setRoute(cabo.coordenadas || []);
    setEditingId(cabo.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este cabo?')) {
      const cabo = cabos.find(c => c.id === id);
      await supabase.from('cabos').delete().eq('id', id);
      if (cabo) {
        await logDelete(user?.id, user?.email, 'cabos', id, cabo.nome, cabo);
      }
      loadCabos();
    }
  };

  const handleCancel = () => {
    setFormData({ nome: '', tipo: 'fibra_optica', capacidade: '24', comprimento: '', descricao: '' });
    clearRoute();
    if (isDrawing) {
      stopDrawing();
    }
    setIsAdding(false);
    setEditingId(null);
  };

  const handleToggleDrawing = () => {
    if (isDrawing) {
      stopDrawing();
    } else {
      startDrawing(currentRoute);
    }
  };

  return (
    <div className="space-y-4">
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Adicionar Cabo
        </button>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="fibra_optica">Fibra Óptica</option>
              <option value="coaxial">Coaxial</option>
              <option value="par_trancado">Par Trançado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Capacidade (fibras)</label>
            <input
              type="number"
              value={formData.capacidade}
              onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Comprimento (metros)</label>
            <input
              type="number"
              value={formData.comprimento}
              onChange={(e) => setFormData({ ...formData, comprimento: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              step="0.01"
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Rota no Mapa</label>
            <button
              type="button"
              onClick={handleToggleDrawing}
              className={`w-full px-4 py-3 border-2 rounded-lg transition flex items-center justify-center gap-2 ${
                isDrawing
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-700'
              }`}
            >
              {isDrawing ? (
                <>
                  <MapPin className="w-5 h-5" />
                  <span>Desenhando rota... ({currentRoute.length} pontos)</span>
                </>
              ) : (
                <>
                  <Map className="w-5 h-5 text-blue-600" />
                  <span>
                    {currentRoute.length > 0
                      ? `Rota definida (${currentRoute.length} pontos) - Clique para editar`
                      : 'Desenhar rota no mapa principal'}
                  </span>
                </>
              )}
            </button>
            {currentRoute.length > 0 && !isDrawing && (
              <button
                type="button"
                onClick={clearRoute}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                Limpar rota
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {cabos.map((cabo) => (
          <div key={cabo.id} className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">{cabo.nome}</h3>
                <p className="text-sm text-slate-600">
                  {cabo.tipo.replace('_', ' ')} • {cabo.capacidade} fibras
                  {cabo.comprimento && ` • ${cabo.comprimento}m`}
                </p>
                {cabo.coordenadas && cabo.coordenadas.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Map className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-600">Rota no mapa ({cabo.coordenadas.length} pontos)</span>
                  </div>
                )}
                {cabo.descricao && (
                  <p className="text-xs text-slate-500 mt-1">{cabo.descricao}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(cabo)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cabo.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cabos.length === 0 && !isAdding && (
        <div className="text-center py-8 text-slate-500">
          Nenhum cabo cadastrado
        </div>
      )}
    </div>
  );
}
