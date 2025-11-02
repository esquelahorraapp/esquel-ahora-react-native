import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Search, MapPin, TrendingDown } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/types/database';

type Product = Database['public']['Tables']['products']['Row'];
type Price = Database['public']['Tables']['prices']['Row'];
type Store = Database['public']['Tables']['stores']['Row'];

interface ProductWithPrice extends Product {
  lowest_price?: number;
  store_name?: string;
  distance?: string;
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithPrice[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          prices!inner(
            precio,
            stores(nombre)
          )
        `)
        .eq('prices.verificado', true)
        .limit(5);

      if (error) throw error;

      const productsWithPrices = data?.map((product: any) => {
        const prices = product.prices || [];
        const lowestPrice = Math.min(...prices.map((p: any) => p.precio));
        const lowestPriceStore = prices.find((p: any) => p.precio === lowestPrice);

        return {
          ...product,
          lowest_price: lowestPrice,
          store_name: lowestPriceStore?.stores?.nombre,
          prices: undefined,
        };
      }) || [];

      setFeaturedProducts(productsWithPrices);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Por favor ingresa un término de búsqueda');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          prices!inner(
            precio,
            stores(nombre)
          )
        `)
        .or(`nombre.ilike.%${searchQuery}%,marca.ilike.%${searchQuery}%,codigo_barras.eq.${searchQuery}`)
        .eq('prices.verificado', true);

      if (error) throw error;

      const productsWithPrices = data?.map((product: any) => {
        const prices = product.prices || [];
        const lowestPrice = Math.min(...prices.map((p: any) => p.precio));
        const lowestPriceStore = prices.find((p: any) => p.precio === lowestPrice);

        return {
          ...product,
          lowest_price: lowestPrice,
          store_name: lowestPriceStore?.stores?.nombre,
          prices: undefined,
        };
      }) || [];

      setProducts(productsWithPrices);
    } catch (error) {
      console.error('Error searching products:', error);
      Alert.alert('Error', 'No se pudieron buscar los productos');
    } finally {
      setLoading(false);
    }
  };

  const ProductCard = ({ product }: { product: ProductWithPrice }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.nombre}</Text>
        <Text style={styles.productBrand}>{product.marca}</Text>
        <Text style={styles.productCategory}>{product.categoria}</Text>
      </View>
      <View style={styles.priceInfo}>
        {product.lowest_price && (
          <>
            <Text style={styles.price}>${product.lowest_price}</Text>
            <Text style={styles.storeName}>{product.store_name}</Text>
          </>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Esquel Ahorra</Text>
        <Text style={styles.subtitle}>
          ¡Hola {profile?.nombre || 'Usuario'}! 👋
        </Text>
        <Text style={styles.points}>Puntos: {profile?.puntos || 0}</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.placeholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.placeholder}
          />
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={searchProducts}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {products.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resultados de búsqueda</Text>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.featuredHeader}>
              <TrendingDown size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Mejores ofertas</Text>
            </View>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        )}

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>💡 Consejos para ahorrar</Text>
          <Text style={styles.tip}>• Escanea productos para comparar precios</Text>
          <Text style={styles.tip}>• Contribuye con precios para ganar puntos</Text>
          <Text style={styles.tip}>• Verifica las ofertas más cercanas a ti</Text>
        </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  points: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  searchSection: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  storeName: {
    fontSize: 12,
    color: Colors.placeholder,
    marginTop: 2,
  },
  tips: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
});