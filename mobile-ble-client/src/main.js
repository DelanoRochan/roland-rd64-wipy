import Vue from "vue";
import Vuex from "vuex";

import App from "./App.vue";
import Router from "vue-router";
import Home from "./pages/Home.vue";
import About from "./pages/About.vue";
import CustomToolbar from "./partials/CustomToolbar.vue";

import VuexStore from "./store/index";
import { sync } from "vuex-router-sync";

Vue.use(Vuex);
Vue.use(Router);

import "onsenui/css/onsenui.css";
import "./css/onsen-css-components.css";
import "./css/theme.css";
import VueOnsen from "vue-onsenui";
Vue.use(VueOnsen);
Vue.component("custom-toolbar", CustomToolbar);

export const strict = false;

const store = new Vuex.Store(VuexStore);

const router = new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/about",
      name: "about",
      component: About
    }
  ]
});
router.replace({ path: "", redirect: "/" });

import "es6-promise/auto";

Vue.config.productionTip = false;
Vue.config.ignoredElements = [/^ion-/];

sync(store, router);

import { Plugins } from "@capacitor/core";
async function getDeviceInfo() {
  let q = await Plugins.Device.getInfo();
  store.dispatch("updateSystemInfo", q);
}
getDeviceInfo();

new Vue({
  router: router,
  store: store,
  render: h => h(App)
}).$mount("#app");
