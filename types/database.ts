export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          nombre: string;
          email: string;
          rol: 'usuario' | 'supervisor' | 'admin';
          puntos: number;
          foto_perfil: string | null;
          fecha_registro: string;
        };
        Insert: {
          id: string;
          nombre: string;
          email: string;
          rol?: 'usuario' | 'supervisor' | 'admin';
          puntos?: number;
          foto_perfil?: string | null;
          fecha_registro?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          email?: string;
          rol?: 'usuario' | 'supervisor' | 'admin';
          puntos?: number;
          foto_perfil?: string | null;
          fecha_registro?: string;
        };
      };
      products: {
        Row: {
          id: string;
          codigo_barras: string;
          nombre: string;
          marca: string;
          categoria: string;
          imagen_url: string | null;
          fecha_creacion: string;
          usuario_creador_id: string | null;
        };
        Insert: {
          id?: string;
          codigo_barras: string;
          nombre: string;
          marca: string;
          categoria?: string;
          imagen_url?: string | null;
          fecha_creacion?: string;
          usuario_creador_id?: string | null;
        };
        Update: {
          id?: string;
          codigo_barras?: string;
          nombre?: string;
          marca?: string;
          categoria?: string;
          imagen_url?: string | null;
          fecha_creacion?: string;
          usuario_creador_id?: string | null;
        };
      };
      stores: {
        Row: {
          id: string;
          nombre: string;
          direccion: string;
          lat: number;
          lng: number;
          tipo: string;
          verificado: boolean;
          fecha_registro: string;
          usuario_creador_id: string | null;
        };
        Insert: {
          id?: string;
          nombre: string;
          direccion: string;
          lat: number;
          lng: number;
          tipo?: string;
          verificado?: boolean;
          fecha_registro?: string;
          usuario_creador_id?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          direccion?: string;
          lat?: number;
          lng?: number;
          tipo?: string;
          verificado?: boolean;
          fecha_registro?: string;
          usuario_creador_id?: string | null;
        };
      };
      prices: {
        Row: {
          id: string;
          producto_id: string | null;
          comercio_id: string | null;
          usuario_id: string | null;
          supervisor_id: string | null;
          precio: number;
          fecha_registro: string;
          verificado: boolean;
          estado: 'pendiente' | 'verificado' | 'rechazado';
        };
        Insert: {
          id?: string;
          producto_id?: string | null;
          comercio_id?: string | null;
          usuario_id?: string | null;
          supervisor_id?: string | null;
          precio: number;
          fecha_registro?: string;
          verificado?: boolean;
          estado?: 'pendiente' | 'verificado' | 'rechazado';
        };
        Update: {
          id?: string;
          producto_id?: string | null;
          comercio_id?: string | null;
          usuario_id?: string | null;
          supervisor_id?: string | null;
          precio?: number;
          fecha_registro?: string;
          verificado?: boolean;
          estado?: 'pendiente' | 'verificado' | 'rechazado';
        };
      };
      validations: {
        Row: {
          id: string;
          precio_id: string | null;
          supervisor_id: string | null;
          estado: 'aprobado' | 'rechazado';
          comentario: string | null;
          fecha_validacion: string;
        };
        Insert: {
          id?: string;
          precio_id?: string | null;
          supervisor_id?: string | null;
          estado: 'aprobado' | 'rechazado';
          comentario?: string | null;
          fecha_validacion?: string;
        };
        Update: {
          id?: string;
          precio_id?: string | null;
          supervisor_id?: string | null;
          estado?: 'aprobado' | 'rechazado';
          comentario?: string | null;
          fecha_validacion?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'usuario' | 'supervisor' | 'admin';
      price_estado: 'pendiente' | 'verificado' | 'rechazado';
      validation_estado: 'aprobado' | 'rechazado';
    };
  };
};