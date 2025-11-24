// CapacitacionesEnLinea.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../BasedeDatos/Firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";

export default function CapacitacionesEnLinea() {
  const navigation = useNavigation();
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const user = auth.currentUser;


  // 🔹 Videos (constantes locales — no se borran)
  const videos = [
    { titulo: "Cultivo de frijoles en Nicaragua", url: "https://www.youtube.com/watch?v=qmnq5XVSxDY" },
    { titulo: "Siembra de frijol en el ciclo de primera", url: "https://www.youtube.com/watch?v=xKJ_IJ3DX2M" },
    { titulo: "Producción del cultivo de maíz en época de primera", url: "https://www.youtube.com/watch?v=3SoHBbmjaD4" },
    { titulo: "Cultivo de maíz amarillo duro megahíbrido", url: "https://www.youtube.com/watch?v=eF91WTKdMzw" },
    { titulo: "Productores cuentan experiencias en cultivar sorgo", url: "https://www.youtube.com/watch?v=e2DJxK83yG4" },
    { titulo: "Manejo de semilla y establecimiento del cultivo de sorgo", url: "https://www.youtube.com/watch?v=PuXUcNt_YHY" },
  ];

  // 🔹 Documentos (constantes locales — no se borran)
  const documentos = [
    { titulo: "Guía técnica para el cultivo de frijoles en Nicaragua", url: "https://inta.gob.ni/documentos/guia_tecnica_frijoles.pdf" },
    { titulo: "Manual de buenas prácticas agrícolas para maíz", url: "https://inta.gob.ni/documentos/manual_bpa_maiz.pdf" },
    { titulo: "Recomendaciones para el cultivo de sorgo en Nicaragua", url: "https://inta.gob.ni/documentos/recomendaciones_sorgo.pdf" },
  ];

  // 🔹 Escuchar capacitaciones en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "capacitaciones"),
      (snapshot) => {
        const lista = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          idFirebase: docItem.id,
          ...docItem.data(),
        }));
        setCapacitaciones(lista);
      },
      (error) => {
        console.error("Error cargando capacitaciones:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🔹 Borrar capacitación (solo borra documentos en Firestore; videos/doc no se tocan)
  const handleBorrar = async (idFirebase) => {
    if (user && user.email === "leonelsaballos999@gmail.com") {
      Alert.alert("⚠️ Confirmar", "¿Deseas eliminar esta capacitación?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "capacitaciones", idFirebase));
            } catch (error) {
              console.log(error);
            }
          },
        },
      ]);
    } else {
      Alert.alert(
        "Acceso denegado",
        "Solo el administrador puede eliminar capacitaciones."
      );
    }
  };

  // 🔹 Filtrar por búsqueda
  const capacitacionesFiltradas = capacitaciones.filter((c) =>
    c.nombreCapacitador?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>👨‍🌾 Capacitaciones en línea</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Buscar por capacitador..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <TouchableOpacity
        style={[styles.linkButton, { backgroundColor: "#2196F3", marginBottom: 20 }]}
        onPress={() => navigation.navigate("AgregarCapacitacion")}
      >
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.linkText}>Agregar Capacitación</Text>
      </TouchableOpacity>

      {capacitacionesFiltradas.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.sectionHeader}>🧑‍🏫 {item.nombreCapacitador}</Text>
          <Text>• Correo: {item.correo}</Text>
          <Text>• Teléfono: {item.telefono}</Text>
          <Text>• Fecha: {item.fecha}</Text>
          <Text>• Duración: {item.duracion}</Text>
          <Text>• Plataforma: {item.plataforma}</Text>

          {item.enlace ? (
            <TouchableOpacity onPress={() => Linking.openURL(item.enlace)}>
              <Text style={styles.linkInline}>🔗 Abrir enlace</Text>
            </TouchableOpacity>
          ) : null}

          <Text>• ID: {item.idReunion}</Text>
          <Text>• Código: {item.codigoAcceso}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FFA000" }]}
              onPress={() => navigation.navigate("AgregarCapacitacion", { capacitacion: item })}
            >
              <Ionicons name="create" size={18} color="#fff" />
              <Text style={styles.actionText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#D32F2F" }]}
              onPress={() => handleBorrar(item.idFirebase)}
            >
              <Ionicons name="trash" size={18} color="#fff" />
              <Text style={styles.actionText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Videos (siempre locales) */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>🎥 Videos en Español</Text>
        {videos.map((video, index) => (
          <TouchableOpacity
            key={index}
            style={styles.linkButton}
            onPress={() => Linking.openURL(video.url)}
          >
            <Ionicons name="logo-youtube" size={20} color="#fff" />
            <Text style={styles.linkText}>{video.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Documentos (siempre locales) */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>📄 Documentos en Español</Text>
        {documentos.map((doc, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.linkButton, { backgroundColor: "#4CAF50" }]}
            onPress={() => Linking.openURL(doc.url)}
          >
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.linkText}>{doc.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingTop: 60, backgroundColor: "#E8F5E9" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center", color: "#2E7D32" },
  card: { backgroundColor: "#fff", padding: 16, marginBottom: 16, borderRadius: 12, elevation: 3 },
  sectionHeader: { fontWeight: "bold", marginBottom: 4, fontSize: 16, color: "#388E3C" },
  linkButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#2196F3", padding: 12, borderRadius: 8, marginTop: 10 },
  linkText: { color: "#fff", marginLeft: 8, fontWeight: "bold", flexShrink: 1 },
  linkInline: { color: "#1976D2", marginTop: 4, fontWeight: "bold" },
  searchInput: { backgroundColor: "#fff", borderRadius: 8, padding: 10, marginBottom: 20, borderWidth: 1, borderColor: "#ccc" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  actionButton: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 8 },
  actionText: { color: "#fff", marginLeft: 6, fontWeight: "bold" },
});
