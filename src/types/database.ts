export interface Database {
  public: {
    Tables: {
      pops: {
        Row: {
          id: string;
          nome: string;
          latitude: number;
          longitude: number;
          endereco: string;
          descricao: string | null;
          icone: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          latitude: number;
          longitude: number;
          endereco: string;
          descricao?: string | null;
          icone?: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          latitude?: number;
          longitude?: number;
          endereco?: string;
          descricao?: string | null;
          icone?: string;
          created_at?: string;
          created_by?: string | null;
        };
      };
      cabos: {
        Row: {
          id: string;
          nome: string;
          pop_origem_id: string | null;
          pop_destino_id: string | null;
          cor: string;
          tipo: string;
          capacidade: number;
          coordenadas: any;
          status: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          pop_origem_id?: string | null;
          pop_destino_id?: string | null;
          cor?: string;
          tipo?: string;
          capacidade?: number;
          coordenadas?: any;
          status?: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          pop_origem_id?: string | null;
          pop_destino_id?: string | null;
          cor?: string;
          tipo?: string;
          capacidade?: number;
          coordenadas?: any;
          status?: string;
          created_at?: string;
          created_by?: string | null;
        };
      };
      ctos: {
        Row: {
          id: string;
          nome: string;
          latitude: number;
          longitude: number;
          cabo_id: string | null;
          capacidade: number;
          endereco: string | null;
          status: string;
          icone: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          latitude: number;
          longitude: number;
          cabo_id?: string | null;
          capacidade?: number;
          endereco?: string | null;
          status?: string;
          icone?: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          latitude?: number;
          longitude?: number;
          cabo_id?: string | null;
          capacidade?: number;
          endereco?: string | null;
          status?: string;
          icone?: string;
          created_at?: string;
          created_by?: string | null;
        };
      };
      fibras: {
        Row: {
          id: string;
          cabo_id: string | null;
          numero: number;
          cor: string;
          status: string;
          cliente: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cabo_id?: string | null;
          numero: number;
          cor: string;
          status?: string;
          cliente?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cabo_id?: string | null;
          numero?: number;
          cor?: string;
          status?: string;
          cliente?: string | null;
          created_at?: string;
        };
      };
      cto_conexoes: {
        Row: {
          id: string;
          nome: string;
          cto_origem_id: string | null;
          cto_destino_id: string | null;
          cor: string;
          coordenadas: any;
          status: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          cto_origem_id?: string | null;
          cto_destino_id?: string | null;
          cor?: string;
          coordenadas?: any;
          status?: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          cto_origem_id?: string | null;
          cto_destino_id?: string | null;
          cor?: string;
          coordenadas?: any;
          status?: string;
          created_at?: string;
          created_by?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'user';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: 'admin' | 'user';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'user';
          is_active?: boolean;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_email: string;
          action: 'INSERT' | 'UPDATE' | 'DELETE';
          table_name: string;
          record_id: string;
          record_name: string;
          old_data: any;
          new_data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_email: string;
          action: 'INSERT' | 'UPDATE' | 'DELETE';
          table_name: string;
          record_id: string;
          record_name?: string;
          old_data?: any;
          new_data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_email?: string;
          action?: 'INSERT' | 'UPDATE' | 'DELETE';
          table_name?: string;
          record_id?: string;
          record_name?: string;
          old_data?: any;
          new_data?: any;
        };
      };
    };
  };
}
