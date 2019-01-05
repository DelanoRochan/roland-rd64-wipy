<template>
  <v-ons-page :style="swipePosition">
    <custom-toolbar :style="swipeTheme" modifier="white-content">
      {{ title }}
    </custom-toolbar>

    <v-ons-tabbar position="auto" swipeable
      :modifier="md ? 'autogrow white-content' : ''"
      :on-swipe="md ? onSwipe : null"
      :tabbar-style="swipeTheme"
      :tabs="tabs"
      :index.sync="index"
    ></v-ons-tabbar>
  </v-ons-page>
</template>

<script>
import Home from "./pages/Home.vue";
import About from "./pages/About.vue";

const lerp = (x0, x1, t) => parseInt((1 - t) * x0 + t * x1, 10);
const red = [244, 67, 54];
const black = [0, 0, 0];

export default {
  props: ["pageStack", "setOptions", "toggleMenu", "setIndex"],

  data() {
    return {
      colors: red,
      animationOptions: {},
      topPosition: 0,
      tabs: [
        {
          label: this.md ? "Set-up" : "Set-up",
          icon: null,
          page: Home,
          theme: black,
          props: { pageStack: this.pageStack },
          style: this.md ? { maxWidth: "80px" } : {},
          top: -105
        },
        {
          label: this.md ? "Configuration" : null,
          icon: this.md() ? null : "ion-edit",
          theme: black,
          page: About
        }
      ]
    };
  },

  methods: {
    md() {
      return this.$ons.platform.isAndroid();
    },
    onSwipe(index, animationOptions) {
      // Apply the same transition as ons-tabbar
      this.animationOptions = animationOptions;
      // Interpolate colors and top position
      const a = Math.floor(index),
        b = Math.ceil(index),
        ratio = index % 1;
      this.colors = this.colors.map((c, i) =>
        lerp(this.tabs[a].theme[i], this.tabs[b].theme[i], ratio)
      );
      this.topPosition = lerp(
        this.tabs[a].top || 0,
        this.tabs[b].top || 0,
        ratio
      );
    }
  },

  computed: {
    title() {
      return this.md() ? "RD-64 Control Center" : this.tabs[this.index].label;
    },
    index: {
      get() {
        return this.setIndex(); // Without args returns the current index
      },
      set(index) {
        this.setIndex(index);
      }
    },
    swipeTheme() {
      return (
        this.md && {
          backgroundColor: `rgb(${this.colors.join(",")})`,
          transition: `all ${this.animationOptions.duration || 0}s ${this
            .animationOptions.timing || ""}`
        }
      );
    },
    swipePosition() {
      return (
        this.md && {
          top: this.topPosition + "px",
          transition: `all ${this.animationOptions.duration || 0}s ${this
            .animationOptions.timing || ""}`
        }
      );
    }
  }
};
</script>

<style>
</style>
