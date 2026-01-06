import { useState, useEffect } from 'react';
import { BarChart3, Database, Users, Activity, MapPin, Network } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalPops: number;
  totalCtos: number;
  totalCabos: number;
  totalConexoes: number;
  totalAuditLogs: number;
  recentActivity: number;
}

export function Statistics() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPops: 0,
    totalCtos: 0,
    totalCabos: 0,
    totalConexoes: 0,
    totalAuditLogs: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);

    const [users, pops, ctos, cabos, conexoes, logs, recentLogs] = await Promise.all([
      supabase.from('user_profiles').select('id, is_active', { count: 'exact' }),
      supabase.from('pops').select('id', { count: 'exact' }),
      supabase.from('ctos').select('id', { count: 'exact' }),
      supabase.from('cabos').select('id', { count: 'exact' }),
      supabase.from('cto_conexoes').select('id', { count: 'exact' }),
      supabase.from('audit_logs').select('id', { count: 'exact' }),
      supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);

    setStats({
      totalUsers: users.count || 0,
      activeUsers: users.data?.filter(u => u.is_active).length || 0,
      totalPops: pops.count || 0,
      totalCtos: ctos.count || 0,
      totalCabos: cabos.count || 0,
      totalConexoes: conexoes.count || 0,
      totalAuditLogs: logs.count || 0,
      recentActivity: recentLogs.count || 0
    });

    setLoading(false);
  };

  const StatCard = ({ icon: Icon, title, value, color }: { icon: any, title: string, value: number, color: string }) => (
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-slate-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-slate-700" />
        <h2 className="text-xl font-bold text-slate-800">Estatísticas do Sistema</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total de Usuários"
          value={stats.totalUsers}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={Users}
          title="Usuários Ativos"
          value={stats.activeUsers}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={MapPin}
          title="POPs Cadastrados"
          value={stats.totalPops}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          icon={Network}
          title="CTOs Cadastrados"
          value={stats.totalCtos}
          color="bg-cyan-100 text-cyan-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Activity}
          title="Cabos de Rede"
          value={stats.totalCabos}
          color="bg-slate-100 text-slate-600"
        />
        <StatCard
          icon={Network}
          title="Conexões CTO"
          value={stats.totalConexoes}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          icon={Database}
          title="Logs de Auditoria"
          value={stats.totalAuditLogs}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-800">Atividade Recente</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Ações nas últimas 24 horas</span>
            <span className="text-2xl font-bold text-blue-600">{stats.recentActivity}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${Math.min((stats.recentActivity / stats.totalAuditLogs) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Resumo do Sistema</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Sistema de gerenciamento de rede de fibra óptica totalmente operacional</li>
          <li>• {stats.totalUsers} usuário(s) registrado(s), {stats.activeUsers} ativo(s)</li>
          <li>• {stats.totalPops} POP(s) e {stats.totalCtos} CTO(s) mapeados</li>
          <li>• {stats.totalCabos} cabo(s) de rede e {stats.totalConexoes} conexão(ões) entre CTOs</li>
          <li>• Auditoria completa com {stats.totalAuditLogs} registro(s) de ações</li>
        </ul>
      </div>
    </div>
  );
}
