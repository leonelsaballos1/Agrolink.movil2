import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../BasedeDatos/Firebase";
import { doc, setDoc } from "firebase/firestore";
import { validateEmail, validatePassword } from "../utils/validations";

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const registerUser = async () => {
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      Alert.alert("⚠️ Campos vacíos", "Todos los campos son obligatorios.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("⚠️ Correo inválido", "Por favor ingresa un correo válido.");
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert("⚠️ Contraseña débil", "Debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nombre,
        email,
        fechaRegistro: new Date(),
      });

      await sendEmailVerification(user);

      Alert.alert(
        "✅ Verificación requerida",
        "Hemos enviado un correo a tu dirección. Por favor, verifica tu cuenta."
      );

      navigation.navigate("Home");
    } catch (error) {
      let errorMessage = "Ocurrió un error inesperado durante el registro.";
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Este correo electrónico ya está en uso. Por favor, inicia sesión o usa otro correo.";
          break;
        case "auth/invalid-email":
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "La autenticación por correo y contraseña no está habilitada.";
          break;
        case "auth/weak-password":
          errorMessage = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
          break;
        default:
          errorMessage = error.message;
          break;
      }
      Alert.alert("❌ Error de Registro", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image source={require("../assets/logi/1.png")} style={styles.logo} />

         
          <Text style={styles.subtitle}>Regístrate aquí</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={nombre}
            onChangeText={setNombre}
          />

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#5c8f56" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={registerUser}>
            <Text style={styles.buttonText}>Crear Cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  logo: { width: 500, height: 120, marginBottom: 20, borderRadius: 60 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "#1d2570" },
  subtitle: { fontSize: 18, marginBottom: 30 },
  input: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#71b26c",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#71b26c",
    paddingHorizontal: 10,
  },
  passwordInput: { flex: 1, padding: 12 },
  button: {
    backgroundColor: "#5c8f56",
    padding: 15,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { color: "#1d2570", textDecorationLine: "underline" },
});
