// AgregarCapacitacion.js
import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db, auth } from "../BasedeDatos/Firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

export default function AgregarCapacitacion() {
  const navigation = useNavigation();
  const route = useRoute();

  const { capacitacion } = route.params || {};
  const [isAdmin, setIsAdmin] = useState(false);

  const [form, setForm] = useState({
    nombreCapacitador: "",
    correo: "",
    telefono: "",
    fecha: "",
    duracion: "",
    plataforma: "",
    enlace: "",
    idReunion: "",
    codigoAcceso: "",
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.email === "leonelsaballos999@gmail.com") {
      setIsAdmin(true);
    } else {
      Alert.alert(
        "Acceso denegado",
        "No tienes permiso para acceder a esta función."
      );
      navigation.goBack();
    }

    if (capacitacion) setForm(capacitacion);
  }, [capacitacion, navigation]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
      Alert.alert(
        "Acceso denegado",
        "No tienes permiso para realizar esta acción."
      );
      return;
    }

    if (!form.nombreCapacitador || !form.fecha) {
      Alert.alert("⚠️ Error", "El nombre y la fecha son obligatorios.");
      return;
    }

    try {
      if (capacitacion?.idFirebase) {
        // 🔹 Actualizar capacitación existente
        await updateDoc(
          doc(db, "capacitaciones", capacitacion.idFirebase),
          form
        );
        Alert.alert("✅ Actualizado", "La capacitación fue actualizada.");
      } else {
        // 🔹 Agregar nueva capacitación
        await addDoc(collection(db, "capacitaciones"), form);
        Alert.alert("✅ Guardado", "La capacitación fue registrada.");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error guardando capacitación:", error);
      Alert.alert("❌ Error", "No se pudo guardar la capacitación.");
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text>No tienes permiso para ver esta pantalla.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        {capacitacion ? "✏️ Editar Capacitación" : "➕ Registrar Capacitación"}
      </Text>

      {[
        { key: "nombreCapacitador", placeholder: "Nombre del capacitador" },
        { key: "correo", placeholder: "Correo electrónico" },
        { key: "telefono", placeholder: "Teléfono" },
        { key: "fecha", placeholder: "Fecha y hora" },
        { key: "duracion", placeholder: "Duración (ej: 2 horas)" },
        { key: "plataforma", placeholder: "Plataforma (Zoom / Meet)" },
        { key: "enlace", placeholder: "Enlace de la reunión" },
        { key: "idReunion", placeholder: "ID de reunión" },
        { key: "codigoAcceso", placeholder: "Código de acceso" },
      ].map((item) => (
        <TextInput
          key={item.key}
          style={styles.input}
          placeholder={item.placeholder}
          value={form[item.key]}
          onChangeText={(text) => handleChange(item.key, text)}
        />
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
        <Ionicons name="save" size={20} color="#fff" />
        <Text style={styles.saveText}>
          {capacitacion ? "Actualizar Capacitación" : "Guardar Capacitación"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#E8F5E9" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center", color: "#2E7D32" },
  input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "#ccc" },
  saveButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#388E3C", padding: 14, borderRadius: 8, justifyContent: "center", marginTop: 20 },
  saveText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },
});
