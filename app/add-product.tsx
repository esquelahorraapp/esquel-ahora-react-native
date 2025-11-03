import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Package, Tag, Camera } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function AddProductScreen() {
  const { barcode } = useLocalSearchParams();
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [categoria, setCategoria] = useState('general');
  const [loading, setLoading] = useState(false);

  const categorias = [
    'general',
    'alimentos',
    'bebidas',
    'limpieza',
    'higiene',
    'mascotas',
    'electrodomesticos',
    'ropa',
    'otros'
  ];

  const handleAddProduct = async () => {
    if (!nombre || !marca) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (!barcode) {
      Alert.alert('Error', 'Código de barras no válido');
      return;
    }

    setLoading(true);
    try {
      // Check if product already exists
      const existingProductQuery = query(
        collection(db, 'products'),
        where('codigo_barras', '==', barcode as string)
      );
      
      const existingProductSnapshot = await getDocs(existingProductQuery);
      
      if (!existingProductSnapshot.empty) {
        Alert.alert('Error', 'Este código de barras ya existe en nuestra base de datos');
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), {
          codigo_barras: barcode as string,
          nombre,
          marca,
          categoria,
          usuario_creador_id: user?.uid,
          fecha_creacion: serverTimestamp(),
        });

        Alert.alert(
          'Producto agregado',
          '¡Gracias por contribuir! Has ganado 20 puntos.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );

        // Award points to user
        if (user?.uid) {
          await updateDoc(doc(db, 'users', user.uid), {
            puntos: increment(20)
          });
        }
      }
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'No se pudo agregar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Agregar Producto</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.barcodeSection}>
          <Text style={styles.barcodeLabel}>Código de barras:</Text>
          <Text style={styles.barcodeValue}>{barcode}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Package size={20} color={Colors.placeholder} />
            <TextInput
              style={styles.input}
              placeholder="Nombre del producto *"
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          <View style={styles.inputContainer}>
            <Tag size={20} color={Colors.placeholder} />
            <TextInput
              style={styles.input}
              placeholder="Marca *"
              value={marca}
              onChangeText={setMarca}
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          <View style={styles.categorySection}>
            <Text style={styles.categoryLabel}>Categoría:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    categoria === cat && styles.categoryChipSelected
                  ]}
                  onPress={() => setCategoria(cat)}
                >
                  <Text style={[
                    styles.categoryText,
                    categoria === cat && styles.categoryTextSelected
                  ]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.imageSection}>
            <Camera size={32} color={Colors.placeholder} />
            <Text style={styles.imageText}>Agregar foto (opcional)</Text>
            <Text style={styles.imageSubtext}>Toca para tomar una foto del producto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddProduct}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>
              {loading ? 'Agregando...' : 'Agregar Producto'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>💡 Consejos</Text>
          <Text style={styles.tip}>• Verifica que el nombre sea exacto</Text>
          <Text style={styles.tip}>• Incluye la marca completa</Text>
          <Text style={styles.tip}>• Selecciona la categoría más apropiada</Text>
          <Text style={styles.tip}>• Ganarás 20 puntos por agregar un producto</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  barcodeSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  barcodeLabel: {
    fontSize: 14,
    color: Colors.placeholder,
    marginBottom: 4,
  },
  barcodeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: 'monospace',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  imageSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  imageText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  imageSubtext: {
    fontSize: 14,
    color: Colors.placeholder,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  tips: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
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