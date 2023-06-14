// Import the functions you need from the SDKs you need
import * as firebase from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApQL6vxY1dJ1frpEG6x8wgBan5U5zylZE",
  authDomain: "blog-website-f854e.firebaseapp.com",
  databaseURL: "https://blog-website-f854e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "blog-website-f854e",
  storageBucket: "blog-website-f854e.appspot.com",
  messagingSenderId: "1006994120199",
  appId: "1:1006994120199:web:22f0b21f42dad8a6b754a2"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const db = getFirestore()
export const auth = getAuth()