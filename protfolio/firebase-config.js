// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB89CymUJyb5zwEqslc3cCzmL4druWDnyg",
  authDomain: "sarthak-reddy-prot.firebaseapp.com",
  projectId: "sarthak-reddy-prot",
  storageBucket: "sarthak-reddy-prot.firebasestorage.app",
  messagingSenderId: "105392287092",
  appId: "1:105392287092:web:e75f72a8a58c49ea765021"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);