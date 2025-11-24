import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function TecnicosAgricolas() {

  const tecnicos = [
    {
      nombre: 'Luis Pérez',
      especialidad: 'Cultivo de maíz',
      correo: 'luis.perez@agricultura.com',
      telefono: '+505 12345678',
      ubicacion: 'Matagalpa, Nicaragua'
    },
    {
      nombre: 'Ana Gómez',
      especialidad: 'Cultivo de frijoles',
      correo: 'ana.gomez@hortalizas.com',
      telefono: '+505 87654321',
      ubicacion: 'Estelí, Nicaragua'
    },
    {
      nombre: 'Carlos Méndez',
      especialidad: 'Manejo integral de sorgo',
      correo: 'carlos.mendez@frutales.com',
      telefono: '+505 11223344',
      ubicacion: 'Jinotega, Nicaragua'
    },
    {
      nombre: 'María López',
      especialidad: 'Plagas y enfermedades del maíz',
      correo: 'maria.lopez@granos.com',
      telefono: '+505 55667788',
      ubicacion: 'Chinandega, Nicaragua'
    },
    {
      nombre: 'Pedro Ruiz',
      especialidad: 'Producción sostenible de frijoles',
      correo: 'pedro.ruiz@cacao.com',
      telefono: '+505 99887766',
      ubicacion: 'Nueva Guinea, Nicaragua'
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>🌾👨‍🌾 Técnicos Agrícolas</Text>
      {tecnicos.map((tecnico, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.sectionHeader}>🚜 Técnico #{index + 1}</Text>
          <Text>📝 Nombre: {tecnico.nombre}</Text>
          <Text>🌱 Especialidad: {tecnico.especialidad}</Text>
          <Text>📧 Correo: {tecnico.correo}</Text>
          <Text>📱 Teléfono: {tecnico.telefono}</Text>
          <Text>📍 Ubicación: {tecnico.ubicacion}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#E8F5E9' 
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2E7D32' 
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#66BB6A' 
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 18,
    color: '#388E3C'
  }
});
