// Screens/InfoCultivos.js
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

// 🔹 Imágenes locales
import MaizImg from '../assets/imag/Maiz.png';
import FrijolesImg from '../assets/imag/frijoles.png';
import SorgoImg from '../assets/imag/Sorgo.png';

const cultivos = [
  {
    id: '1',
    nombre: 'Maíz 🌽',
    imagen: MaizImg,
    
    origen: 'Domesticado hace más de 9,000 años en Mesoamérica (actual México y Centroamérica).',
    plagas: 'Gusano cogollero, pulgones, trips y barrenadores del tallo.',
    condiciones: 'Prefiere climas cálidos y suelos bien drenados con buena humedad.',
    cosecha: 'Entre 90 y 120 días después de la siembra, dependiendo de la variedad.',
    curiosidades:
      'El maíz es la base de la alimentación de millones de personas en América Latina y también se usa como forraje y biocombustible.',
  },
  {
    id: '2',
    nombre: 'Frijoles 🫘',
    imagen: FrijolesImg,
    
    origen: 'Originarios de América, cultivados desde hace unos 7,000 años en la región andina y Mesoamérica.',
    plagas: 'Pulgones, mosca blanca, trips y escarabajos del frijol.',
    condiciones: 'Crecen mejor en climas templados, con suelos fértiles y bien aireados.',
    cosecha: 'Entre 70 y 90 días tras la siembra, dependiendo del tipo y variedad.',
    curiosidades:
      'Los frijoles son una fuente rica en proteínas, hierro y fibra, siendo un alimento esencial en la dieta nicaragüense.',
  },
  {
    id: '3',
    nombre: 'Sorgo 🌾',
    imagen: SorgoImg,
   
    origen: 'Originario del noreste de África hace unos 5,000 años. Se expandió a Asia y América con el comercio.',
    plagas: 'Pulgones del sorgo, gusano cogollero y chinches.',
    condiciones: 'Tolera bien la sequía y se adapta a climas cálidos y semiáridos.',
    cosecha: 'Generalmente se cosecha entre 100 y 130 días después de la siembra.',
    curiosidades:
      'El sorgo se usa para consumo humano, alimentación animal y producción de bebidas fermentadas.',
  },
];

export default function InfoCultivos() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Enciclopedia Agrícola</Text>

      {cultivos.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Image source={item.imagen} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.fecha}>{item.fecha}</Text>
            </View>
          </View>

          {/* Sección informativa */}
          <View style={styles.infoSection}>
            <Text style={styles.label}>🌱 Origen:</Text>
            <Text style={styles.texto}>{item.origen}</Text>

            <Text style={styles.label}>🐛 Plagas comunes:</Text>
            <Text style={styles.texto}>{item.plagas}</Text>

            <Text style={styles.label}>☀️ Condiciones ideales:</Text>
            <Text style={styles.texto}>{item.condiciones}</Text>

            <Text style={styles.label}>🌾 Tiempo de cosecha:</Text>
            <Text style={styles.texto}>{item.cosecha}</Text>

            <Text style={styles.label}>💡 Curiosidades:</Text>
            <Text style={styles.texto}>{item.curiosidades}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF6', // Fondo crema pastel
    paddingVertical: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333', // Letras negras suaves
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#D8F3DC', // Verde menta pastel
    borderRadius: 25,
    marginHorizontal: 15,
    marginBottom: 30,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#CDE8CF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 80,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  textContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4332',
  },
  fecha: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  infoSection: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D6A4F',
    marginTop: 8,
  },
  texto: {
    fontSize: 15,
    color: '#222',
    textAlign: 'justify',
    lineHeight: 22,
    marginBottom: 5,
  },
});
