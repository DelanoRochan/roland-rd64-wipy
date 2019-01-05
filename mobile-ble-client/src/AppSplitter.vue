<template>
  <v-ons-page>
    <v-ons-splitter>
      <!-- <v-ons-splitter-side swipeable side="right" collapse="" width="260px" :animation="$ons.platform.isAndroid() ? 'overlay' : 'reveal'"
        :open.sync="isOpen"
      >
      </v-ons-splitter-side> -->

      <v-ons-splitter-content>
        <app-tabbar
          :page-stack="pageStack"
          :set-options="setOptions"
          :toggle-menu="toggleMenu"
          :set-index="setIndex"
        ></app-tabbar>
      </v-ons-splitter-content>
    </v-ons-splitter>
  </v-ons-page>
</template>

<script>
import AppTabbar from "./AppTabbar.vue";

export default {
  props: ["pageStack", "setOptions"],
  data() {
    return {
      isOpen: false
    };
  },
  computed: {
    tabbarIndex: function() {
      return this.$store.state.tabbar.index - 1;
    }
  },
  created: function() {
    console.log(this.$store.state.tabbar.index - 1);
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen;
    },
    setIndex(newValue) {
      if (newValue !== undefined) {
        // this.tabbarIndex = newValue;
        this.$store.commit("tabbar/set", newValue + 1);
      }
      return this.tabbarIndex;
    }
  },
  components: { AppTabbar }
};
</script>

<style>
ons-splitter-side[animation="overlay"] {
  border-left: 1px solid #bbb;
}
</style>
