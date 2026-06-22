const firebaseConfig = {
    apiKey: "AIzaSyDt5rsW7x_36uhhWsPiiamYsHy5QQBFbs8",
    authDomain: "pixel-quest-b83fc.firebaseapp.com",
    projectId: "pixel-quest-b83fc",
    storageBucket: "pixel-quest-b83fc.firebasestorage.app",
    messagingSenderId: "725397344283",
    appId: "1:725397344283:web:3b9a27e2757bcc6239a8be"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
