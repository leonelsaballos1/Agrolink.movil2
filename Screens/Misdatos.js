// Misdatos.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../BasedeDatos/Firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function Misdatos({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const docRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const uploadImage = async (base64) => {
    try {
      const uid = auth.currentUser.uid;
      const imageRef = doc(db, "usuarios", uid);
      await updateDoc(imageRef, { foto: `data:image/jpeg;base64,${base64}` });
      setUserData((prev) => ({ ...prev, foto: `data:image/jpeg;base64,${base64}` }));
      Alert.alert("✅ Éxito", "Tu foto de perfil se actualizó");
    } catch (error) {
      console.error("Error al subir imagen:", error);
      Alert.alert("❌ Error", "No se pudo subir la foto");
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso requerido", "Debes permitir acceso a tu galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true, // Solicitar base64
    });
    if (!result.canceled) {
      uploadImage(result.assets[0].base64);
    }
  };

  // 🔹 Eliminar cuenta (Auth + Firestore)
  const deleteAccount = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const uid = user.uid;

      // 1. Eliminar documento en Firestore
      await deleteDoc(doc(db, "usuarios", uid));

      // 2. Eliminar usuario en Authentication
      await deleteUser(user);

      Alert.alert("✅ Cuenta eliminada", "Tu cuenta fue borrada correctamente.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "⚠️ Sesión expirada",
          "Debes volver a iniciar sesión antes de eliminar tu cuenta."
        );
        await signOut(auth);
        navigation.replace("Login");
      } else {
        Alert.alert("❌ Error", error.message);
      }
    }
  };

  if (loading) {
    return <Text style={{ textAlign: "center", marginTop: 50 }}>Cargando perfil...</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            userData?.foto
              ? { uri: userData.foto }
              : { uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }
          }
          style={styles.avatar}
        />
      </TouchableOpacity>
      <Text style={styles.name}>{userData?.nombre || "Usuario"}</Text>
      <Text style={styles.role}>Agricultor sostenible</Text>
      <Text style={styles.email}>{userData?.email}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("AgregarDatos", {
            onUpdate: (newData) => setUserData((prev) => ({ ...prev, ...newData })),
          })
        }
      >
        <Text style={styles.buttonText}>Editar perfil</Text>
      </TouchableOpacity>

     
      <TouchableOpacity
        style={styles.buttonLogout}
        onPress={() =>
          Alert.alert("Confirmar", "¿Quieres cerrar sesión?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Sí, cerrar", onPress: () => signOut(auth) },
          ])
        }
      >
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonDelete}
        onPress={() =>
          Alert.alert(
            "⚠️ Eliminar cuenta",
            "Esta acción es irreversible. ¿Quieres eliminar tu cuenta?",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Sí, eliminar", style: "destructive", onPress: deleteAccount },
            ]
          )
        }
      >
        <Ionicons name="trash-outline" size={20} color="white" />
        <Text style={styles.buttonText}>Eliminar mi cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#ffffffff", 
    alignItems: "center", 
    paddingTop: 50 
  },

  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 15, 
    borderWidth: 3, 
    borderColor: "#fff" 
  },

  name: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#000" 
  },

  role: { 
    fontSize: 16, 
    marginTop: 5, 
    color: "#333" 
  },

  email: { 
    fontSize: 14, 
    marginBottom: 20, 
    color: "#333" 
  },

  button: { 
    flexDirection: "row",
    backgroundColor: "#2e7d32",
    padding: 12, 
    borderRadius: 10, 
    marginTop: 12, 
    width: "70%",
    justifyContent: "center",
    alignItems: "center" 
  },

  buttonLogout: { 
    flexDirection: "row",
    backgroundColor: "#b71c1c",
    padding: 12, 
    borderRadius: 10, 
    marginTop: 20, 
    width: "70%",
    justifyContent: "center",
    alignItems: "center" 
  },

  buttonDelete: { 
    flexDirection: "row",
    backgroundColor: "#4a148c",
    padding: 12, 
    borderRadius: 10, 
    marginTop: 20, 
    width: "70%",
    justifyContent: "center",
    alignItems: "center" 
  },

  buttonText: { 
    color: "white", 
    fontWeight: "bold", 
    marginLeft: 6 
  },
});
