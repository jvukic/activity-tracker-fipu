<template>
  <div class="dashboard-layout">
    
    <aside class="left-blue-bar">
      <div class="sidebar-top">
        <h2 class="brand-title">Activity Tracker</h2>
        <nav class="sidebar-nav">
          <router-link to="/dashboard" class="nav-item">Početna</router-link>
          <router-link to="/nova-aktivnost" class="nav-item active">Nova Aktivnost</router-link>
          <router-link to="/povijest" class="nav-item">Povijest</router-link>
        </nav>
      </div>
      
      <div class="sidebar-footer">
        <span class="user-email">{{ userEmail }}</span>
        <button @click="handleLogout" class="logout-btn">Odjava</button>
      </div>
    </aside>
    
    <main class="dashboard-main">
      <div class="dashboard-content">
        
        <div class="welcome-box">
          <h3>Nova Aktivnost</h3>
          <p>Klikni na gumb ispod kako bi započeo s praćenjem kretanja.</p>
        </div>

        <div class="center-action">
          <button @click="openModal" class="btn-main-action">
            ZAPOČNI AKTIVNOST
          </button>
        </div>
        
      </div>
    </main>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <h3>Odaberi vrstu aktivnosti</h3>
        <p>Aplikacija će mjeriti tvoju brzinu, udaljenost i rutu.</p>
        
        <div class="modal-options">
          <button @click="startActivity('walking')" class="modal-card">
            <span class="modal-icon">🚶‍♂️</span>
            <h4>Hodanje</h4>
          </button>

          <button @click="startActivity('cycling')" class="modal-card">
            <span class="modal-icon">🚴‍♂️</span>
            <h4>Biciklizam</h4>
          </button>
        </div>

        <button @click="closeModal" class="btn-close-modal">Zatvori</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth, signOut } from '../firebase';
import { useRouter } from 'vue-router';

const router = useRouter();
const userEmail = ref('');
const showModal = ref(false);

onMounted(() => {
  if (auth.currentUser) {
    userEmail.value = auth.currentUser.email || '';
  } else {
    router.push('/');
  }
});

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const startActivity = (type) => {
  closeModal();
  router.push({ path: '/tracking', query: { type: type } });
};

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/');
  } catch (error) {
    console.error("Greška pri odjavi:", error);
  }
};
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: sans-serif;
}

.left-blue-bar {
  width: 240px;
  background-color: #1e3a8a;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.brand-title {
  font-size: 1.4rem;
  margin: 0 0 2.5rem 0;
  font-weight: bold;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.nav-item {
  color: #93c5fd;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
  transition: color 0.2s;
}

.nav-item:hover, .nav-item.active {
  color: #ffffff;
}

.sidebar-footer {
  border-top: 1px solid #3b82f6;
  padding-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-email {
  font-size: 0.9rem;
  color: #cbd5e1;
  word-break: break-all;
}

.logout-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  text-align: center;
}

.dashboard-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.dashboard-content {
  max-width: 600px;
  width: 100%;
}

.welcome-box {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.welcome-box h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.welcome-box p {
  margin: 0;
  color: #6b7280;
}

.center-action {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.btn-main-action {
  background-color: #1e3a8a;
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  padding: 20px 40px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(30, 58, 138, 0.3);
  transition: transform 0.2s, background-color 0.2s;
}

.btn-main-action:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-box {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  max-width: 450px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-box h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.modal-box p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.modal-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modal-card {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-card:hover {
  background: #f1f5f9;
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.modal-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.modal-card h4 {
  margin: 0;
  color: #334155;
}

.btn-close-modal {
  background: none;
  border: none;
  color: #64748b;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
}

.btn-close-modal:hover {
  color: #334155;
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }
  .left-blue-bar {
    width: 100%;
    padding: 1rem;
  }
  .brand-title {
    margin-bottom: 1rem;
    text-align: center;
  }
  .sidebar-nav {
    flex-direction: row;
    justify-content: center;
    gap: 1.5rem;
  }
  .sidebar-footer {
    display: none;
  }
  .modal-options {
    flex-direction: column;
  }
}
</style>
