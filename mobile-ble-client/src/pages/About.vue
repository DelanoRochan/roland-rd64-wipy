<template>
  <v-ons-page>
<ons-list>
  <v-ons-list-header>General</v-ons-list-header>
      <ons-list-item>
        <label class="center" for="toggle-reverb">
          Reverb
        </label>
        <div class="right">
          <v-ons-switch input-id="toggle-reverb"
          v-model="reverbStatus"
            @change="reverbListener"
          >
          </v-ons-switch>
        </div>
      </ons-list-item>
      </ons-list>
      <ons-list>
      <v-ons-list-header>Octave and Tranpose</v-ons-list-header>
      <ons-list-item>
        <v-ons-button @click="transposeDown" style="margin: 6px 0">Tranpose Down</v-ons-button>
        <v-ons-button @click="transposeUp" style="margin: 6px 0; margin-left: 10px;">Tranpose Up</v-ons-button>
        <br/><v-ons-button @click="octaveDown" style="margin: 6px 0">Octave Down</v-ons-button>
        <v-ons-button @click="octaveUp" style="margin: 6px 0; margin-left: 10px;">Octave Up</v-ons-button>
      </ons-list-item>
<!-- 
      <ons-list-item>
        <label class="center" for="switch2">
          {{ switchOn ? 'Enabled switch' : 'Disabled switch' }}
        </label>
        <div class="right">
          <v-ons-switch input-id="switch2"
            :disabled="!switchOn"
          >
          </v-ons-switch>
        </div>
      </ons-list-item> -->

      
         <!-- <v-ons-list-header>Sound</v-ons-list-header>
       <ons-list-item>

    <section style="margin: 16px">
      <v-ons-segment style="width: 260px">
        <button>Var 1</button>
        <button>Var 2</button>
        <button>Var 3</button>
      </v-ons-segment>

    </section>
     </ons-list-item> -->
    </ons-list>
  </v-ons-page>
</template>

<script>
// @ is an alias to /src

export default {
  name: "about",
  components: {},
  created: function() {
    // window.setTimeout(() => {
    //   let q = this.$store.getters.getPianoState;
    //   q.reverb.value = false;
    //   this.$store.dispatch("setPianoState", q);
    // }, 3000);
  },
  methods: {
    transposeDown() {
      console.log("transpose down");
      this.$store.dispatch("_setValue", "1,9,1");
      let insideThis = this;
      setTimeout(() => {
        insideThis.$store.dispatch("_setValue", "0,4,0");
        setTimeout(() => {
          insideThis.$store.dispatch("_setValue", "1,9,0");
        }, 500);
      }, 500);
    },
    transposeUp() {
      console.log("transpose up");
      this.$store.dispatch("_setValue", "1,9,1");
      let insideThis = this;
      setTimeout(() => {
        insideThis.$store.dispatch("_setValue", "0,5,0");
        setTimeout(() => {
          insideThis.$store.dispatch("_setValue", "1,9,0");
        }, 500);
      }, 500);
    },
    octaveUp() {
      console.log("octave up");
      this.$store.dispatch("_setValue", "0,5,0");
    },
    octaveDown() {
      console.log("octave down");
      this.$store.dispatch("_setValue", "0,4,0");
    },
    goToMain() {
      this.$router.push("/");
    },
    reverbListener(event) {
      console.log(event);
      console.log("changing reverb");
      if (event.value == true) {
        this.$store.dispatch("_setValue", "0,1,0");
      } else {
        this.$store.dispatch("_setValue", "0,1,0");
      }
    }
  },
  data() {
    return {
      // switchOn: true,
      spdOpen: false,
      shareItems: {
        Twitter: "md-twitter",
        Facebook: "md-facebook",
        "Google+": "md-google-plus"
      },
      reverb: true
    };
  },
  computed: {
    getVersion: function() {
      return this.$store.getters.getVersion;
    },
    reverbStatus: {
      get() {
        return this.$store.getters.getPianoState.reverb.value;
      },
      set(value) {
        let q = this.$store.getters.getPianoState;
        q.reverb.value = value;
        this.$store.dispatch("setPianoState", q);
      }
    }
  }
};
</script>

<style scoped>
.footer {
  text-align: center;
  font-size: 12px;
  height: 30px;
  line-height: 30px;
  padding: 0;
  margin: 0;
  background-color: transparent !important;
  display: block;
  border: none;
}
.arrow-header {
  margin-left: 10px;
}
.content-about p {
  padding-top: 50px !important;
  text-align: center !important;
  font-size: 18px !important;
}
</style>
