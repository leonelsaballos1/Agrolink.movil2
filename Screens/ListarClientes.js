import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert,
  TouchableOpacity, Animated, TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, addDoc, getFirestore, query, where
} from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import appFirebase, { auth } from '../BasedeDatos/Firebase';

const db = getFirestore(appFirebase);

export default function ListarClientes({ navigation }) {
  const [clientes, setClientes] = useState([]);
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [mostrarBuscador, setMostrarBuscador] = useState(false);
  const searchHeight = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const refClientes = collection(db, 'clientes');
    let q;

    if (currentUser.email === 'leonelsaballos999@gmail.com') {
      // Admin: fetch all documents
      q = query(refClientes);
    } else {
      // Regular user: fetch only their own documents
      q = query(refClientes, where('userId', '==', currentUser.uid));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      lista.sort((a, b) => b.fechaRegistro?.toDate?.() - a.fechaRegistro?.toDate?.());
      setClientes(lista);
    });

    return () => unsubscribe();
  }, []);

  const toggleBuscador = () => {
    setMostrarBuscador((prev) => {
      const nextState = !prev;
      Animated.timing(searchHeight, {
        toValue: nextState ? 60 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      return nextState;
    });
  };

  const guardarNuevo = async (cliente, idExistente = null) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "Debes iniciar sesión para guardar los datos.");
      return;
    }

    try {
      if (idExistente) {
        await setDoc(doc(db, 'clientes', idExistente), cliente);
      } else {
        await addDoc(collection(db, 'clientes'), {
          ...cliente,
          userId: currentUser.uid,
          fechaRegistro: new Date(),
          estadoCultivo: cliente.estadoCultivo || {
            asertoFecha: false,
            plaga: false,
            perdida: 0,
          },
        });
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
  };

  const eliminarCliente = (id) => {
    Alert.alert('Confirmar', '¿Desea eliminar este agricultor?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        onPress: async () => {
          await deleteDoc(doc(db, 'clientes', id));
        },
        style: 'destructive',
      },
    ]);
  };

  const toggleBoolean = (cliente, campo) => {
    const actualizado = {
      ...cliente,
      estadoCultivo: {
        ...cliente.estadoCultivo,
        [campo]: !cliente.estadoCultivo?.[campo],
      },
    };
    guardarNuevo(actualizado, cliente.id);
  };

  const cambiarPerdida = (cliente, valor) => {
    let porcentaje = Number(valor);

    if (isNaN(porcentaje)) porcentaje = 0;
    if (porcentaje > 100) porcentaje = 100;
    if (porcentaje < 0) porcentaje = 0;

    const actualizado = {
      ...cliente,
      estadoCultivo: {
        ...cliente.estadoCultivo,
        perdida: porcentaje,
      },
    };
    guardarNuevo(actualizado, cliente.id);
  };

  const texto = busquedaTexto.toLowerCase();
  const clientesFiltrados = clientes.filter((item) =>
    item.agricultor?.toLowerCase().includes(texto)
  );

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        {/* Bloque de datos + botones arriba */}
        <View style={styles.rowHeader}>
          {/* Datos */}
          <View style={{ flex: 1 }}>
            <Text style={styles.text}><Text style={styles.label}>Nombre:</Text> {item.agricultor}</Text>
            <Text style={styles.text}><Text style={styles.label}>Planta:</Text> {item.planta}</Text>
            <Text style={styles.text}><Text style={styles.label}>Día sombra:</Text> {item.diaSombra}</Text>
            <Text style={styles.text}><Text style={styles.label}>Variedad:</Text> {item.variedad}</Text>
            <Text style={styles.text}><Text style={styles.label}>Día corte:</Text> {item.diaCorte}</Text>
            <Text style={styles.text}><Text style={styles.label}>Recomendación:</Text> {item.recomendaciones}</Text>
          </View>

          {/* Botones */}
          <View style={styles.botones}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('RegistrarCliente', {
                  guardarNuevo,
                  clienteExistente: item,
                  idCliente: item.id,
                })
              }
              style={styles.botonEditar}
            >
              <MaterialCommunityIcons name="square-edit-outline" size={30} color="#1976d2" />
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <TouchableOpacity
                style={styles.botonEliminar}
                onPress={() => eliminarCliente(item.id)}
                onPressIn={() =>
                  Animated.spring(scaleValue, { toValue: 0.85, useNativeDriver: true }).start()
                }
                onPressOut={() =>
                  Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start()
                }
              >
                <MaterialCommunityIcons name="trash-can-outline" size={30} color="#e53935" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Estado del cultivo */}
        <View style={styles.estadoContainer}>
          <Text style={styles.estadoTitulo}>Estado del cultivo:</Text>

          <View style={styles.estadoFila}>
            <Text style={{ flex: 1 }}>Aserto la fecha:</Text>
            <TouchableOpacity
              style={[styles.btnToggle, item.estadoCultivo?.asertoFecha && styles.btnActivo]}
              onPress={() => toggleBoolean(item, 'asertoFecha')}
            >
              <Text style={{ color: item.estadoCultivo?.asertoFecha ? '#fff' : '#000' }}>
                {item.estadoCultivo?.asertoFecha ? 'Sí' : 'No'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.estadoFila}>
            <Text style={{ flex: 1 }}>Plaga:</Text>
            <TouchableOpacity
              style={[styles.btnToggle, item.estadoCultivo?.plaga && styles.btnActivo]}
              onPress={() => toggleBoolean(item, 'plaga')}
            >
              <Text style={{ color: item.estadoCultivo?.plaga ? '#fff' : '#000' }}>
                {item.estadoCultivo?.plaga ? 'Sí' : 'No'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.estadoFila}>
            <Text style={{ flex: 1 }}>Pérdida (%):</Text>
            <Picker
              selectedValue={item.estadoCultivo?.perdida?.toString() || '0'}
              style={styles.pickerPerdida}
              onValueChange={(valor) => cambiarPerdida(item, valor)}
              mode="dialog"
            >
              {Array.from({ length: 101 }, (_, i) => (
                <Picker.Item key={i} label={`${i}%`} value={`${i}`} />
              ))}
            </Picker>

            <TextInput
              value={item.estadoCultivo?.perdida?.toString() || ''}
              onChangeText={(valor) => cambiarPerdida(item, valor)}
              keyboardType="numeric"
              style={styles.inputPerdida}
              placeholder="0-100"
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agricultores</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={toggleBuscador} style={styles.botonAgregar}>
            <MaterialCommunityIcons name="magnify" size={28} color="#4caf50" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('RegistrarCliente', { guardarNuevo })
            }
            style={styles.botonAgregar}
          >
            <MaterialCommunityIcons name="account-plus-outline" size={32} color="#4caf50" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={[styles.searchContainer, { height: searchHeight }]}>
        <TextInput
          placeholder="Buscar agricultor por nombre..."
          style={styles.inputBuscar}
          value={busquedaTexto}
          onChangeText={setBusquedaTexto}
        />
      </Animated.View>

      <FlatList
        data={clientesFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 26, fontWeight: '700' },
  botonAgregar: { backgroundColor: '#d0e8f2', padding: 10, borderRadius: 50, elevation: 8 },
  searchContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#4caf50',
    marginBottom: 15,
    justifyContent: 'center',
  },
  inputBuscar: { fontSize: 16, paddingVertical: 8, color: '#333' },
  item: {
    backgroundColor: '#fefefeff',
    borderRadius: 16,
    marginBottom: 15,
    padding: 20,
    flexDirection: 'row',
    elevation: 6,
  },
  text: { fontSize: 16, marginBottom: 6, color: '#333', fontWeight: '600' },
  label: { fontWeight: '700', color: '#00796b' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  botones: { alignItems: 'center', gap: 10 },
  botonEditar: { backgroundColor: '#bbdefb', padding: 8, borderRadius: 30 },
  botonEliminar: { backgroundColor: '#ffcdd2', padding: 8, borderRadius: 30 },
  estadoContainer: { marginTop: 10, padding: 10, backgroundColor: '#c8e6c9', borderRadius: 10 },
  estadoTitulo: { fontWeight: '700', marginBottom: 5 },
  estadoFila: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  btnToggle: {
    borderWidth: 1, borderColor: '#999',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4,
  },
  btnActivo: { backgroundColor: '#4caf50', borderColor: '#4caf50' },
  pickerPerdida: { height: 50, width: 120, marginRight: 8, backgroundColor: '#fff' },
  inputPerdida: {
    borderWidth: 1, borderColor: '#999',
    borderRadius: 8, paddingHorizontal: 8,
    width: 70, height: 40, textAlign: 'center',
  },
});
