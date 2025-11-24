import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Polygon, Callout } from 'react-native-maps';
import { Checkbox } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(4);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({
    Maiz: true,
    'Arroz secano': true,
    'Frijol rojo': true,
    'Sorgo blanco': true,
    'Sorgo millon': true,
    'Sorgo rojo': true,
  });

  const datosZonas = [
    {
      nombre: 'León',
      cultivo: 'Maiz',
      coordenadas: { latitude: 12.4372, longitude: -86.8786 },
      info: '🌽 Maíz\nVariedades: NB-6, INTA-Nutrader',
      color: 'yellow',
    },
    {
      nombre: 'Madriz',
      cultivo: 'Frijol rojo',
      coordenadas: { latitude: 13.4708, longitude: -86.4596 },
      info: '🌱 Frijol rojo\nVariedades: INTA Rojo, Sequía',
      color: 'red',
    },
    {
      nombre: 'Chontales',
      cultivo: 'Sorgo blanco',
      coordenadas: { latitude: 11.8604, longitude: -85.1234 },
      info: '🌾 Sorgo blanco\nVariedades: INTA RCV, Tortillero',
      color: 'orange',
    },
    {
      nombre: 'Estelí',
      cultivo: 'Arroz secano',
      coordenadas: { latitude: 13.09, longitude: -86.35 },
      info: '🍚 Arroz secano\nVariedades: Secano INTA',
      color: 'green',
    },
    {
      nombre: 'Boaco',
      cultivo: 'Sorgo millon',
      coordenadas: { latitude: 12.47, longitude: -85.66 },
      info: '🌾 Sorgo millón\nVariedades: INTA Millón',
      color: 'blue',
    },
    {
      nombre: 'Carazo',
      cultivo: 'Sorgo rojo',
      coordenadas: { latitude: 11.86, longitude: -86.20 },
      info: '🌾 Sorgo rojo\nVariedades: INTA Rojo',
      color: 'purple',
    },
  ];

  const zonasFiltradas = datosZonas.filter(
    (zona) =>
      filtros[zona.cultivo] &&
      `${zona.nombre} ${zona.cultivo} ${zona.info}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
  );

  const cambiarZoom = (factor) => {
    const nuevoZoom = Math.max(2, Math.min(zoom + factor, 12));
    setZoom(nuevoZoom);
    mapRef.current?.animateToRegion(
      {
        latitude: 12.8654,
        longitude: -85.2072,
        latitudeDelta: 1.5 ** (12 - nuevoZoom),
        longitudeDelta: 1.5 ** (12 - nuevoZoom),
      },
      300
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Mapa de Granos Básicos en Nicaragua</Text>

      {/* Buscador */}
      <View style={styles.buscador}>
        <Ionicons name="search" size={20} color="gray" style={styles.icono} />
        <TextInput
          placeholder="Buscar: maíz, frijol, sorgo..."
          style={styles.input}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color="gray"
            onPress={() => setBusqueda('')}
          />
        )}
      </View>

      {/* Checkboxes */}
      <ScrollView
        horizontal
        style={styles.leyenda}
        contentContainerStyle={{ paddingHorizontal: 5 }}
      >
        {Object.keys(filtros).map((cultivo) => (
          <View key={cultivo} style={styles.checkboxContainer}>
            <Checkbox
              status={filtros[cultivo] ? 'checked' : 'unchecked'}
              onPress={() =>
                setFiltros({ ...filtros, [cultivo]: !filtros[cultivo] })
              }
              color="#4CAF50"
            />
            <Text style={styles.checkboxLabel}>{cultivo}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Mapa */}
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 12.8654,
            longitude: -85.2072,
            latitudeDelta: 4,
            longitudeDelta: 4,
          }}
        >
          {/* Polígono ejemplo */}
          <Polygon
            coordinates={[
              { latitude: 15, longitude: -87 },
              { latitude: 15, longitude: -83 },
              { latitude: 10.7, longitude: -83 },
              { latitude: 10.7, longitude: -87 },
            ]}
            strokeColor="#FF00FF"
            strokeWidth={2}
            fillColor="rgba(255,0,255,0.1)"
          />

          {zonasFiltradas.map((zona, index) => (
            <Marker
              key={index}
              coordinate={zona.coordenadas}
              pinColor={zona.color}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>
                    📍 {zona.nombre} ({zona.cultivo})
                  </Text>
                  <Text>{zona.info}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* Botones de zoom */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => cambiarZoom(1)}
          >
            <Text style={styles.zoomText}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => cambiarZoom(-1)}
          >
            <Text style={styles.zoomText}>－</Text>
          </TouchableOpacity>
        </View>
      </View>

      {zonasFiltradas.length === 0 && (
        <Text style={styles.noResult}>❌ No se encontraron coincidencias.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 10,
  },
  icono: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, paddingVertical: 8 },
  leyenda: { maxHeight: 50, marginBottom: 5 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 5 },
  checkboxLabel: { fontSize: 14 },
  map: { flex: 1, borderRadius: 8 },
  callout: { width: 200 },
  calloutTitle: { fontWeight: 'bold', marginBottom: 5 },
  noResult: { textAlign: 'center', color: 'gray', margin: 10 },
  zoomControls: {
    position: 'absolute',
    top: 20,
    right: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  zoomButton: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    elevation: 3,
  },
  zoomText: { fontSize: 20, fontWeight: 'bold' },
});
