import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Linking,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as turf from '@turf/turf';
import { auth, db } from '../BasedeDatos/Firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

// --- Data Layers ---
const soilTypesData = [
    { coords: [[12.7, -85.8], [13.0, -85.8], [13.0, -85.5], [12.7, -85.5]], type: 'Arcilloso', color: 'rgba(139, 69, 19, 0.6)' },
    { coords: [[12.3, -84.9], [12.6, -84.9], [12.6, -84.6], [12.3, -84.6]], type: 'Arenoso', color: 'rgba(210, 180, 140, 0.6)' },
    { coords: [[11.9, -85.4], [12.2, -85.4], [12.2, -85.1], [11.9, -85.1]], type: 'Franco', color: 'rgba(160, 82, 45, 0.6)' }
  ].map(p => ({ ...p, coords: p.coords.map(c => ({ latitude: c[0], longitude: c[1] })) }));
  
const moistureDataLayers = [
    { coords: [[12.9, -86.1], [13.2, -86.1], [13.2, -85.8], [12.9, -85.8]], level: 'Alta', color: 'rgba(66, 153, 225, 0.6)' },
    { coords: [[12.4, -85.0], [12.7, -85.0], [12.7, -84.7], [12.4, -84.7]], level: 'Media', color: 'rgba(144, 205, 244, 0.6)' },
    { coords: [[11.7, -85.6], [12.0, -85.6], [12.0, -85.3], [11.7, -85.3]], level: 'Baja', color: 'rgba(236, 201, 75, 0.6)' }
].map(p => ({ ...p, coords: p.coords.map(c => ({ latitude: c[0], longitude: c[1] })) }));

function createSuitabilityRegions(cropType) {
    const regions = [
        { coords: [[12.5, -86.0], [12.8, -86.0], [12.8, -85.7], [12.5, -85.7]], suitability: 'excellent', color: 'rgba(56, 161, 105, 0.5)' },
        { coords: [[12.2, -85.5], [12.5, -85.5], [12.5, -85.2], [12.2, -85.2]], suitability: 'good', color: 'rgba(144, 205, 244, 0.5)' },
        { coords: [[13.0, -85.8], [13.3, -85.8], [13.3, -85.5], [13.0, -85.5]], suitability: 'moderate', color: 'rgba(251, 211, 141, 0.5)' },
        { coords: [[13.5, -84.8], [13.8, -84.8], [13.8, -84.5], [13.5, -84.5]], suitability: 'low', color: 'rgba(252, 129, 129, 0.5)' },
    ];
    const variations = { maiz: [0, 0], frijoles: [0.3, -0.3], sorgo: [-0.3, 0.3] };
    const variation = variations[cropType] || [0, 0];
    return regions.map(region => ({
        ...region,
        coords: region.coords.map(coord => ({ latitude: coord[0] + variation[0], longitude: coord[1] + variation[1] })),
    }));
}

function createFutureRegions(cropType) {
    const regions = createSuitabilityRegions(cropType);
    return regions.map(region => {
        const newCoords = region.coords.map(coord => ({
        latitude: coord.latitude + 0.2,
        longitude: coord.longitude - 0.1,
        }));
        let newSuitability = region.suitability;
        let newColor = region.color;
        if (region.suitability === 'excellent') { newSuitability = 'good'; newColor = 'rgba(144, 205, 244, 0.5)'; }
        else if (region.suitability === 'good') { newSuitability = 'moderate'; newColor = 'rgba(251, 211, 141, 0.5)'; }
        return { ...region, coords: newCoords, suitability: newSuitability, color: newColor };
    });
}


// --- Helper Function ---
function translateSuitability(suitability) {
  const translations = {
    excellent: 'Excelente',
    good: 'Buena',
    moderate: 'Moderada',
    low: 'Baja',
  };
  return translations[suitability] || suitability;
}

// Pre-calculate turf polygons for efficiency
const soilPolygons = soilTypesData.map(soil => ({
  ...soil,
  poly: turf.polygon([soil.coords.map(c => [c.longitude, c.latitude])]),
}));

const moisturePolygons = moistureDataLayers.map(moisture => ({
  ...moisture,
  poly: turf.polygon([moisture.coords.map(c => [c.longitude, c.latitude])]),
}));


