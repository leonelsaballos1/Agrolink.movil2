import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCgRip-vOzkAVB9l4w-hoIZcm_zr3mAGaw",
  authDomain: "agriges-432cb.firebaseapp.com",
  databaseURL: "https://agriges-432cb-default-rtdb.firebaseio.com",
  projectId: "agriges-432cb",
  storageBucket: "agriges-432cb.appspot.com",
  messagingSenderId: "397829479377",
  appId: "1:397829479377:web:7a0b3181be45b603fb9ef0",
  measurementId: "G-XQ5BDMQ5GG",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
