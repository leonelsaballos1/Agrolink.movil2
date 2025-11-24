// App.js
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AntDesign, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";

// 🔹 Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./BasedeDatos/Firebase";

// 🔹 Pantallas de autenticación
import LoginScreen from "./Screens/LoginScreen";
import RegisterScreen from "./Screens/RegisterScreen";

// 🔹 Pantallas principales
import Home from "./Screens/Home";
import ListarClientes from "./Screens/ListarClientes";
import RegistrarCliente from "./Screens/RegistrarCliente";
import ListarClientesMinimal from "./Screens/ListarClientesMinimal";
import Misdatos from "./Screens/Misdatos";
import AgregarDatos from "./Screens/AgregarDatos";
import TecnicoAgricolas from "./Screens/TecnicoAgricolas";
import Mapa from "./Screens/Mapa";
import ChatBot from "./Screens/ChatBot";
import Capacitacion from "./Screens/Capacitacion";
import AgregarCapacitacion from "./Screens/AgregarCapacitacion";
import AgricultoresAsociados from "./Screens/AgricultoresAsociados";
import Publicidad from "./Screens/Publicidad";


// 🔹 Navegadores
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

/* ================================
   OPCIONES GLOBALES DE HEADER
================================= */
const defaultHeaderOptions = {
  headerStyle: {
    backgroundColor: "#fff", // Fondo blanco
    height: 10, // Más fino pero aceptado por React Navigation
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 0, // Quitar sombra en Android
    shadowOpacity: 0, // Quitar sombra en iOS
    shadowOffset: { width: 0, height: 0 },
    borderBottomWidth: 0, // Quitar línea inferior
  },
  headerTitle: "", // Sin título
  headerTitleStyle: {
    fontSize: 0,
    margin: 0,
    padding: 0,
  },
  headerShadowVisible: false, // Quitar sombra extra
  headerTintColor: "#000",
};


/* ================================
   STACKS INTERNOS
================================= */

// 📌 Stack Home
function StackDetailHome() {
  return (
    <Stack.Navigator screenOptions={defaultHeaderOptions}>
      <Stack.Screen name="Home" component={Home} />
       <Stack.Screen name="ListarClientes" component={ListarClientes} />
      <Stack.Screen name="RegistrarCliente" component={RegistrarCliente} />
      <Stack.Screen name="Técnicos Agrícolas" component={TecnicoAgricolas} />
      <Stack.Screen name="Mapa" component={Mapa} />
      <Stack.Screen name="ChatBot" component={ChatBot} />
      <Stack.Screen name="Publicidad" component={Publicidad} />
      <Stack.Screen name="Capacitacion" component={Capacitacion} />
      <Stack.Screen name="AgregarCapacitacion" component={AgregarCapacitacion} />
      <Stack.Screen name="AgricultoresAsociados" component={AgricultoresAsociados} />

    </Stack.Navigator>
  );
}

// 📌 Stack Clientes
function StackClientes() {
  return (
    <Stack.Navigator screenOptions={defaultHeaderOptions}>
      <Stack.Screen name="ListarClientesMinimal" component={ListarClientesMinimal} />
      <Stack.Screen name="ListarClientes" component={ListarClientes} />
     <Stack.Screen name="RegistrarCliente" component={RegistrarCliente} />
    </Stack.Navigator>
  );
}

// 📌 Stack Datos
function StackDatos() {
  return (
    <Stack.Navigator screenOptions={defaultHeaderOptions}>
      <Stack.Screen name="Misdatos" component={Misdatos} />
      <Stack.Screen name="AgregarDatos" component={AgregarDatos} />
    </Stack.Navigator>
  );
}

/* ================================
   DRAWER (opcional)
================================= */
function DrawerInsideHome() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Inicio" component={Home} />
      <Drawer.Screen name="Técnicos Agrícolas" component={TecnicoAgricolas} />
      <Drawer.Screen name="Mapa" component={Mapa} />
    </Drawer.Navigator>
  );
}

/* ================================
   TABS PRINCIPALES
================================= */
function MyTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        tabBarActiveTintColor: "green",
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={StackDetailHome}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color }) => <AntDesign name="home" size={28} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cultivos"
        component={StackClientes}
        options={{
          tabBarLabel: "Cultivos",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="seed" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={StackDatos}
        options={{
          tabBarLabel: "Mi Perfil",
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={28} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

/* ================================
   APP PRINCIPAL CON LOGIN
================================= */
export default function App() {
  const [user, setUser] = useState(null);

  // 🔹 Control de sesión con Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {
      setUser(usuarioFirebase);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
     <Stack.Navigator screenOptions={{ headerShown: false }}>
  {user ? (
    // Usuario logueado
    <Stack.Screen name="Main" component={MyTabs} />
  ) : (
    // Usuario no logueado
    <>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </>
  )}
</Stack.Navigator>

    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

// npx expo start -c