const AgriculturalMapScreen = () => {
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [currentCrop, setCurrentCrop] = useState('maiz');
  const [isCurrentClimate, setIsCurrentClimate] = useState(true);
  const [showSoil, setShowSoil] = useState(false);
  const [showMoisture, setShowMoisture] = useState(false);
  const [adviceModalVisible, setAdviceModalVisible] = useState(false);
  const [adviceContent, setAdviceContent] = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [linkInput, setLinkInput] = useState('');

  const mapRef = useRef(null);

  const cropLayers = {
    maiz: { current: createSuitabilityRegions('maiz'), future: createFutureRegions('maiz') },
    frijoles: { current: createSuitabilityRegions('frijoles'), future: createFutureRegions('frijoles') },
    sorgo: { current: createSuitabilityRegions('sorgo'), future: createFutureRegions('sorgo') },
  };

  // --- Panel visibility & animation ---
  const panelWidth = width * 0.7;
  const [panelVisible, setPanelVisible] = useState(true);
  const panelAnim = useRef(new Animated.Value(0)).current; // 0 = visible, negative = hidden

  const togglePanel = () => {
    const toValue = panelVisible ? -panelWidth - 20 : 0; // -width-20 to move it fully out (plus margin)
    Animated.timing(panelAnim, {
      toValue,
      duration: 280,
      useNativeDriver: true,
    }).start();
    setPanelVisible(!panelVisible);
  };

  useEffect(() => {
    // Request location permission and load saved locations
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }
      loadSavedLocations();
    })();
  }, []);

  const loadSavedLocations = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const q = query(collection(db, "locations"), where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      const locations = [];
      querySnapshot.forEach((doc) => {
        locations.push(doc.data());
      });
      setSavedLocations(locations);
    } catch (e) {
      console.error("Failed to load locations.", e);
    }
  };

  const saveLocation = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
        alert('Debes iniciar sesión para guardar ubicaciones.');
        return;
    }
    if (!selectedPoint) {
      alert('Primero selecciona una ubicación en el mapa.');
      return;
    }
    try {
      const newLocation = { 
          ...selectedPoint, 
          timestamp: new Date().toISOString(),
          uid: uid,
        };
      await addDoc(collection(db, "locations"), newLocation);
      setSavedLocations([...savedLocations, newLocation]);
      alert('Ubicación guardada correctamente');
    } catch (e) {
      console.error("Failed to save location.", e);
    }
  };

  const goToLocation = (latitude, longitude) => {
    if (mapRef.current && mapRef.current.animateToRegion) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }, 1000);
    }
    setUserLocation({ latitude, longitude });
    setSelectedPoint({ latitude, longitude });
  };

  const handleGPS = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      goToLocation(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error("Failed to get GPS location:", error);
      alert("No se pudo obtener la ubicación GPS. Asegúrate de que tus servicios de ubicación estén activados.");
    }
  };

  const handleCoords = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (!isNaN(lat) && !isNaN(lng)) {
      goToLocation(lat, lng);
    } else {
      alert('Por favor ingrese coordenadas válidas.');
    }
  };

  const handleLink = () => {
    if (!linkInput) {
      alert('Por favor ingrese un enlace de Google Maps');
      return;
    }
    try {
      let matches = linkInput.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (!matches) {
        matches = linkInput.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      }
      if (!matches) {
        matches = linkInput.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      }
      if (matches) {
        const lat = parseFloat(matches[1]);
        const lng = parseFloat(matches[2]);
        goToLocation(lat, lng);
      } else {
        alert('No se pudieron encontrar coordenadas en el enlace.');
      }
    } catch (error) {
      alert('Enlace inválido.');
    }
  };

  const fetchAdvice = async (soilType, soilMoisture, cropType) => {
    setLoadingAdvice(true);
    setAdviceContent(null);
    try {
      const response = await fetch('https://magicloops.dev/api/loop/fertilizer-irrigation-advisor/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soilType, soilMoisture, cropType }),
      });
      if (!response.ok) throw new Error('Error en la respuesta del servicio');
      const data = await response.json();
      setAdviceContent(data);
    } catch (error) {
      console.error('Error fetching advice:', error);
      setAdviceContent({ error: error.message });
    } finally {
      setLoadingAdvice(false);
    }
  };

  const onMapPress = (e) => {
    const point = e.nativeEvent.coordinate;
    setSelectedPoint(point);
    if (adviceModalVisible) {
      getAdviceForPoint(point);
    }
  };

  const getAdviceForPoint = (point) => {
    if (!point) {
      alert("Selecciona un punto en el mapa primero.");
      setAdviceContent({ info: "Selecciona un punto en el mapa para ver recomendaciones." });
      return;
    }

    let soilType = 'Franco'; // Default
    let soilMoisture = 'Media'; // Default

    const turfPoint = turf.point([point.longitude, point.latitude]);

    if (showSoil) {
      for (const soil of soilPolygons) {
        if (turf.booleanPointInPolygon(turfPoint, soil.poly)) {
          soilType = soil.type;
          break;
        }
      }
    }

    if (showMoisture) {
      for (const moisture of moisturePolygons) {
        if (turf.booleanPointInPolygon(turfPoint, moisture.poly)) {
          soilMoisture = moisture.level;
          break;
        }
      }
    }

    fetchAdvice(soilType, soilMoisture, currentCrop);
  };

  const openAdvicePanel = () => {
    setAdviceModalVisible(true);
    getAdviceForPoint(selectedPoint);
  };

  const renderPolygons = () => {
    const layer = isCurrentClimate ? cropLayers[currentCrop].current : cropLayers[currentCrop].future;
    return layer.map((poly, index) => (
      <Polygon
        key={index}
        coordinates={poly.coords}
        fillColor={poly.color}
        strokeWidth={0}
        tappable
        onPress={() => alert(`Aptitud: ${translateSuitability(poly.suitability)}`)}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        // googleMapApiKey="YOUR_GOOGLE_MAPS_API_KEY" // <-- ADD YOUR KEY HERE
        initialRegion={{
          latitude: 12.6,
          longitude: -85.0,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        onMapReady={() => setMapReady(true)}
        onPress={onMapPress}
      >
        {mapReady && renderPolygons()}
        {mapReady && showSoil && soilTypesData.map((p, i) => <Polygon key={`soil-${i}`} coordinates={p.coords} fillColor={p.color} strokeWidth={0} />)}
        {mapReady && showMoisture && moistureDataLayers.map((p, i) => <Polygon key={`moisture-${i}`} coordinates={p.coords} fillColor={p.color} strokeWidth={0} />)}
        {userLocation && <Marker coordinate={userLocation} title="Tu Ubicación" />}
        {selectedPoint && <Marker coordinate={selectedPoint} pinColor="blue" title="Punto Seleccionado" />}
        {savedLocations.map((loc, i) => <Marker key={`saved-${i}`} coordinate={loc} pinColor="purple" title={`Guardado: ${new Date(loc.timestamp).toLocaleDateString()}`} />)}
      </MapView>

      {/* Toggle button para mostrar/ocultar panel */}
      <TouchableOpacity style={styles.toggleButton} onPress={togglePanel}>
        <Icon name={panelVisible ? "chevron-left" : "chevron-right"} size={18} color="#fff" />
      </TouchableOpacity>

      {/* Control Panel (Animated) */}
      <Animated.View style={[styles.controlPanel, { transform: [{ translateX: panelAnim }] }]}>
        <ScrollView>
          <Text style={styles.panelTitle}>Mapa Agrícola de Nicaragua</Text>

          {/* Crop Selection */}
          <Text style={styles.heading}>Cultivos:</Text>
          <View style={styles.row}>
            {['maiz', 'frijoles', 'sorgo'].map(crop => (
              <TouchableOpacity
                key={crop}
                style={[styles.chip, currentCrop === crop && styles.chipSelected]}
                onPress={() => setCurrentCrop(crop)}
              >
                <Text style={[styles.chipText, currentCrop === crop && styles.chipTextSelected]}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Climate Scenario */}
          <Text style={styles.heading}>Escenario Climático:</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.chip, isCurrentClimate && styles.chipSelected]} onPress={() => setIsCurrentClimate(true)}>
              <Text style={[styles.chipText, isCurrentClimate && styles.chipTextSelected]}>Actual</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, !isCurrentClimate && styles.chipSelected]} onPress={() => setIsCurrentClimate(false)}>
              <Text style={[styles.chipText, !isCurrentClimate && styles.chipTextSelected]}>Futuro</Text>
            </TouchableOpacity>
          </View>

          {/* Data Layers */}
          <Text style={styles.heading}>Datos del suelo:</Text>
          <View style={styles.switchRow}>
            <Text>Mostrar tipo de suelo</Text>
            <TouchableOpacity onPress={() => setShowSoil(!showSoil)} style={[styles.checkbox, showSoil && styles.checkboxSelected]}>{showSoil && <Icon name="check" color="#fff" />}</TouchableOpacity>
          </View>
          <View style={styles.switchRow}>
            <Text>Mostrar humedad actual</Text>
            <TouchableOpacity onPress={() => setShowMoisture(!showMoisture)} style={[styles.checkbox, showMoisture && styles.checkboxSelected]}>{showMoisture && <Icon name="check" color="#fff" />}</TouchableOpacity>
          </View>

          {/* Location Finder */}
          <Text style={styles.heading}>Buscar Ubicación:</Text>
          <View style={styles.row}>
            <TextInput style={styles.input} placeholder="Latitud" value={latInput} onChangeText={setLatInput} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Longitud" value={lngInput} onChangeText={setLngInput} keyboardType="numeric" />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleCoords}>
            <Icon name="map-marker" size={15} color="#fff" />
            <Text style={styles.buttonText}>Ir a Coordenadas</Text>
          </TouchableOpacity>
          <TextInput style={[styles.input, { width: '100%', marginTop: 5 }]} placeholder="Pegar enlace GPS (Google Maps)" value={linkInput} onChangeText={setLinkInput} />
          <TouchableOpacity style={styles.button} onPress={handleLink}>
            <Icon name="link" size={15} color="#fff" />
            <Text style={styles.buttonText}>Ir a Enlace</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
            <TouchableOpacity style={[styles.button, { flex: 1, marginRight: 5 }]} onPress={handleGPS}>
              <Icon name="location-arrow" size={15} color="#fff" />
              <Text style={styles.buttonText}>Mi Ubicación</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { flex: 1, marginLeft: 5, backgroundColor: '#6a0dad' }]} onPress={saveLocation}>
              <Icon name="save" size={15} color="#fff" />
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          {/* Saved Locations */}
          <Text style={styles.heading}>Ubicaciones Guardadas:</Text>
          <View style={styles.savedList}>
            {savedLocations.length > 0 ? savedLocations.map((loc, index) => (
              <View key={index} style={styles.savedItem}>
                <Text>{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</Text>
                <View style={styles.row}>
                  <TouchableOpacity onPress={() => goToLocation(loc.latitude, loc.longitude)} style={styles.iconButton}><Icon name="map-pin" size={15} color="#333" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`)} style={styles.iconButton}><Icon name="external-link" size={15} color="#333" /></TouchableOpacity>
                </View>
              </View>
            )) : <Text style={styles.emptyText}>No hay ubicaciones guardadas</Text>}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.heading}>Aptitud de Cultivo</Text>
        <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#38A169' }]} /><Text>Excelente</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#90CDF4' }]} /><Text>Buena</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#FBD38D' }]} /><Text>Moderada</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#FC8181' }]} /><Text>Baja</Text></View>
      </View>

      {/* Advice Button */}
      <TouchableOpacity style={styles.adviceButton} onPress={openAdvicePanel}>
        <Icon name="lightbulb-o" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Advice Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={adviceModalVisible}
        onRequestClose={() => setAdviceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.modalTitle}>Recomendaciones</Text>
              <TouchableOpacity onPress={() => setAdviceModalVisible(false)}><Icon name="times" size={24} /></TouchableOpacity>
            </View>
            {loadingAdvice ? <ActivityIndicator size="large" color="#0000ff" /> :
              adviceContent ? (
                adviceContent.error ? <Text style={{ color: 'red' }}>{adviceContent.error}</Text> :
                  adviceContent.info ? <Text>{adviceContent.info}</Text> :
                    <View>
                      <Text style={styles.heading}>Fertilizantes:</Text>
                      <Text>{adviceContent.fertilizer}</Text>
                      <Text style={styles.heading}>Irrigación:</Text>
                      <Text>{adviceContent.irrigation}</Text>
                    </View>
              ) : <Text>Selecciona un punto en el mapa para obtener recomendaciones.</Text>
            }
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { ...StyleSheet.absoluteFillObject },
  controlPanel: {
    position: 'absolute',
    top: 40,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 10,
    borderRadius: 8,
    width: width * 0.7,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 7,
  },
  panelTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  heading: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  chip: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#e2e8f0', borderRadius: 15, margin: 2 },
  chipSelected: { backgroundColor: '#4299e1' },
  chipText: { color: '#000' },
  chipTextSelected: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  checkboxSelected: { backgroundColor: '#4299e1', borderColor: '#4299e1' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, flex: 1, margin: 2, backgroundColor: 'white' },
  button: { flexDirection: 'row', backgroundColor: '#4299e1', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  buttonText: { color: '#fff', marginLeft: 8, fontWeight: 'bold' },
  savedList: { maxHeight: 100, borderWidth: 1, borderColor: '#eee', borderRadius: 4, padding: 5 },
  savedItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#eee' },
  emptyText: { textAlign: 'center', color: '#888', fontStyle: 'italic' },
  iconButton: { padding: 5, marginHorizontal: 5 },
  legend: {
    position: 'absolute',
    bottom: 40,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  legendColor: { width: 20, height: 20, marginRight: 8, borderRadius: 3 },
  adviceButton: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    backgroundColor: '#4299e1',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

  // Toggle button estilo
  toggleButton: {
    position: 'absolute',
    top: 48,
    left: 10 + (width * 0.7) + 8, // sitúa el toggle al borde derecho del panel
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2d3748',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default AgriculturalMapScreen;