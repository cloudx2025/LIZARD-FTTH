export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
        Relationships: [];
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
          coordenadas: Json | null;
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
          coordenadas?: Json | null;
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
          coordenadas?: Json | null;
          status?: string;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cabos_pop_destino_id_fkey";
            columns: ["pop_destino_id"];
            referencedRelation: "pops";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cabos_pop_origem_id_fkey";
            columns: ["pop_origem_id"];
            referencedRelation: "pops";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "ctos_cabo_id_fkey";
            columns: ["cabo_id"];
            referencedRelation: "cabos";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "fibras_cabo_id_fkey";
            columns: ["cabo_id"];
            referencedRelation: "cabos";
            referencedColumns: ["id"];
          }
        ];
      };
      cto_conexoes: {
        Row: {
          id: string;
          nome: string;
          cto_origem_id: string | null;
          cto_destino_id: string | null;
          cor: string;
          coordenadas: Json | null;
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
          coordenadas?: Json | null;
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
          coordenadas?: Json | null;
          status?: string;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cto_conexoes_cto_destino_id_fkey";
            columns: ["cto_destino_id"];
            referencedRelation: "ctos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cto_conexoes_cto_origem_id_fkey";
            columns: ["cto_origem_id"];
            referencedRelation: "ctos";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
