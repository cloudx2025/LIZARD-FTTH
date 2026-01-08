import { useState, useEffect } from 'react';
import { Shield, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LoginAttempt {
  id: string;
  user_id: string | null;
  email: string;
  success: boolean;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export function SecurityLogs() {
  const [logs, setLogs] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('login_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filter !== 'all') {
      query = query.eq('success', filter === 'success');
    }

    const { data } = await query;
    if (data) setLogs(data);
    setLoading(false);
  };

  const handleExportLogs = () => {
    const csv = [
      ['Data/Hora', 'Email', 'Status', 'IP', 'User Agent'].join(','),
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.email,
        log.success ? 'Sucesso' : 'Falha',
        log.ip_address,
        log.user_agent
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Logs de Segurança</h2>
        </div>
        <button
          onClick={handleExportLogs}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-lg transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('success')}
          className={`px-3 py-1.5 text-sm rounded-lg transition ${
            filter === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Sucessos
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-3 py-1.5 text-sm rounded-lg transition ${
            filter === 'failed'
              ? 'bg-red-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Falhas
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Carregando...</div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Navegador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">{log.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.success
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.success ? 'Sucesso' : 'Falha'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{log.ip_address || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate" title={log.user_agent}>
                      {log.user_agent || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logs.length === 0 && (
            <div className="text-center py-8 text-slate-500">Nenhum log encontrado</div>
          )}
        </div>
      )}
    </div>
  );
}
