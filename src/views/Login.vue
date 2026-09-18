<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Activity Tracker</h1>
      <p>Prijavite se putem svog Google računa kako biste pratili rute, brzinu i povijest svojih aktivnosti.</p>
      
      <button @click="loginWithGoogle" class="google-btn">
        <img src="https://wikimedia.org" alt="Google logo" />
        Prijavi se putem Gmaila
      </button>
    </div>
  </div>
</template>

<script setup>
// SVE IMPORT NAREDBE MORAJU BITI OVDJE, NA SAMOM VRHU SCRIPT DIJELA
import { auth, provider, signInWithPopup } from '../firebase';
import { useRouter } from 'vue-router'; 

const router = useRouter(); 

const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Uspješna prijava korisnika:", user.displayName);
    
    // Preusmjeravanje na Dashboard nakon uspješne prijave
    router.push('/dashboard');
  } catch (error) {
    console.error("Greška pri prijavi:", error.message);
    alert("Prijava nije uspjela. Pokušajte ponovno.");
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: sans-serif;
  margin: 0;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

h1 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 700;
}

p {
  color: #4b5563;
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.5;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.google-btn:hover {
  background-color: #f9fafb;
}

.google-btn img {
  width: 20px;
  height: 20px;
}
</style>
