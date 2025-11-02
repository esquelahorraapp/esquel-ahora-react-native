import React, { useState } from 'react';
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
import { Link, router } from 'expo-router';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nombre || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, nombre);
      if (error) {
        if (error.message.includes('already registered')) {
          Alert.alert('Error', 'Este email ya está registrado');
        } else {
          Alert.alert('Error', 'No se pudo crear la cuenta');
        }
      } else {
        Alert.alert(
          'Cuenta creada',
          'Tu cuenta ha sido creada exitosamente. ¡Bienvenido a Esquel Ahorra!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Ha ocurrido un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a la comunidad de ahorro</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.placeholder} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.placeholder} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.placeholder} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              placeholderTextColor={Colors.placeholder}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <EyeOff size={20} color={Colors.placeholder} />
              ) : (
                <Eye size={20} color={Colors.placeholder} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.placeholder} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton}>
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/(auth)/login" style={styles.link}>
              <Text style={styles.linkText}>Inicia sesión</Text>
            </Link>
          </Text>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  form: {
    marginBottom: 40,
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
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.placeholder,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  googleButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: Colors.text,
  },
  link: {
    color: Colors.primary,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});