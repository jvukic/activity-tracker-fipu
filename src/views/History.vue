<template>
  <div class="dashboard-layout">
    <aside class="left-blue-bar">
      <div class="sidebar-top">
        <h2 class="brand-title">Activity Tracker</h2>
        <nav class="sidebar-nav">
          <router-link to="/dashboard" class="nav-item">Početna</router-link>
          <router-link to="/nova-aktivnost" class="nav-item">Nova Aktivnost</router-link>
          <router-link to="/povijest" class="nav-item active">Povijest</router-link>
        </nav>
      </div>
      <div class="sidebar-footer">
        <span class="user-email">{{ userEmail }}</span>
        <button @click="handleLogout" class="logout-btn">Odjava</button>
      </div>
    </aside>

    <main class="dashboard-main">
      <div class="dashboard-content">
        <section class="history-section">
          <h3 class="history-title">Moja Povijest Aktivnosti</h3>
          <p class="click-tip">💡 Klikni na aktivnost u tablici za prikaz rute na karti.</p>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Aktivnost</th>
                  <th>Udaljenost</th>
                  <th>Trajanje</th>
                  <th>Prosječna brzina</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(act, index) in activities" 
                  :key="index" 
                  @click="selectActivity(act)"
                  :class="['clickable-row', { 'selected-row': selectedActivityId === act.id }]"
                >
                  <td>{{ act.type === 'cycling' ? '🚴 Vožnja bicikla' : '🚶 Hodanje' }}</td>
                  <td>{{ act.distance.toFixed(2) }} km</td>
                  <td>{{ formatDuration(act.duration) }}</td>
                  <td>{{ act.avgSpeed }} km/h</td>
                  <td>{{ act.date }}</td>
                </tr>
                <tr v-if="activities.length === 0">
                  <td colspan="5" class="no-data">Nema zabilježenih aktivnosti.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="map-section">
          <div id="history-map" class="map-container"></div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth, db, collection, getDocs, query, where } from '../firebase';
import { useRouter } from 'vue-router';
import L from 'leaflet';

const router = useRouter();
const userEmail = ref('');
const activities = ref([]);
const selectedActivityId = ref(null);

let map = null;
let historyPolyline = null;

onMounted(async () => {
  if (auth.currentUser) {
    userEmail.value = auth.currentUser.email || '';
    initMap();
    await loadHistory();
  } else {
    router.push('/');
  }
});

const initMap = () => {
  map = L.map('history-map', { zoomControl: true, tap: false }).setView([45.1578, 18.7011], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  historyPolyline = L.polyline([], { color: '#ef4444', weight: 6 }).addTo(map);
};

const loadHistory = async () => {
  try {
    const q = query(collection(db, "activities"), where("userId", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    const loaded = [];
    
    querySnapshot.forEach((doc) => {
      loaded.push({ id: doc.id, ...doc.data() });
    });

    loaded.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
    activities.value = loaded;

    if (loaded.length > 0) {
      selectActivity(loaded[0]);
    }
  } catch (error) {
    console.error(error);
  }
};

const selectActivity = (act) => {
  selectedActivityId.value = act.id;
  if (!map || !act.routePath || act.routePath.length === 0) {
    historyPolyline.setLatLngs([]);
    return;
  }

  // POPRAVLJENO: Točna pretvorba teksta natrag u Leaflet brojeve koordinata
  const parsedPath = act.routePath.map(str => {
    const parts = str.split(',');
    return [parseFloat(parts[0]), parseFloat(parts[1])];
  });

  historyPolyline.setLatLngs(parsedPath);
  historyPolyline.setStyle({ color: act.type === 'cycling' ? '#3b82f6' : '#10b981' });
  
  const bounds = L.latLngBounds(parsedPath);
  map.fitBounds(bounds, { padding: [30, 30] });
};

const formatDuration = (totalSeconds) => {
  if (!totalSeconds) return '00:00';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return hrs > 0 ? `${hrs}h ${mins}m ${secs}s` : `${mins}m ${secs}s`;
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
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f3f4f6; font-family: sans-serif; }
.left-blue-bar { width: 240px; background-color: #1e3a8a; color: white; display: flex; flex-direction: column; justify-content: space-between; padding: 2rem 1.5rem; box-sizing: border-box; box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); }
.brand-title { font-size: 1.4rem; margin: 0 0 2.5rem 0; font-weight: bold; }
.sidebar-nav { display: flex; flex-direction: column; gap: 1.2rem; }
.nav-item { color: #93c5fd; text-decoration: none; font-size: 1.1rem; font-weight: 600; transition: color 0.2s; }
.nav-item:hover, .nav-item.active { color: #ffffff; }
.sidebar-footer { border-top: 1px solid #3b82f6; padding-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.user-email { font-size: 0.9rem; color: #cbd5e1; word-break: break-all; }
.logout-btn { background-color: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; text-align: center; }
.dashboard-main { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 2rem; }
.dashboard-content { max-width: 900px; width: 100%; display: flex; flex-direction: column; gap: 2rem; }
.history-section, .map-section { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
.history-title { margin: 0 0 0.5rem 0; color: #374151; font-size: 1.1rem; font-weight: 600; }
.click-tip { font-size: 0.85rem; color: #6b7280; margin: 0 0 1rem 0; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: 10px; color: #4b5563; border-bottom: 2px solid #e5e7eb; font-size: 0.9rem; }
td { padding: 12px 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 0.95rem; }
.clickable-row { cursor: pointer; transition: background 0.2s; }
.clickable-row:hover { background: #f1f5f9; }
.selected-row { background: #e2e8f0; font-weight: bold; }
.no-data { text-align: center; color: #9ca3af; padding: 2rem 0; }
.map-container { height: 350px; width: 100%; background-color: #cbd5e1; border-radius: 12px; border: 1px solid #e5e7eb; position: relative; overflow: hidden; z-index: 1; }
@media (max-width: 768px) { .dashboard-layout { flex-direction: column; } .left-blue-bar { width: 100%; padding: 1rem; } .brand-title { margin-bottom: 1rem; text-align: center; } .sidebar-nav { flex-direction: row; justify-content: center; gap: 1.5rem; } .sidebar-footer { display: none; } }
</style>
