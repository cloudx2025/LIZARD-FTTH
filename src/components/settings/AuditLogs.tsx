import { useState, useEffect } from 'react';
import { FileText, Shield, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AuditLog {
  id: string;
  user_email: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  record_name: string;
  old_data: any;
  new_data: any;
  created_at: string;
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterTable, setFilterTable] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    checkAdminStatus();
    loadLogs();
  }, []);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    setIsAdmin(data?.role === 'admin');
  };

  const loadLogs = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setLogs(data);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-700';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-700';
      case 'DELETE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTableDisplayName = (tableName: string) => {
    const names: Record<string, string> = {
      pops: 'POP',
      ctos: 'CTO',
      cabos: 'Cabo',
      cto_conexoes: 'Conexão CTO',
      user_profiles: 'Perfil de Usuário'
    };
    return names[tableName] || tableName;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    if (filterTable !== 'all' && log.table_name !== filterTable) return false;
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    return true;
  });

  const uniqueTables = Array.from(new Set(logs.map(log => log.table_name)));

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <Shield className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
        <p className="text-yellow-800 font-medium">Acesso Restrito</p>
        <p className="text-yellow-600 text-sm">Apenas administradores podem visualizar logs de auditoria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-slate-700" />
          <h2 className="text-xl font-bold text-slate-800">Logs de Auditoria</h2>
        </div>
      </div>

      <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg">
        <Filter className="w-5 h-5 text-slate-600" />
        <select
          value={filterTable}
          onChange={(e) => setFilterTable(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">Todas as Tabelas</option>
          {uniqueTables.map(table => (
            <option key={table} value={table}>{getTableDisplayName(table)}</option>
          ))}
        </select>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">Todas as Ações</option>
          <option value="INSERT">Criação</option>
          <option value="UPDATE">Atualização</option>
          <option value="DELETE">Exclusão</option>
        </select>

        <span className="text-sm text-slate-600">
          {filteredLogs.length} registro(s)
        </span>
      </div>

      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div key={log.id} className="bg-slate-50 rounded-lg overflow-hidden">
            <div
              className="p-4 hover:bg-slate-100 transition cursor-pointer"
              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action === 'INSERT' ? 'Criação' : log.action === 'UPDATE' ? 'Atualização' : 'Exclusão'}
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {getTableDisplayName(log.table_name)}
                    </span>
                    {log.record_name && (
                      <span className="text-sm text-slate-600">
                        - {log.record_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Por: {log.user_email}</span>
                    <span>{formatDate(log.created_at)}</span>
                  </div>
                </div>
                {expandedLog === log.id ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>

            {expandedLog === log.id && (
              <div className="border-t border-slate-200 p-4 bg-white">
                <div className="grid grid-cols-2 gap-4">
                  {log.old_data && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Dados Anteriores:</h4>
                      <pre className="bg-slate-50 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.old_data, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.new_data && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Dados Novos:</h4>
                      <pre className="bg-slate-50 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.new_data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          Nenhum log encontrado
        </div>
      )}
    </div>
  );
}
