import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Filter, Download } from 'lucide-react';

interface AuditLog {
  id: string;
  table_name: string;
  operation: string;
  record_id: string;
  old_data: any;
  new_data: any;
  changed_by: string;
  changed_at: string;
  user_email?: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTable, setFilterTable] = useState<string>('all');
  const [filterOperation, setFilterOperation] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, [filterTable, filterOperation]);

  async function loadLogs() {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user_profiles!audit_logs_changed_by_fkey (email)
        `)
        .order('changed_at', { ascending: false })
        .limit(100);

      if (filterTable !== 'all') {
        query = query.eq('table_name', filterTable);
      }

      if (filterOperation !== 'all') {
        query = query.eq('operation', filterOperation);
      }

      const { data, error } = await query;

      if (error) throw error;

      const logsWithEmail = (data || []).map((log: any) => ({
        ...log,
        user_email: log.user_profiles?.email || 'Sistema',
      }));

      setLogs(logsWithEmail);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  }

  function getOperationBadge(operation: string) {
    const styles = {
      INSERT: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
    };
    return styles[operation as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  }

  function getTableDisplayName(tableName: string) {
    const names: Record<string, string> = {
      pop_cto: 'POPs/CTOs',
      cabos: 'Cabos',
      cto_conexoes: 'Conexões CTO',
      user_profiles: 'Usuários',
    };
    return names[tableName] || tableName;
  }

  function formatChanges(log: AuditLog) {
    if (log.operation === 'INSERT') {
      return 'Registro criado';
    }
    if (log.operation === 'DELETE') {
      return 'Registro excluído';
    }
    if (log.operation === 'UPDATE' && log.old_data && log.new_data) {
      const changes: string[] = [];
      Object.keys(log.new_data).forEach((key) => {
        if (log.old_data[key] !== log.new_data[key]) {
          changes.push(`${key}: ${log.old_data[key]} → ${log.new_data[key]}`);
        }
      });
      return changes.length > 0 ? changes.join(', ') : 'Sem alterações detectadas';
    }
    return 'Alteração';
  }

  async function exportLogs() {
    const csv = [
      ['Data/Hora', 'Usuário', 'Tabela', 'Operação', 'ID do Registro', 'Alterações'].join(','),
      ...logs.map((log) =>
        [
          new Date(log.changed_at).toLocaleString('pt-BR'),
          log.user_email,
          getTableDisplayName(log.table_name),
          log.operation,
          log.record_id,
          `"${formatChanges(log)}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  if (loading) {
    return <div className="text-center py-8">Carregando logs...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as tabelas</option>
            <option value="pop_cto">POPs/CTOs</option>
            <option value="cabos">Cabos</option>
            <option value="cto_conexoes">Conexões CTO</option>
            <option value="user_profiles">Usuários</option>
          </select>
        </div>

        <select
          value={filterOperation}
          onChange={(e) => setFilterOperation(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as operações</option>
          <option value="INSERT">Criação</option>
          <option value="UPDATE">Atualização</option>
          <option value="DELETE">Exclusão</option>
        </select>

        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-auto"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        Mostrando {logs.length} registros mais recentes
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tabela
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alterações
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detalhes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(log.changed_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.user_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getTableDisplayName(log.table_name)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getOperationBadge(
                      log.operation
                    )}`}
                  >
                    {log.operation}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                  {formatChanges(log)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum log encontrado com os filtros selecionados
        </div>
      )}

      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-auto">
            <h3 className="text-xl font-semibold mb-4">Detalhes do Log</h3>

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Data/Hora:</span>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedLog.changed_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Usuário:</span>
                  <p className="text-sm text-gray-900">{selectedLog.user_email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Tabela:</span>
                  <p className="text-sm text-gray-900">
                    {getTableDisplayName(selectedLog.table_name)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Operação:</span>
                  <p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getOperationBadge(
                        selectedLog.operation
                      )}`}
                    >
                      {selectedLog.operation}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {selectedLog.operation === 'UPDATE' && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dados Anteriores:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(selectedLog.old_data, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dados Novos:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(selectedLog.new_data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {selectedLog.operation === 'INSERT' && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Dados Criados:</h4>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(selectedLog.new_data, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.operation === 'DELETE' && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Dados Excluídos:</h4>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(selectedLog.old_data, null, 2)}
                </pre>
              </div>
            )}

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
