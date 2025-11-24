import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth } from '../BasedeDatos/Firebase';

export default function RegistrarCliente({ route }) {
  const { guardarNuevo, clienteExistente, idCliente } = route.params;
  const [agricultor, setAgricultor] = useState('');
  const [planta, setPlanta] = useState('');
  const [diaSombra, setDiaSombra] = useState('');
  const [variedad, setVariedad] = useState('');
  const [diaCorte, setDiaCorte] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [variedadesAbiertas, setVariedadesAbiertas] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigation = useNavigation();

  const diasParaCortePorVariedad = {
    'Cuarentaño': 90, 'Mono': 85, 'Barreño': 88, 'Bayo': 90, 'Rojo Chingo': 95, 'Barroy': 92, 'Orgulloso': 90, 'Revolución 79': 88,
    'Amarillo': 100, 'Maizón': 105, 'Olotillo blanco': 95, 'Pujagua morado': 110, 'Pujagua negro': 108, 'Pujagua rojo pálido': 102, 'Pujagua rojo quemado': 104,
    'Rojo Industrial': 120, 'Rojo Prodigio': 115, 'Maravilla': 118, 'Blanco': 110, 'Millón': 112,
  };

  const variedadesPorPlanta = {
    'Frijol': [
      { nombre: 'Cuarentaño', descripcion: 'Variedad criolla muy resistente, tradicional en Nicaragua.' },
      { nombre: 'Mono', descripcion: 'Grano pequeño, excelente sabor, buena adaptación.' },
      { nombre: 'Barreño', descripcion: 'Alta producción, buen rendimiento bajo condiciones secas.' },
      { nombre: 'Bayo', descripcion: 'De buen tamaño, fácil de cocinar, resistente a enfermedades.' },
      { nombre: 'Rojo Chingo', descripcion: 'Alta demanda local, buen rendimiento.' },
      { nombre: 'Barroy', descripcion: 'Variedad criolla, resistente a plagas.' },
      { nombre: 'Orgulloso', descripcion: 'Alta calidad y sabor, ciclo medio.' },
      { nombre: 'Revolución 79', descripcion: 'Variedad mejorada, alto rendimiento.' },
    ],
    'Maíz': [
      { nombre: 'Amarillo', descripcion: 'Variedad tradicional, buena producción para consumo local.' },
      { nombre: 'Maizón', descripcion: 'Grano grande, excelente para consumo y procesamiento.' },
      { nombre: 'Olotillo blanco', descripcion: 'Alta adaptabilidad, grano blanco y de buen sabor.' },
      { nombre: 'Pujagua morado', descripcion: 'Grano morado, valor cultural, buena resistencia.' },
      { nombre: 'Pujagua negro', descripcion: 'Resistente, alto contenido nutritivo.' },
      { nombre: 'Pujagua rojo pálido', descripcion: 'Variedad tradicional, buena producción.' },
      { nombre: 'Pujagua rojo quemado', descripcion: 'Grano rojo intenso, buen rendimiento y sabor.' },
    ],
    'Sorgo': [
      { nombre: 'Rojo Industrial', descripcion: 'Usado para alimentación animal e industrial.' },
      { nombre: 'Rojo Prodigio', descripcion: 'Resistente y con buena producción.' },
      { nombre: 'Maravilla', descripcion: 'Alta productividad, adaptabilidad a clima seco.' },
      { nombre: 'Blanco', descripcion: 'Buen rendimiento, grano blanco y suave.' },
      { nombre: 'Millón', descripcion: 'Variedad tradicional, resistente a sequías.' },
    ],
  };

  const recomendacionesBase = {
    'Frijol': {
      'Cuarentaño': 'Riego moderado cada 4 días, control de malezas.',
      'Mono': 'Regar cada 3 días, evitar exceso de humedad.',
      'Barreño': 'Riego cada 5 días, fertilizar cada 20 días.',
      'Bayo': 'Riego moderado cada 4 días, buen drenaje.',
      'Rojo Chingo': 'Riego cada 4 días, control de plagas.',
      'Barroy': 'Riego cada 5 días, mantener suelo aireado.',
      'Orgulloso': 'Riego moderado, proteger de plagas.',
      'Revolución 79': 'Riego cada 4 días, fertilizar cada 15 días.',
    },
    'Maíz': {
      'Amarillo': 'Riego moderado cada 5 días, buena exposición solar.',
      'Maizón': 'Riego cada 4 días, suelo fértil.',
      'Olotillo blanco': 'Regar cada 5 días, control de malezas.',
      'Pujagua morado': 'Riego moderado, buena aireación.',
      'Pujagua negro': 'Riego cada 6 días, buen drenaje.',
      'Pujagua rojo pálido': 'Riego moderado cada 5 días, fertilizar cada 15 días.',
      'Pujagua rojo quemado': 'Riego cada 5 días, protección contra plagas.',
    },
    'Sorgo': {
      'Rojo Industrial': 'Riego moderado cada 6 días, buen drenaje.',
      'Rojo Prodigio': 'Riego cada 5 días, controlar malezas.',
      'Maravilla': 'Riego moderado, fertilizar cada 20 días.',
      'Blanco': 'Riego cada 6 días, suelo aireado.',
      'Millón': 'Riego moderado, control de plagas.',
    },
  };

  useEffect(() => {
    if (clienteExistente) {
      setModoEdicion(true);
      setAgricultor(clienteExistente.agricultor || '');
      setPlanta(clienteExistente.planta || '');
      setDiaSombra(clienteExistente.diaSombra || '');
      setVariedad(clienteExistente.variedad || '');
      setDiaCorte(clienteExistente.diaCorte || '');
      setRecomendaciones(clienteExistente.recomendaciones || '');
    }
  }, [clienteExistente]);

  const sumarDiasFecha = (fechaStr, dias) => {
    if (!fechaStr) return '';
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return '';
    const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    fecha.setDate(fecha.getDate() + dias);
    const yyyy = fecha.getFullYear();
    const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dd = fecha.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    if (diaSombra && variedad && diasParaCortePorVariedad[variedad]) {
      const diasParaCorte = diasParaCortePorVariedad[variedad];
      setDiaCorte(sumarDiasFecha(diaSombra, diasParaCorte));
    }
  }, [diaSombra, variedad]);

  useEffect(() => {
    if (planta && variedad && recomendacionesBase[planta] && recomendacionesBase[planta][variedad]) {
      setRecomendaciones(recomendacionesBase[planta][variedad]);
    }
  }, [planta, variedad]);

  const formatearFecha = (texto) => {
    let soloNumeros = texto.replace(/[^0-9]/g, '');
    if (soloNumeros.length > 4 && soloNumeros.length <= 6) {
      soloNumeros = soloNumeros.slice(0, 4) + '-' + soloNumeros.slice(4);
    }
    if (soloNumeros.length > 6) {
      soloNumeros = soloNumeros.slice(0, 4) + '-' + soloNumeros.slice(4, 6) + '-' + soloNumeros.slice(6, 8);
    }
    return soloNumeros.slice(0, 10);
  };

  const Guardar = () => {
    if (!agricultor || !planta) {
      Alert.alert('Faltan datos', 'Por favor, complete el nombre del agricultor y la planta');
      return;
    }
    const user = auth.currentUser;
    if (user) {
      const nuevoCliente = {
        agricultor,
        planta,
        diaSombra,
        variedad,
        diaCorte,
        recomendaciones,
        userId: user.uid,
      };
      guardarNuevo(nuevoCliente, modoEdicion ? idCliente : null);
      Alert.alert(
        modoEdicion ? 'Datos actualizados' : 'Registro guardado',
        '',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', 'No se ha podido identificar al usuario.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>{modoEdicion ? 'Editar Registro' : 'Registrar Agricultor'}</Text>

          <Text style={styles.label}>Nombre del agricultor:</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="green" />
            <TextInput
              style={styles.input}
              value={agricultor}
              placeholder="Ej: Juan Pérez"
              onChangeText={setAgricultor}
            />
          </View>

          <Text style={styles.label}>Nombre de planta:</Text>
          <View style={styles.genderContainer}>
            {['Maíz', 'Frijol', 'Sorgo'].map((plantaTipo) => (
              <TouchableOpacity
                key={plantaTipo}
                style={[styles.genderButton, planta === plantaTipo && styles.genderSelected]}
                onPress={() => { setPlanta(plantaTipo); setVariedad(''); setVariedadesAbiertas(false); setDiaCorte(''); }}
              >
                <Text style={[styles.genderText, planta === plantaTipo && styles.genderTextSelected]}>{plantaTipo}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Día de sombra:</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="calendar-today" size={20} color="green" />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={diaSombra}
              onChangeText={(texto) => setDiaSombra(formatearFecha(texto))}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar" size={24} color="green" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={diaSombra ? new Date(diaSombra) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  const yyyy = selectedDate.getFullYear();
                  const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                  const dd = String(selectedDate.getDate()).padStart(2, '0');
                  setDiaSombra(`${yyyy}-${mm}-${dd}`);
                }
              }}
            />
          )}

          <Text style={styles.label}>Tipo de variedad:</Text>
          {planta ? (
            <View>
              <TouchableOpacity
                style={[styles.genderButton, variedadesAbiertas && styles.genderSelected]}
                onPress={() => setVariedadesAbiertas(!variedadesAbiertas)}
              >
                <Text style={[styles.genderText, variedadesAbiertas && styles.genderTextSelected]}>
                  {variedad || 'Selecciona una variedad'}
                </Text>
                <Ionicons
                  name={variedadesAbiertas ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={variedadesAbiertas ? '#fff' : '#4caf50'}
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>

              {variedadesAbiertas && (
                <View style={styles.variedadesContainer}>
                  <ScrollView style={styles.variedadesScroll}>
                    {variedadesPorPlanta[planta].map(({ nombre }) => (
                      <TouchableOpacity
                        key={nombre}
                        style={[styles.genderButton, variedad === nombre && styles.genderSelected]}
                        onPress={() => { setVariedad(nombre); setVariedadesAbiertas(false); }}
                      >
                        <Text style={[styles.genderText, variedad === nombre && styles.genderTextSelected]}>{nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {variedad ? (
                <View style={{ paddingHorizontal: 15, marginBottom: 10 }}>
                  <Text style={{ fontStyle: 'italic', color: '#555' }}>
                    {variedadesPorPlanta[planta].find(v => v.nombre === variedad)?.descripcion}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : <Text style={{ color: 'red', marginTop: 5 }}>Selecciona primero el nombre de planta</Text>}

          <Text style={styles.label}>Día de corte:</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="calendar-today" size={20} color="green" />
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={diaCorte} editable={false} />
          </View>

          <Text style={styles.label}>Recomendaciones:</Text>
          <View style={[styles.inputContainer, { minHeight: 80 }]}>
            <FontAwesome name="pencil" size={20} color="green" />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
              value={recomendaciones}
              onChangeText={setRecomendaciones}
              placeholder="Recomendaciones para el cultivo..."
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={Guardar}>
            <Text style={styles.saveButtonText}>{modoEdicion ? 'Actualizar' : 'Guardar'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffffff', borderRadius: 10,
    paddingHorizontal: 10, marginBottom: 10,
  },
  input: { flex: 1, height: 40, marginLeft: 10 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15, flexWrap: 'wrap' },
  genderButton: {
    flexDirection: 'row', borderWidth: 2, borderColor: '#4caf50',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
    margin: 4, alignItems: 'center', minWidth: '45%', justifyContent: 'center',
  },
  genderSelected: { backgroundColor: '#4caf50' },
  genderText: { marginLeft: 5, fontWeight: '600', color: '#4caf50', textAlign: 'center' },
  genderTextSelected: { color: '#fff' },
  variedadesContainer: {
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 10,
    height: 300,
    marginTop: 10,
    backgroundColor: '#f1f8e9',
  },
  variedadesScroll: {
    paddingHorizontal: 5,
  },
  saveButton: {
    flexDirection: 'row', backgroundColor: '#4caf50',
    padding: 14, borderRadius: 30, alignItems: 'center',
    justifyContent: 'center', marginTop: 10,
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 18, marginLeft: 10 },
});
