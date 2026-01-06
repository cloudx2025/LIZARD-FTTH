import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Map } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { logInsert, logUpdate, logDelete } from '../../lib/auditLogger';

interface CTO {
  id: string;
  nome: string;
}

interface CtoConexao {
  id: string;
  nome: string;
  cto_origem_id: string | null;
  cto_destino_id: string | null;
  cor: string;
  status: string;
  coordenadas: any;
}

interface CtoConexaoFormProps {
  onDrawRoute: (conexaoId: string | null, color: string, existingRoute?: [number, number][]) => void;
}

export function CtoConexaoForm({ onDrawRoute }: CtoConexaoFormProps) {
  const [conexoes, setConexoes] = useState<CtoConexao[]>([]);
  const [ctos, setCtos] = useState<CTO[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nome: '',
    cto_origem_id: '',
    cto_destino_id: '',
    cor: '#FF6600',
    status: 'ativo'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [conexoesResult, ctosResult] = await Promise.all([
      supabase.from('cto_conexoes').select('*').order('created_at', { ascending: false }),
      supabase.from('ctos').select('id, nome')
    ]);

    if (conexoesResult.data) setConexoes(conexoesResult.data);
    if (ctosResult.data) setCtos(ctosResult.data);
  };

  const handleDrawRoute = () => {
    const existingRoute = routeCoords || undefined;
    onDrawRoute(editingId, formData.cor, existingRoute);
  };

  const handleRouteComplete = (coordinates: [number, number][]) => {
    setRouteCoords(coordinates);
  };

  (window as any).handleCtoRouteComplete = handleRouteComplete;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const conexaoData = {
      nome: formData.nome,
      cto_origem_id: formData.cto_origem_id || null,
      cto_destino_id: formData.cto_destino_id || null,
      cor: formData.cor,
      coordenadas: routeCoords ? JSON.stringify(routeCoords) : null,
      status: formData.status,
      created_by: user?.id
    };

    if (editingId) {
      const oldConexao = conexoes.find(c => c.id === editingId);
      await supabase.from('cto_conexoes').update(conexaoData).eq('id', editingId);
      await logUpdate(user?.id, user?.email, 'cto_conexoes', editingId, formData.nome, oldConexao, conexaoData);
      setEditingId(null);
    } else {
      const { data } = await supabase.from('cto_conexoes').insert([conexaoData]).select();
      if (data && data[0]) {
        await logInsert(user?.id, user?.email, 'cto_conexoes', data[0].id, formData.nome, conexaoData);
      }
    }

    setFormData({
      nome: '',
      cto_origem_id: '',
      cto_destino_id: '',
      cor: '#FF6600',
      status: 'ativo'
    });
    setRouteCoords(null);
    setIsAdding(false);
    loadData();
    window.location.reload();
  };

  const handleEdit = (conexao: CtoConexao) => {
    setFormData({
      nome: conexao.nome,
      cto_origem_id: conexao.cto_origem_id || '',
      cto_destino_id: conexao.cto_destino_id || '',
      cor: conexao.cor,
      status: conexao.status
    });

    if (conexao.coordenadas) {
      try {
        const coords = typeof conexao.coordenadas === 'string'
          ? JSON.parse(conexao.coordenadas)
          : conexao.coordenadas;
        setRouteCoords(coords);
      } catch (e) {
        setRouteCoords(null);
      }
    }

    setEditingId(conexao.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir esta conexão?')) {
      const conexao = conexoes.find(c => c.id === id);
      await supabase.from('cto_conexoes').delete().eq('id', id);
      if (conexao) {
        await logDelete(user?.id, user?.email, 'cto_conexoes', id, conexao.nome, conexao);
      }
      loadData();
      window.location.reload();
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: '',
      cto_origem_id: '',
      cto_destino_id: '',
      cor: '#FF6600',
      status: 'ativo'
    });
    setRouteCoords(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const getCtoName = (ctoId: string | null) => {
    if (!ctoId) return 'Não definido';
    const cto = ctos.find(c => c.id === ctoId);
    return cto?.nome || 'Desconhecido';
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
      >
        <Plus className="w-5 h-5" />
        Adicionar Conexão CTO
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CTO Origem</label>
            <select
              value={formData.cto_origem_id}
              onChange={(e) => setFormData({ ...formData, cto_origem_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="">Selecione uma CTO</option>
              {ctos.map(cto => (
                <option key={cto.id} value={cto.id}>{cto.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CTO Destino</label>
            <select
              value={formData.cto_destino_id}
              onChange={(e) => setFormData({ ...formData, cto_destino_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="">Selecione uma CTO</option>
              {ctos.map(cto => (
                <option key={cto.id} value={cto.id}>{cto.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cor</label>
              <input
                type="color"
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                className="w-full h-10 border border-slate-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDrawRoute}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Map className="w-5 h-5" />
            {routeCoords ? 'Redesenhar Rota no Mapa' : 'Desenhar Rota no Mapa'}
          </button>

          {routeCoords && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
              Rota definida com {routeCoords.length} pontos
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition"
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
        {conexoes.map((conexao) => (
          <div key={conexao.id} className="bg-slate-50 p-3 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-slate-300"
                    style={{ backgroundColor: conexao.cor }}
                  />
                  <h3 className="font-semibold text-slate-800">{conexao.nome}</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {getCtoName(conexao.cto_origem_id)} → {getCtoName(conexao.cto_destino_id)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {conexao.status}
                  {conexao.coordenadas && ' • Rota personalizada'}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(conexao)}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(conexao.id)}
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
