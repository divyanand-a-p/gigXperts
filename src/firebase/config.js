import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration (as you provided)
const firebaseConfig = {
  apiKey: "AIzaSyCJqBSK_xuQYMBmD5s5v-trAnnH10NMcZA",
  authDomain: "gigxperts-46aee.firebaseapp.com",
  projectId: "gigxperts-46aee",
  storageBucket: "gigxperts-46aee.appspot.com",
  messagingSenderId: "63003889769",
  appId: "1:63003889769:web:f58319dbad2735cad692f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);




