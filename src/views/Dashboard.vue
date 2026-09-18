<template>
  <div class="dashboard-layout">
    
    <aside class="left-blue-bar">
      <div class="sidebar-top">
        <h2 class="brand-title">Activity Tracker</h2>
        <nav class="sidebar-nav">
          <router-link to="/dashboard" class="nav-item active">Početna</router-link>
          <router-link to="/nova-aktivnost" class="nav-item">Nova Aktivnost</router-link>
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
        
        <section class="weekly-stats">
          <h3 class="stats-title">Aktivnost ovaj tjedan</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Udaljenost</span>
              <span class="stat-value">{{ weeklyDistance.toFixed(1) }} <small>km</small></span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Vrijeme</span>
              <span class="stat-value">{{ weeklyTime }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Prosječna brzina</span>
              <span class="stat-value">{{ weeklyAvgSpeed.toFixed(1) }} <small>km/h</small></span>
            </div>
          </div>
        </section>

        <div class="welcome-box">
          <h3>Pozdrav, {{ userName }}! 👋</h3>
          <p>Pregledaj svoju tjednu statistiku ili odaberi "Nova Aktivnost" u izborniku za pokretanje praćenja.</p>
        </div>

      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth, db, collection, getDocs, query, where } from '../firebase';
import { useRouter } from 'vue-router';

const router = useRouter();

const userName = ref('');
const userEmail = ref('');

const weeklyDistance = ref(0.0);
const weeklyTime = ref('0h 00m');
const weeklyAvgSpeed = ref(0.0);

onMounted(async () => {
  if (auth.currentUser) {
    userName.value = auth.currentUser.displayName || 'Korisnik';
    userEmail.value = auth.currentUser.email || '';
    await fetchWeeklyStats();
  } else {
    router.push('/');
  }
});

const fetchWeeklyStats = async () => {
  try {
    const q = query(
      collection(db, "activities"),
      where("userId", "==", auth.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    let totalKm = 0;
    let totalSeconds = 0;
    let speedSum = 0;
    let count = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalKm += data.distance || 0;
      totalSeconds += data.duration || 0;
      speedSum += data.avgSpeed || 0;
      count++;
    });

    weeklyDistance.value = totalKm;
    
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    weeklyTime.value = `${hrs}h ${mins.toString().padStart(2, '0')}m`;
    
    if (count > 0) {
      weeklyAvgSpeed.value = speedSum / count;
    } else {
      weeklyAvgSpeed.value = 0;
    }
  } catch (error) {
    console.error(error);
  }
};

const handleLogout = async () => {
  try {
    const { signOut } = await import('../firebase');
    await signOut(auth);
    router.push('/');
  } catch (error) {
    console.error(error);
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

.weekly-stats {
  margin-bottom: 2rem;
}

.stats-title {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
}

.stats-grid {
  display: flex;
  gap: 1rem;
}

.stat-card {
  flex: 1;
  background: white;
  padding: 1.25rem 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e5e7eb;
}

.stat-label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #111827;
}

.stat-value small {
  font-size: 0.9rem;
  font-weight: normal;
  color: #6b7280;
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
  .stats-grid {
    flex-direction: column;
  }
}
</style>
