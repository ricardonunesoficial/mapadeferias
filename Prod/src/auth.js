import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { showApp, showLogin } from './main.js';

export async function initAuth() {
  onAuthStateChanged(window.auth, (user) => {
    console.log('🔐 Auth state:', user ? 'LOGGED IN' : 'LOGGED OUT');
    if (user) {
      window.currentUser = user;
      showApp(user);
    } else {
      window.currentUser = null;
      showLogin();
    }
  });

  // Exportar funções para window porque o index.html usa variáveis inline (onclick=)
  window.signInWithEmailAndPassword = signInWithEmailAndPassword;
  window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
  window.signInWithPopup = signInWithPopup;
  window.signOut = signOut;
  window.sendPasswordResetEmail = sendPasswordResetEmail;
}

window.isSignUpMode = false;

window.handleEmailAuth = async function() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    window.showAuthError('Preencha email e password');
    return;
  }
  
  try {
    if (window.isSignUpMode) {
      await window.createUserWithEmailAndPassword(window.auth, email, password);
    } else {
      await window.signInWithEmailAndPassword(window.auth, email, password);
    }
  } catch (error) {
    let message = 'Erro na autenticação';
    if (error.code === 'auth/invalid-email') message = 'Email inválido';
    else if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado';
    else if (error.code === 'auth/wrong-password') message = 'Password incorreta';
    else if (error.code === 'auth/email-already-in-use') message = 'Email já registado';
    else if (error.code === 'auth/weak-password') message = 'Password muito fraca (mín. 6 caracteres)';
    else if (error.code === 'auth/invalid-credential') message = 'Email ou password inválidos';
    window.showAuthError(message);
  }
};

window.handleGoogleAuth = async function() {
  try {
    await window.signInWithPopup(window.auth, window.googleProvider);
  } catch (error) {
    console.error(error);
    window.showAuthError('Erro ao autenticar com Google');
  }
};

window.handleLogout = async function() {
  if (confirm('Deseja realmente sair?')) {
    try {
      await window.signOut(window.auth);
    } catch (error) {
      alert('Erro ao fazer logout');
    }
  }
};

window.showAuthError = function(message) {
  const errorEl = document.getElementById('auth-error');
  errorEl.textContent = message;
  errorEl.classList.add('active');
  setTimeout(() => errorEl.classList.remove('active'), 5000);
};

window.toggleAuthMode = function() {
  window.isSignUpMode = !window.isSignUpMode;
  const submitBtn = document.getElementById('auth-submit-btn');
  const toggleText = document.getElementById('auth-toggle');
  
  if (window.isSignUpMode) {
    submitBtn.innerHTML = '✨ Criar Conta';
    toggleText.textContent = 'Já tenho conta';
  } else {
    submitBtn.innerHTML = '🔑 Entrar';
    toggleText.textContent = 'Criar nova conta';
  }
};

window.showResetModal = function() {
  const emailValue = document.getElementById('email').value.trim();
  document.getElementById('reset-email').value = emailValue;
  document.getElementById('reset-feedback').className = 'reset-feedback';
  document.getElementById('reset-modal').classList.add('active');
};

window.closeResetModal = function() {
  document.getElementById('reset-modal').classList.remove('active');
};

window.handlePasswordReset = async function() {
  const email = document.getElementById('reset-email').value.trim();
  const feedback = document.getElementById('reset-feedback');
  
  if (!email) {
    feedback.className = 'reset-feedback error';
    feedback.textContent = 'Por favor, insira o seu email.';
    return;
  }
  
  try {
    await window.sendPasswordResetEmail(window.auth, email);
    feedback.className = 'reset-feedback success';
    feedback.textContent = 'Email enviado com sucesso! Verifique a sua caixa de entrada e spam.';
    setTimeout(window.closeResetModal, 4000);
  } catch (error) {
    let message = 'Erro ao enviar email de recuperação.';
    if (error.code === 'auth/invalid-email') message = 'Email inválido.';
    feedback.className = 'reset-feedback error';
    feedback.textContent = message;
  }
};
