import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCVvp46lve0G1V04XThSjr6xz01BdYMoFg",
    authDomain: "website-2db65.firebaseapp.com",
    projectId: "website-2db65",
    storageBucket: "website-2db65.firebasestorage.app",
    messagingSenderId: "1098637183819",
    appId: "1:1098637183819:web:6e6ac266295ed4a53176ce",
    measurementId: "G-D0Z513QJDE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
