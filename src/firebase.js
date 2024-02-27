import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0lE9add6J46CXfBiMeNcaQtZfunI5zL4",
  authDomain: "orvitasks.firebaseapp.com",
  projectId: "orvitasks",
  storageBucket: "orvitasks.appspot.com",
  messagingSenderId: "744362357675",
  appId: "1:744362357675:web:0ee928ae799cad340d58ee"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export default firebase;