export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  rol: 'usuario' | 'supervisor' | 'admin';
  puntos: number;
  foto_perfil?: string;
  fecha_registro: Date;
}

export interface Product {
  id: string;
  codigo_barras: string;
  nombre: string;
  marca: string;
  categoria: string;
  imagen_url?: string;
  fecha_creacion: Date;
  usuario_creador_id?: string;
}

export interface Store {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  tipo: string;
  verificado: boolean;
  fecha_registro: Date;
  usuario_creador_id?: string;
}

export interface Price {
  id: string;
  producto_id?: string;
  comercio_id?: string;
  usuario_id?: string;
  supervisor_id?: string;
  precio: number;
  fecha_registro: Date;
  verificado: boolean;
  estado: 'pendiente' | 'verificado' | 'rechazado';
}

export interface Validation {
  id: string;
  precio_id?: string;
  supervisor_id?: string;
  estado: 'aprobado' | 'rechazado';
  comentario?: string;
  fecha_validacion: Date;
}

export interface ProductWithPrice extends Product {
  lowest_price?: number;
  store_name?: string;
  distance?: string;
}

export interface PendingPrice extends Price {
  product?: Product;
  store?: Store;
  user?: UserProfile;
}