import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

export async function initFirebase() {
  try {
    // Carrega config protegida (.gitignore) localizada na pasta Dev
    const response = await fetch('./firebase-config.json');
    if (!response.ok) {
      throw new Error('Não foi possível carregar firebase-config.json');
    }
    const config = await response.json();
    
    const app = initializeApp(config);
    
    // Globais para compatibilidade com o main.js que usará window.db
    window.db = getFirestore(app);
    window.auth = getAuth(app);
    window.googleProvider = new GoogleAuthProvider();
    window.googleProvider.addScope('email');
    
    // Funções do Firestore disponíveis globalmente (necessário no main.js)
    window.doc = doc;
    window.getDoc = getDoc;
    window.setDoc = setDoc;
    window.onSnapshot = onSnapshot;
    
    console.log('✅ Firebase inicializado com sucesso (v12.8.0)!');
    return { app, db: window.db, auth: window.auth };
  } catch (error) {
    console.error('❌ Erro Firebase:', error);
    throw error;
  }
}
