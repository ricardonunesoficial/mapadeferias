# 🔐 Configuração Firebase Authentication

## ✅ Passos para Ativar Autenticação

### 1️⃣ **Aceder ao Firebase Console**
1. Ir para [Firebase Console](https://console.firebase.google.com/)
2. Selecionar o projeto **mapaferias-12a59**

### 2️⃣ **Ativar Authentication**
1. No menu lateral, clicar em **"Authentication"**
2. Clicar em **"Get Started"** (se for a primeira vez)
3. Ir para a aba **"Sign-in method"**

### 3️⃣ **Ativar Email/Password**
1. Clicar em **"Email/Password"**
2. Ativar a primeira opção: **"Email/Password"** ✅
3. (Opcional) Ativar **"Email link (passwordless sign-in)"**
4. Clicar em **"Save"**

### 4️⃣ **Ativar Google Sign-In**
1. Clicar em **"Google"**
2. Ativar o toggle ✅
3. Selecionar um **"Project support email"** (seu email)
4. Clicar em **"Save"**

### 5️⃣ **Configurar Domínio Autorizado**
1. Na mesma página "Sign-in method"
2. Rolar até **"Authorized domains"**
3. Por padrão já inclui:
   - `localhost`
   - `mapaferias-12a59.firebaseapp.com`
   - `mapaferias-12a59.web.app`
4. Se usar domínio customizado, adicionar aqui

### 6️⃣ **Criar Primeiro Utilizador (Opcional)**
1. Ir para a aba **"Users"**
2. Clicar em **"Add user"**
3. Inserir:
   - Email: `joao.coelho@auchan.pt` (exemplo)
   - Password: criar uma password forte
4. Clicar em **"Add user"**

---

## 🎯 Funcionalidades Implementadas

### ✅ **Login com Email/Password**
- Criação de conta
- Login existente
- Validação de erros em português

### ✅ **Login com Google**
- One-click Google Sign-In
- Avatar automático do Google

### ✅ **Proteção de Rotas**
- Tela de login aparece automaticamente
- Só acede ao mapa após autenticação
- Dados sincronizados por utilizador autenticado

### ✅ **Logout Seguro**
- Botão de logout no header
- Confirmação antes de sair

---

## 🔒 Regras de Segurança Firestore

### **IMPORTANTE**: Atualizar Regras de Segurança

1. No Firebase Console, ir para **"Firestore Database"**
2. Clicar na aba **"Rules"**
3. Substituir por estas regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita apenas para utilizadores autenticados
    match /ferias/{ano} {
      allow read, write: if request.auth != null;
    }
    
    // (Opcional) Se quiser restringir por email específico:
    // match /ferias/{ano} {
    //   allow read, write: if request.auth != null && 
    //     (request.auth.token.email.matches('.*@auchan.pt') ||
    //      request.auth.token.email.matches('.*@closer.pt'));
    // }
  }
}
```

4. Clicar em **"Publish"**

---

## 🧪 Testar Autenticação

### **Criar Conta**
1. Abrir `index.html` no browser
2. Clicar em **"Criar nova conta"**
3. Inserir email e password (mín. 6 caracteres)
4. Clicar em **"✨ Criar Conta"**

### **Login com Google**
1. Clicar em **"Continuar com Google"**
2. Selecionar conta Google
3. Autorizar acesso

### **Logout**
1. No header, ao lado das estatísticas, aparece:
   - Avatar do utilizador
   - Email
   - Botão **"🚪 Sair"**
2. Clicar em **"🚪 Sair"** → Confirmar

---

## 🎨 UI Implementada

### **Tela de Login**
- Fundo gradiente roxo/azul
- Formulário centralizado
- Campos email + password
- Botão "Entrar" / "Criar Conta"
- Divisor "ou"
- Botão Google com logo oficial
- Toggle "Criar nova conta" / "Já tenho conta"
- Mensagens de erro em português

### **Header após Login**
- Avatar redondo (Google photo ou inicial do email)
- Email do utilizador
- Botão "🚪 Sair" com confirmação

---

## 🐛 Tratamento de Erros

| Código Firebase | Mensagem PT |
|----------------|-------------|
| `auth/invalid-email` | Email inválido |
| `auth/user-not-found` | Utilizador não encontrado |
| `auth/wrong-password` | Password incorreta |
| `auth/email-already-in-use` | Email já registado |
| `auth/weak-password` | Password muito fraca (mín. 6 caracteres) |
| `auth/invalid-credential` | Email ou password inválidos |

---

## 📱 Responsivo

- ✅ Desktop (form 400px max-width)
- ✅ Mobile (90% width, botões full-width)
- ✅ Tablet (adaptativo)

---

## 🚀 Próximos Passos (Opcionais)

### **1. Email Verification**
```javascript
// Após criar conta
await sendEmailVerification(user);
```

### **2. Password Reset**
```javascript
import { sendPasswordResetEmail } from "firebase/auth";
await sendPasswordResetEmail(auth, email);
```

### **3. Perfis de Utilizador**
- Guardar nome completo
- Foto personalizada
- Preferências

### **4. Roles/Permissões**
- Admin: edita tudo
- User: só edita próprias férias
- Viewer: só visualiza

---

## ✅ Checklist Final

- [ ] Ativar Email/Password no Firebase Console
- [ ] Ativar Google Sign-In no Firebase Console
- [ ] Atualizar regras Firestore (autenticação obrigatória)
- [ ] Testar criação de conta
- [ ] Testar login com email
- [ ] Testar login com Google
- [ ] Testar logout
- [ ] Verificar proteção de dados (sem auth não acede)

---

**Versão**: 3.0 (Firebase Authentication)  
**Data**: 04 Fev 2026  
**Status**: ✅ Pronto para Produção
