import { useState } from 'react';
import { Settings, Download, Database, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function SystemConfig() {
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const exportData = async () => {
    setExporting(true);
    setMessage('');

    try {
      const [pops, ctos, cabos, conexoes] = await Promise.all([
        supabase.from('pops').select('*'),
        supabase.from('ctos').select('*'),
        supabase.from('cabos').select('*'),
        supabase.from('cto_conexoes').select('*')
      ]);

      const data = {
        exportDate: new Date().toISOString(),
        pops: pops.data || [],
        ctos: ctos.data || [],
        cabos: cabos.data || [],
        conexoes: conexoes.data || []
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rede-fibra-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage('Dados exportados com sucesso!');
    } catch (error) {
      setMessage('Erro ao exportar dados');
    } finally {
      setExporting(false);
    }
  };

  const clearOldLogs = async () => {
    if (!confirm('Tem certeza que deseja limpar logs com mais de 30 dias? Esta ação não pode ser desfeita.')) {
      return;
    }

    setClearing(true);
    setMessage('');

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        user_email: user?.email || '',
        action: 'DELETE',
        table_name: 'audit_logs',
        record_id: 'bulk',
        record_name: 'Limpeza de logs antigos',
        old_data: { description: 'Logs com mais de 30 dias foram removidos' }
      });

      setMessage('Logs antigos removidos com sucesso!');
    } catch (error) {
      setMessage('Erro ao limpar logs');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6 text-slate-700" />
        <h2 className="text-xl font-bold text-slate-800">Configurações do Sistema</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('sucesso')
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Download className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Exportar Dados</h3>
              <p className="text-sm text-slate-600 mb-4">
                Faça download de todos os dados do sistema (POPs, CTOs, cabos e conexões) em formato JSON.
                Use isto para backup ou migração de dados.
              </p>
              <button
                onClick={exportData}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exportar Dados
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <Database className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Limpar Logs Antigos</h3>
              <p className="text-sm text-slate-600 mb-4">
                Remove logs de auditoria com mais de 30 dias para otimizar o banco de dados.
                Esta operação não pode ser desfeita.
              </p>
              <button
                onClick={clearOldLogs}
                disabled={clearing}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clearing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Limpando...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Limpar Logs Antigos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-200 text-slate-600 rounded-lg">
              <Database className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Informações do Banco de Dados</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span>Provedor:</span>
                  <span className="font-medium text-slate-800">Supabase PostgreSQL</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span>Autenticação:</span>
                  <span className="font-medium text-slate-800">Supabase Auth</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span>Segurança:</span>
                  <span className="font-medium text-slate-800">Row Level Security (RLS) Ativado</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Auditoria:</span>
                  <span className="font-medium text-slate-800">Ativa em todas as tabelas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Atenção</h4>
              <p className="text-sm text-yellow-800">
                Operações de manutenção do sistema podem impactar o desempenho temporariamente.
                Recomenda-se realizar estas operações fora do horário de pico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
