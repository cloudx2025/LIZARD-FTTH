import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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
}

export function CtoConexaoForm() {
  const [conexoes, setConexoes] = useState<CtoConexao[]>([]);
  const [ctos, setCtos] = useState<CTO[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const conexaoData = {
      nome: formData.nome,
      cto_origem_id: formData.cto_origem_id || null,
      cto_destino_id: formData.cto_destino_id || null,
      cor: formData.cor,
      status: formData.status,
      created_by: user?.id
    };

    if (editingId) {
      await supabase.from('cto_conexoes').update(conexaoData).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('cto_conexoes').insert([conexaoData]).select();
    }

    setFormData({
      nome: '',
      cto_origem_id: '',
      cto_destino_id: '',
      cor: '#FF6600',
      status: 'ativo'
    });
    setIsAdding(false);
    loadData();
    window.dispatchEvent(new Event('cto-conexoes-updated'));
  };

  const handleEdit = (conexao: CtoConexao) => {
    setFormData({
      nome: conexao.nome,
      cto_origem_id: conexao.cto_origem_id || '',
      cto_destino_id: conexao.cto_destino_id || '',
      cor: conexao.cor,
      status: conexao.status
    });

    setEditingId(conexao.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir esta conexão?')) {
      await supabase.from('cto_conexoes').delete().eq('id', id);
      loadData();
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
