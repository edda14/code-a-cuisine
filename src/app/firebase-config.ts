import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyC_sUgLeti2-QFl2ViJ4mUD7gQuEGEni_w",
    authDomain: "code-a-cuisine-2b41b.firebaseapp.com",
    projectId: "code-a-cuisine-2b41b",
    storageBucket: "code-a-cuisine-2b41b.firebasestorage.app",
    messagingSenderId: "808870650752",
    appId: "1:808870650752:web:4326f041a49d0ca6631765"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);