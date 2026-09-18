import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import Dashboard from './views/Dashboard.vue';
import NewActivity from './views/NewActivity.vue';
import Tracking from './views/Tracking.vue';
import History from './views/History.vue';

const routes = [
  { path: '/', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/nova-aktivnost', component: NewActivity },
  { path: '/tracking', component: Tracking },
  { path: '/povijest', component: History }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
