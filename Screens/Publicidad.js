import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

const productos = [
  {
    id: '1',
    titulo: 'Sorgo Rojo',
    precio: 'C$400',
    descripcion: 'Semillas de alta calidad',
    vendedor: 'Juan Aguilar',
    telefono: '82342960',
    departamento: 'Juigalpa-Chontales',
    imagen: require('../assets/1.png'),
  },
  {
    id: '2',
    titulo: 'Maíz Amarillo',
    precio: 'C$500',
    descripcion: 'Semillas de alta calidad',
    vendedor: 'Mario Jarquin',
    telefono: '82342960',
    departamento: 'Juigalpa-Chontales',
    imagen: require('../assets/2.png'),
  },
  {
    id: '3',
    titulo: 'Frijoles Rojos',
    precio: 'C$2500',
    descripcion: 'Semillas de alta calidad',
    vendedor: 'Juana Méndez',
    telefono: '82342960',
    departamento: 'Juigalpa-Chontales',
    imagen: require('../assets/3.png'),
  },
  {
    id: '4',
    titulo: 'Sorgo Blanco',
    precio: 'C$300',
    descripcion: 'Semillas de alta calidad',
    vendedor: 'Martín Sandobal',
    telefono: '75782323',
    departamento: 'Chontales - Juigalpa',
    imagen: require('../assets/4.png'),
  },
  {
    id: '5',
    titulo: 'Maíz Blanco',
    precio: 'C$450',
    descripcion: 'Semillas de alta calidad',
    vendedor: 'Antonio Gonzales',
    telefono: '88253456',
    departamento: 'Chontales - Juigalpa',
    imagen: require('../assets/5.png'),
  },
  {
    id: '6',
    titulo: 'Frijoles Negros',
    precio: 'C$2000',
    descripcion: 'Semillas de alta calidad',
    vendedor: 'José Rodríguez',
    telefono: '89002345',
    departamento: 'Chontales - Juigalpa',
    imagen: require('../assets/6.png'),
  },
];

export default function Publicidad() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📢 Publicidad</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.imagen} style={styles.image} />
            <Text style={styles.productTitle}>{item.titulo}</Text>
            <Text>{item.precio}</Text>
            <Text style={styles.description}>{item.descripcion}</Text>
            <Text>Contacto: {item.vendedor}</Text>
            <Text>Tel: {item.telefono}</Text>
            <Text>{item.departamento}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FCE6',
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    flex: 1,
    margin: 8,
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
  },
  productTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    fontStyle: 'italic',
    color: '#555',
  },
});
