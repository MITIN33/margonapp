import auth from '@react-native-firebase/auth';
import app from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';

// const firebaseConfig = {
//     apiKey: "AIzaSyC1nJ19aoo0yWsjL6MVJgXIDPeWSFyN9Ng",
//     authDomain: "margon-88f5e.firebaseapp.com",
//     databaseURL: "https://margon-88f5e.firebaseio.com",
//     projectId: "margon-88f5e",
//     storageBucket: "margon-88f5e.appspot.com",
//     messagingSenderId: "636753173753",
//     appId: "1:636753173753:android:8a847b792d1d01b0d59628"
// };


const firebaseApp = app.app();
const firebaseAuth = auth();
const firebaseStorage = storage();
export { firebaseApp };