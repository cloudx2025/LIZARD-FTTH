import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CTO {
  id: string;
  nome: string;
}

interface Conexao {
  id: string;
  cto_origem_id: string;
  cto_destino_id: string;
  fibras_usadas: number;
  ctos?: {
    origem: { nome: string };
    destino: { nome: string };
  };
}

export function FibraManager() {
  const [ctos, setCtos] = useState<CTO[]>([]);
  const [conexoes, setConexoes] = useState<Conexao[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    cto_origem_id: '',
    cto_destino_id: '',
    fibras_usadas: '1'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const ctosResult = await supabase.from('ctos').select('id, nome').order('nome');
    const conexoesResult = await supabase
      .from('cto_conexoes')
      .select(`
        id,
        cto_origem_id,
        cto_destino_id,
        fibras_usadas,
        origem:ctos!cto_conexoes_cto_origem_id_fkey(nome),
        destino:ctos!cto_conexoes_cto_destino_id_fkey(nome)
      `)
      .order('created_at', { ascending: false });

    if (ctosResult.data) setCtos(ctosResult.data);
    if (conexoesResult.data) setConexoes(conexoesResult.data as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const conexaoData = {
      cto_origem_id: formData.cto_origem_id,
      cto_destino_id: formData.cto_destino_id,
      fibras_usadas: parseInt(formData.fibras_usadas),
      created_by: user?.id
    };

    await supabase.from('cto_conexoes').insert([conexaoData]);

    setFormData({ cto_origem_id: '', cto_destino_id: '', fibras_usadas: '1' });
    setIsAdding(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir esta conexão?')) {
      await supabase.from('cto_conexoes').delete().eq('id', id);
      loadData();
    }
  };

  const handleCancel = () => {
    setFormData({ cto_origem_id: '', cto_destino_id: '', fibras_usadas: '1' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Adicionar Conexão
        </button>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CTO Origem</label>
            <select
              value={formData.cto_origem_id}
              onChange={(e) => setFormData({ ...formData, cto_origem_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Selecione...</option>
              {ctos.map((cto) => (
                <option key={cto.id} value={cto.id}>{cto.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CTO Destino</label>
            <select
              value={formData.cto_destino_id}
              onChange={(e) => setFormData({ ...formData, cto_destino_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Selecione...</option>
              {ctos.map((cto) => (
                <option key={cto.id} value={cto.id}>{cto.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fibras Usadas</label>
            <input
              type="number"
              value={formData.fibras_usadas}
              onChange={(e) => setFormData({ ...formData, fibras_usadas: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
              min="1"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Salvar
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
        {conexoes.map((conexao: any) => (
          <div key={conexao.id} className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{conexao.origem?.nome}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-medium text-slate-900">{conexao.destino?.nome}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {conexao.fibras_usadas} fibra(s) usada(s)
                </p>
              </div>
              <button
                onClick={() => handleDelete(conexao.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {conexoes.length === 0 && !isAdding && (
        <div className="text-center py-8 text-slate-500">
          Nenhuma conexão cadastrada
        </div>
      )}
    </div>
  );
}
