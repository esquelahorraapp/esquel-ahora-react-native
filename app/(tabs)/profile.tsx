import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { 
  User, 
  Settings, 
  LogOut, 
  Award, 
  Star,
  MapPin,
  Package
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return Colors.error;
      case 'supervisor':
        return Colors.secondary;
      default:
        return Colors.primary;
    }
  };

  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'supervisor':
        return 'Supervisor';
      default:
        return 'Usuario';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <User size={60} color={Colors.white} />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.nombre || 'Usuario'}</Text>
            <Text style={styles.email}>{profile?.email}</Text>
            
            <View 
              style={[
                styles.roleBadge, 
                { backgroundColor: getRoleBadgeColor(profile?.rol || 'usuario') }
              ]}
            >
              <Text style={styles.roleText}>
                {getRoleLabel(profile?.rol || 'usuario')}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Award size={32} color={Colors.secondary} />
              <Text style={styles.statValue}>{profile?.puntos || 0}</Text>
              <Text style={styles.statLabel}>Puntos</Text>
            </View>
            
            <View style={styles.statCard}>
              <Star size={32} color={Colors.primary} />
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Contribuciones</Text>
            </View>
            
            <View style={styles.statCard}>
              <Package size={32} color={Colors.primary} />
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Productos</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Logros</Text>
          
          <View style={styles.achievement}>
            <View style={styles.achievementIcon}>
              <Star size={24} color={Colors.secondary} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>Primer Escaneo</Text>
              <Text style={styles.achievementDesc}>Realizaste tu primer escaneo de producto</Text>
            </View>
          </View>
          
          <View style={styles.achievement}>
            <View style={[styles.achievementIcon, styles.achievementLocked]}>
              <Award size={24} color={Colors.placeholder} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitleLocked}>Colaborador Activo</Text>
              <Text style={styles.achievementDesc}>Agrega 10 precios verificados</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Settings size={24} color={Colors.text} />
            <Text style={styles.menuText}>Configuración</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <MapPin size={24} color={Colors.text} />
            <Text style={styles.menuText}>Ubicación</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.placeholder,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.placeholder,
  },
  achievementsSection: {
    marginBottom: 20,
  },
  achievement: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  achievementTitleLocked: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.placeholder,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: Colors.placeholder,
  },
  menuSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  signOutText: {
    fontSize: 16,
    color: Colors.error,
    marginLeft: 8,
    fontWeight: '600',
  },
});