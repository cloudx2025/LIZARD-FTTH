import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Cabo {
  id: string;
  nome: string;
}

interface Fibra {
  id: string;
  cabo_id: string | null;
  numero: number;
  cor: string;
  status: string;
  cliente: string | null;
}

const coresFibra = [
  { nome: 'Azul', valor: '#0000FF' },
  { nome: 'Laranja', valor: '#FF8800' },
  { nome: 'Verde', valor: '#00FF00' },
  { nome: 'Marrom', valor: '#8B4513' },
  { nome: 'Cinza', valor: '#808080' },
  { nome: 'Branco', valor: '#FFFFFF' },
  { nome: 'Vermelho', valor: '#FF0000' },
  { nome: 'Preto', valor: '#000000' },
  { nome: 'Amarelo', valor: '#FFFF00' },
  { nome: 'Violeta', valor: '#8B00FF' },
  { nome: 'Rosa', valor: '#FFC0CB' },
  { nome: 'Aqua', valor: '#00FFFF' }
];

export function FibraManager() {
  const [fibras, setFibras] = useState<Fibra[]>([]);
  const [cabos, setCabos] = useState<Cabo[]>([]);
  const [selectedCabo, setSelectedCabo] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    numero: '',
    cor: coresFibra[0].valor,
    status: 'livre',
    cliente: ''
  });

  useEffect(() => {
    loadCabos();
  }, []);

  useEffect(() => {
    if (selectedCabo) {
      loadFibras();
    }
  }, [selectedCabo]);

  const loadCabos = async () => {
    const { data } = await supabase.from('cabos').select('id, nome');
    if (data) setCabos(data);
  };

  const loadFibras = async () => {
    const { data } = await supabase
      .from('fibras')
      .select('*')
      .eq('cabo_id', selectedCabo)
      .order('numero', { ascending: true });

    if (data) setFibras(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCabo) {
      alert('Selecione um cabo primeiro');
      return;
    }

    const fibraData = {
      cabo_id: selectedCabo,
      numero: parseInt(formData.numero),
      cor: formData.cor,
      status: formData.status,
      cliente: formData.cliente || null
    };

    if (editingId) {
      await supabase.from('fibras').update(fibraData).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('fibras').insert([fibraData]).select();
    }

    setFormData({
      numero: '',
      cor: coresFibra[0].valor,
      status: 'livre',
      cliente: ''
    });
    setIsAdding(false);
    loadFibras();
  };

  const handleEdit = (fibra: Fibra) => {
    setFormData({
      numero: fibra.numero.toString(),
      cor: fibra.cor,
      status: fibra.status,
      cliente: fibra.cliente || ''
    });
    setEditingId(fibra.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir esta fibra?')) {
      await supabase.from('fibras').delete().eq('id', id);
      loadFibras();
    }
  };

  const handleCancel = () => {
    setFormData({
      numero: '',
      cor: coresFibra[0].valor,
      status: 'livre',
      cliente: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const getCorNome = (corValor: string) => {
    const cor = coresFibra.find(c => c.valor === corValor);
    return cor?.nome || 'Desconhecida';
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Selecione o Cabo</label>
        <select
          value={selectedCabo}
          onChange={(e) => setSelectedCabo(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Selecione um cabo</option>
          {cabos.map(cabo => (
            <option key={cabo.id} value={cabo.id}>{cabo.nome}</option>
          ))}
        </select>
      </div>

      {selectedCabo && (
        <>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Adicionar Fibra
          </button>

          {isAdding && (
            <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                <input
                  type="number"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cor</label>
                <select
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {coresFibra.map(cor => (
                    <option key={cor.valor} value={cor.valor}>{cor.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="livre">Livre</option>
                  <option value="em_uso">Em Uso</option>
                  <option value="reservada">Reservada</option>
                </select>
              </div>

              {formData.status === 'em_uso' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

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

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {fibras.map((fibra) => (
              <div key={fibra.id} className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-8 h-8 rounded border border-slate-300"
                      style={{ backgroundColor: fibra.cor }}
                    />
                    <div>
                      <h3 className="font-semibold text-slate-800">Fibra {fibra.numero}</h3>
                      <p className="text-xs text-slate-500">
                        {getCorNome(fibra.cor)} • {fibra.status}
                        {fibra.cliente && ` • ${fibra.cliente}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(fibra)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fibra.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {fibras.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                Nenhuma fibra cadastrada neste cabo
              </div>
            )}
          </div>
        </>
      )}

      {!selectedCabo && (
        <div className="text-center text-slate-500 py-8">
          Selecione um cabo para gerenciar suas fibras
        </div>
      )}
    </div>
  );
}
