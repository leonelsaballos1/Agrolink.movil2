//Home.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, BackHandler } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(1); // Número de notificaciones

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return true; // Bloquea el botón si estamos en Home
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // Función para limpiar notificaciones al tocar la campanita
  const handleNotificationPress = () => {
    alert("¡Tienes nuevas notificaciones!");
    setNotifications(0); // Limpiamos las notificaciones
  };

  return (
    <View style={styles.container}>
      {/* Header con campanita */}
      <View style={styles.headerContainer}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Bienvenidos a</Text>
          <Text style={styles.titleHighlight}>Agrolink</Text>
          <Text style={styles.subtitle}>
            “Optimizando cosechas, Conectando Agricultores y transformando la agricultura sostenible”
          </Text>
        </View>

        {/* Campana en esquina superior derecha */}
        <TouchableOpacity style={styles.bellContainer} onPress={handleNotificationPress}>
          <Ionicons name="notifications-outline" size={36} color="#f9a825" />
          {notifications > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{notifications}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Cuadros de opciones */}
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ChatBot')}>
          <MaterialIcons name="computer" size={50} color="#9c27b0" />
          <Text style={styles.cardText}>IA</Text>
        </TouchableOpacity>

       <TouchableOpacity
  style={styles.card}
  onPress={() => navigation.navigate('ListarClientes')}
>
  <FontAwesome5 name="clipboard-list" size={50} color="#388e3c" />
  <Text style={styles.cardText}>Registro</Text>
</TouchableOpacity>


        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Capacitacion')}>
          <FontAwesome5 name="seedling" size={50} color="#f9a825" />
          <Text style={styles.cardText}>Capacitación</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Mapa')}>
          <Ionicons name="location" size={50} color="#e53935" />
          <Text style={styles.cardText}>Mapa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // centramos el texto
    alignItems: 'center',
    position: 'relative', // para que la campana absoluta se ubique respecto a este contenedor
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#000',
    textAlign: 'center',
  },
  titleHighlight: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  bellContainer: {
    position: 'absolute',
    top: -10, // sube la campana
    right: 0, // pegada a la derecha
    zIndex: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  card: {
    width: '45%',
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
