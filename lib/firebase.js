import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDAa1FouOkzvfc7L17ArWBE1DijjMECeVc",
  authDomain: "doit-3ecec.firebaseapp.com",
  projectId: "doit-3ecec",
  storageBucket: "doit-3ecec.firebasestorage.app",
  messagingSenderId: "777972655574",
  appId: "1:777972655574:web:0b2b5c14cf2d90c2637077",
  measurementId: "G-W7DFFXHNZ6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
