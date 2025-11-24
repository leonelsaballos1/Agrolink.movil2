import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { auth, db } from "../BasedeDatos/Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { validatePhone } from "../utils/validations";

const EditarPerfil = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    empresa: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser.uid;
        const docRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const { fecharegistro, descripcion, ...rest } = data;
          setFormData(rest);
        }
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar tus datos");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleGuardar = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert("⚠️ Nombre requerido", "El nombre no puede estar vacío.");
      return;
    }
    if (formData.telefono && !validatePhone(formData.telefono)) {
      Alert.alert("⚠️ Teléfono inválido", "Debe contener solo números (8 a 15 dígitos).");
      return;
    }

    try {
      const uid = auth.currentUser.uid;
      const docRef = doc(db, "usuarios", uid);

      await updateDoc(docRef, formData);

      if (route.params?.onUpdate) {
        route.params.onUpdate(formData);
      }

      Alert.alert("✅ Éxito", "Perfil actualizado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("❌ Error", "No se pudo actualizar el perfil");
    }
  };

  if (loading) {
    return <Text style={{ textAlign: "center", marginTop: 50 }}>Cargando datos...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <MaterialCommunityIcons name="leaf" size={40} color="#00796b" />
        <Text style={styles.titulo}>Editar Perfil</Text>
        <FontAwesome5 name="seedling" size={36} color="#00796b" />
      </View>

      {["nombre", "email", "empresa", "telefono"].map((campo) => {
        const editable = campo !== "email";

        return (
          <View key={campo} style={styles.inputGroup}>
            <Feather name="edit-2" size={20} color="#00796b" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, !editable && { backgroundColor: "#e0e0e0" }]}
              placeholder={`Ingrese ${campo}`}
              placeholderTextColor="#4caf50"
              value={formData[campo]}
              onChangeText={(text) => handleInputChange(campo, text)}
              editable={editable}
            />
          </View>
        );
      })}

      <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
        <Ionicons name="save-outline" size={24} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.botonTexto}>Actualizar Perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#ffffffff", flexGrow: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#b2dfdb",
    padding: 15,
    borderRadius: 20,
    elevation: 6,
  },
  titulo: { fontSize: 24, fontWeight: "700", color: "#00796b", textAlign: "center" },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#4caf50",
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 10,
    elevation: 3,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 16, color: "#333" },
  botonGuardar: {
    backgroundColor: "#4caf50",
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  botonTexto: { fontSize: 18, color: "white", fontWeight: "700" },
});

export default EditarPerfil;
