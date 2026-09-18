<template>
  <div class="dashboard-layout">
    <aside class="left-blue-bar">
      <div class="sidebar-top">
        <h2 class="brand-title">Activity Tracker</h2>
        <nav class="sidebar-nav">
          <button @click="stopAndCancel" class="nav-item-btn">Odustani</button>
        </nav>
      </div>
      <div class="sidebar-footer">
        <span class="user-email">{{ userEmail }}</span>
      </div>
    </aside>
    <main class="dashboard-main">
      <div class="tracking-content">
        <div class="activity-title-box">
          <h2>Uživo praćenje: {{ activityType === 'walking' ? '🚶 Hodanje' : '🚴 Biciklizam' }}</h2>
        </div>
        <div class="live-stats-grid">
          <div class="live-card">
            <span class="live-label">UDALJENOST</span>
            <span class="live-value">{{ distance.toFixed(2) }} <small>km</small></span>
          </div>
          <div class="live-card">
            <span class="live-label">TRENUTNA BRZINA</span>
            <span class="live-value">{{ currentSpeed }} <small>km/h</small></span>
          </div>
          <div class="live-card">
            <span class="live-label">PROSJEČNA BRZINA</span>
            <span class="live-value">{{ avgSpeed }} <small>km/h</small></span>
          </div>
          <div class="live-card">
            <span class="live-label">VRIJEME</span>
            <span class="live-value">{{ formattedTime }}</span>
          </div>
        </div>
        <div id="map" class="map-container"></div>
        <div class="action-footer">
          <button @click="stopAndSave" class="btn-finish">ZAVRŠI I SPREMI</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth, db, collection, addDoc } from '../firebase';
import L from 'leaflet';

const route = useRoute();
const router = useRouter();

const userEmail = ref('');
const activityType = ref(route.query.type || 'walking');

const distance = ref(0);
const currentSpeed = ref(0);
const duration = ref(0);
const coordinates = ref([]);

let timerInterval = null;
let watchId = null;
let map = null;
let routeLine = null;
let marker = null;
let currentLat = 45.1578;
let currentLng = 18.7011;

const formattedTime = computed(() => {
  const hrs = Math.floor(duration.value / 3600).toString().padStart(2, '0');
  const mins = Math.floor((duration.value % 3600) / 60).toString().padStart(2, '0');
  const secs = (duration.value % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
});

const avgSpeed = computed(() => {
  if (duration.value === 0 || distance.value === 0) return '0.0';
  const hours = duration.value / 3600;
  return (distance.value / hours).toFixed(1);
});

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

onMounted(() => {
  if (auth.currentUser) {
    userEmail.value = auth.currentUser.email || '';
  } else {
    router.push('/');
    return;
  }

  map = L.map('map', { zoomControl: true, tap: false }).setView([currentLat, currentLng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  routeLine = L.polyline([], { color: '#1e3a8a', weight: 6 }).addTo(map);

  setTimeout(() => { if (map) map.invalidateSize(); }, 300);
  timerInterval = setInterval(() => { duration.value++; }, 1000);

  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition((position) => {
      const { latitude, longitude, speed: gpsSpeed } = position.coords;
      currentLat = latitude;
      currentLng = longitude;
      const newPoint = [latitude, longitude];

      currentSpeed.value = gpsSpeed && gpsSpeed > 0 ? (gpsSpeed * 3.6).toFixed(1) : 0;

      if (coordinates.value.length > 0) {
        const lastPoint = coordinates.value[coordinates.value.length - 1];
        const segmentDistance = calculateDistance(lastPoint, lastPoint, latitude, longitude);
        if (segmentDistance > 0.001) {
          distance.value += segmentDistance;
          coordinates.value.push(newPoint);
          routeLine.addLatLng(newPoint);
        }
      } else {
        coordinates.value.push(newPoint);
        routeLine.addLatLng(newPoint);
      }

      if (!marker) { marker = L.marker(newPoint).addTo(map); } else { marker.setLatLng(newPoint); }
      map.setView(newPoint);
    }, (error) => { console.error(error); }, { enableHighAccuracy: true, maximumAge: 0 });
  }
});

const stopGps = () => {
  if (timerInterval) clearInterval(timerInterval);
  if (watchId) navigator.geolocation.clearWatch(watchId);
};

const stopAndSave = async () => {
  stopGps();

  const finalPoints = coordinates.value.length > 0 ? coordinates.value : [[currentLat, currentLng]];
  const textRoutePath = finalPoints.map(p => {
    return String(p[0]) + "," + String(p[1]);
  });

  try {
    await addDoc(collection(db, "activities"), {
      userId: auth.currentUser.uid,
      type: activityType.value,
      distance: parseFloat(distance.value),
      duration: parseInt(duration.value),
      avgSpeed: parseFloat(avgSpeed.value),
      routePath: textRoutePath, 
      date: new Date().toLocaleDateString('hr-HR'),
      timestamp: new Date()
    });
    alert("Aktivnost je uspješno spremljena u povijest!");
    router.push('/povijest');
  } catch (error) {
    console.error(error);
    alert("Došlo je do pogreške kod spremanja: " + error.message);
    router.push('/dashboard');
  }
};

const stopAndCancel = () => {
  stopGps();
  router.push('/nova-aktivnost');
};

onUnmounted(() => stopGps());
</script>

<style scoped>
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f3f4f6; font-family: sans-serif; }
.left-blue-bar { width: 240px; background-color: #1e3a8a; color: white; display: flex; flex-direction: column; justify-content: space-between; padding: 2rem 1.5rem; box-sizing: border-box; }
.brand-title { font-size: 1.4rem; margin: 0 0 2.5rem 0; font-weight: bold; }
.nav-item-btn { background: #ef4444; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; }
.sidebar-footer { font-size: 0.9rem; color: #cbd5e1; }
.dashboard-main { flex: 1; padding: 2rem; display: flex; justify-content: center; }
.tracking-content { width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 1.5rem; }
.activity-title-box h2 { margin: 0; color: #1f2937; }
.live-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.live-card { background: white; padding: 1.5rem 1rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; align-items: center; border: 1px solid #e5e7eb; }
.live-label { font-size: 0.75rem; color: #6b7280; font-weight: bold; margin-bottom: 6px; }
.live-value { font-size: 1.6rem; font-weight: bold; color: #111827; }
.live-value small { font-size: 0.9rem; color: #6b7280; }
.map-container { height: 400px; width: 100%; background-color: #cbd5e1; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); position: relative; overflow: hidden; z-index: 1; }
.btn-finish { width: 100%; padding: 16px; background-color: #1e3a8a; color: white; border: none; border-radius: 8px; font-size: 1.3rem; font-weight: bold; cursor: pointer; }
@media (max-width: 768px) { .dashboard-layout { flex-direction: column; } .left-blue-bar { width: 100%; padding: 1rem; } .live-stats-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
