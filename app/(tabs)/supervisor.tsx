import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Check, X, Clock, Eye } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/types/database';

type Price = Database['public']['Tables']['prices']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Store = Database['public']['Tables']['stores']['Row'];
type User = Database['public']['Tables']['users']['Row'];

interface PendingPrice extends Price {
  products?: Product;
  stores?: Store;
  users?: User;
}

export default function SupervisorScreen() {
  const { profile } = useAuth();
  const [pendingPrices, setPendingPrices] = useState<PendingPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.rol === 'supervisor' || profile?.rol === 'admin') {
      fetchPendingPrices();
    }
  }, [profile]);

  const fetchPendingPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('prices')
        .select(`
          *,
          products(nombre, marca, categoria),
          stores(nombre, direccion),
          users(nombre, email)
        `)
        .eq('estado', 'pendiente')
        .order('fecha_registro', { ascending: false });

      if (error) throw error;
      setPendingPrices(data || []);
    } catch (error) {
      console.error('Error fetching pending prices:', error);
      Alert.alert('Error', 'No se pudieron cargar los precios pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePrice = async (priceId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'verificado' : 'rechazado';
      
      // Update price status
      const { error: priceError } = await supabase
        .from('prices')
        .update({
          estado: newStatus,
          verificado: action === 'approve',
          supervisor_id: profile?.id,
        })
        .eq('id', priceId);

      if (priceError) throw priceError;

      // Create validation record
      const { error: validationError } = await supabase
        .from('validations')
        .insert({
          precio_id: priceId,
          supervisor_id: profile?.id,
          estado: action === 'approve' ? 'aprobado' : 'rechazado',
        });

      if (validationError) throw validationError;

      // Award points to user if approved
      if (action === 'approve') {
        const price = pendingPrices.find(p => p.id === priceId);
        if (price?.usuario_id) {
          await supabase
            .from('users')
            .update({ puntos: supabase.sql`puntos + 10` })
            .eq('id', price.usuario_id);
        }
      }

      Alert.alert(
        'Éxito',
        `Precio ${action === 'approve' ? 'aprobado' : 'rechazado'} correctamente`
      );

      // Refresh list
      fetchPendingPrices();
    } catch (error) {
      console.error('Error validating price:', error);
      Alert.alert('Error', 'No se pudo procesar la validación');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (profile?.rol !== 'supervisor' && profile?.rol !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedText}>
            No tienes permisos para acceder a esta sección
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel Supervisor</Text>
        <Text style={styles.subtitle}>
          {pendingPrices.length} precios pendientes de validación
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : pendingPrices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Check size={48} color={Colors.primary} />
            <Text style={styles.emptyText}>
              ¡Excelente! No hay precios pendientes de validación
            </Text>
          </View>
        ) : (
          pendingPrices.map((price) => (
            <View key={price.id} style={styles.priceCard}>
              <View style={styles.priceHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {price.products?.nombre || 'Producto desconocido'}
                  </Text>
                  <Text style={styles.productBrand}>
                    {price.products?.marca} • {price.products?.categoria}
                  </Text>
                </View>
                <Text style={styles.price}>${price.precio}</Text>
              </View>

              <View style={styles.priceDetails}>
                <Text style={styles.detailText}>
                  📍 {price.stores?.nombre || 'Comercio desconocido'}
                </Text>
                <Text style={styles.detailText}>
                  👤 {price.users?.nombre || 'Usuario desconocido'}
                </Text>
                <Text style={styles.detailText}>
                  📅 {formatDate(price.fecha_registro)}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleValidatePrice(price.id, 'approve')}
                >
                  <Check size={20} color={Colors.white} />
                  <Text style={styles.actionButtonText}>Aprobar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleValidatePrice(price.id, 'reject')}
                >
                  <X size={20} color={Colors.white} />
                  <Text style={styles.actionButtonText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.placeholder,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  priceCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: Colors.placeholder,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  priceDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: Colors.primary,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unauthorizedText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
});