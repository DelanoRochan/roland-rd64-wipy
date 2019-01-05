<template>
  <v-ons-page>
    <p class="intro">
      {{this.status}}<br><br>
    </p>
      <!-- <v-ons-ripple
        color="rgba(255, 0, 0, 0.4)"
        background="rgba(0, 0, 255, 0.4)"
      >
      </v-ons-ripple> -->
  </v-ons-page>
</template>


<script>
// @ is an alias to /src
import { Plugins } from "@capacitor/core";

export default {
  name: "home",
  props: ["pageStack"],
  components: {},
  data: function() {
    return {
      healthTimer: null,
      bleTimer: null,
      discovery: "waiting"
    };
  },
  mounted: function() {},
  computed: {
    getVersion: function() {
      return this.$store.getters.getVersion;
    },
    status: function() {
      return this.$store.getters.getSystemStatus;
    }
  },
  methods: {
    goNext() {
      console.log("going places");
      this.$store.commit("tabbar/set", 2);
      console.log(this.$store.state.tabbar.index - 1);
    },
    push(page, key) {
      this.pageStack.push({
        extends: page,
        data() {
          return {
            toolbarInfo: {
              backLabel: "Home",
              title: key
            }
          };
        }
      });
    },
    toggleReverb() {
      console.log("Toggle reverb");
      this.$ons.platform.select("ios");
      this.$ons.notification.alert("Hello World!");
    },
    Utf8ArrayToStr(array) {
      var out, i, len, c;
      var char2, char3;

      out = "";
      len = array.length;
      i = 0;
      while (i < len) {
        c = array[i++];
        switch (c >> 4) {
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
          case 12:
          case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
            break;
          case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = array[i++];
            char3 = array[i++];
            out += String.fromCharCode(
              ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0)
            );
            break;
        }
      }
      return out;
    },
    goToSettings() {
      this.$router.push("/about");
    },
    async getDeviceInfo() {
      return await Plugins.Device.getInfo();
    },
    stopBluetooth() {
      let newStore = this.$store;
      let newRouter = this.$router;
      window.bluetoothle.stopScan(
        success => {
          newStore.dispatch("updateBluetoothScanning", false);
          window.setTimeout(() => {
            newRouter.go();
          }, 500);
          console.log(success);
        },
        err => {
          console.log(err);
          newRouter.go();
        }
      );
    },
    refresh() {
      // stop timers
      window.clearTimeout(this.healthTimer);
      window.clearTimeout(this.bleTimer);
      // stop bluetooth and refresh app
      this.stopBluetooth();
    },
    refreshFirstSetup() {
      this.$router.go();
    },
    async parse(msg) {
      var ch,
        st,
        re = [];
      for (var i = 0; i < msg.length; i++) {
        ch = msg.charCodeAt(i); // get char
        st = []; // set up "stack"
        do {
          st.push(ch & 0xff); // push byte to stack
          ch = ch >> 8; // shift value down by 1 byte
        } while (ch);
        // add stack contents to result
        // done because chars have "wrong" endianness
        re = re.concat(st.reverse());
      }
      // return an array of bytes
      return await re;
    },
    init() {
      this.$store.dispatch("updateStartTime");

      let insideStore = this.$store;
      // let insideMqtt = this.$mqtt;
      let insideThis = this;

      // function getCurrentDateTime() {
      //   var currentdate = new Date();
      //   var date =
      //     pad(currentdate.getDate()) +
      //     "-" +
      //     pad(currentdate.getMonth() + 1) +
      //     "-" +
      //     pad(currentdate.getFullYear());
      //   var time =
      //     pad(currentdate.getHours()) +
      //     ":" +
      //     pad(currentdate.getMinutes()) +
      //     ":" +
      //     pad(currentdate.getSeconds());
      //   return { date: date, time: time };
      // }
      // function pad(n) {
      //   return n < 10 ? "0" + n : n;
      // }
      console.log(this.$store.getters.getSystemID);
      console.log(this.$store.getters.getSystemInfo);
      // Do we have internet access?
      // let handler = Plugins.Network.addListener(
      //   "networkStatusChange",
      //   status => {
      //     console.log("Network status changed", status);
      //     this.$store.dispatch("updateNetworkStatus", status);
      //   }
      // );
      // console.log(handler);

      this.$store.dispatch("updateNetworkStatus", Plugins.Network.getStatus());

      // Do we have permissions?
      var permissions = window.cordova.plugins.permissions;
      var list = [
        permissions.INTERNET,
        permissions.BLUETOOTH,
        permissions.BLUETOOTH_ADMIN,
        permissions.ACCESS_COARSE_LOCATION,
        permissions.ACCESS_FINE_LOCATION,
        permissions.ACCESS_NETWORK_STATE,
        permissions.WRITE_EXTERNAL_STORAGE,
        permissions.READ_EXTERNAL_STORAGE
      ];
      permissions.checkPermission(list, success, null);

      function success(status) {
        if (!status.hasPermission) {
          permissions.requestPermissions(
            list,
            function(status) {
              if (!status.hasPermission) error("Welcome!");
              insideStore.dispatch("updatePermissionsStatus", true);
              startBLE();
            },
            null
          );
        } else {
          insideStore.dispatch("updatePermissionsStatus", true);
        }
      }
      function error(err) {
        // Plugins.Toast.show({
        //   text: "Error occured: " + JSON.stringify(err)
        // });
        console.log(err);
        console.log("Error from permissions");
      }

      function startBLE() {
        console.log("Starting BLE");
        window.bluetoothle.initialize(
          status => {
            // succes
            if (status.status == "disabled") {
              // enable bluetooth
              window.bluetoothle.enable(
                success => {
                  //succes enable BLE
                  console.log(success);
                },
                err => {
                  //error enable BLE
                  error(err);
                }
              );
            }
          },
          {
            request: true,
            statusReceiver: true,
            restoreKey: "saval-mqtt-ble"
          }
        );
        startBluetoothScan();
        // if (insideThis.healthTimer == null) {
        //   startHeartBeat();
        //   insideStore.dispatch("updateHeartBeatStatus", true);
        // }
      }
      // window.bluetoothle.isLocationEnabled(
      //   result => {
      //     // location services are enabled?
      //     if (result.isLocationEnabled == false) {
      //       window.bluetoothle.requestLocation(
      //         success => {
      //           // success request location
      //           console.log(success);
      //         },
      //         err => {
      //           error(err);
      //         }
      //       );
      //     }
      //   },
      //   err => {
      //     console.log(err);
      //   }
      // );

      // window.bluetoothle.hasPermission(result => {
      //   // coarse location privileges?
      //   if (result.hasPermission == false) {
      //     window.bluetoothle.requestPermission(
      //       success => {
      //         //permissions successfull
      //         console.log(success);
      //         insideStore.dispatch("updatePermissionsStatus", true);
      //       },
      //       err => {
      //         error(err);
      //       }
      //     );
      //   }
      // });

      // ** FOR TESTING PURPOSES ONLY **
      // if (this.$store.getters.getSystemInfo.isVirtual) {
      // window.setTimeout(() => {
      //   // this.$mqtt.publish(
      //   //   this.$store.getters.gateway.txu,
      //   //   JSON.stringify(this.$store.getters.getSystemInfo)
      //   // );
      //   let payload = {
      //     status: {
      //       name: "test12" + getCurrentDateTime().time,
      //       advertisement: "dGVzdA==",
      //       rssi: "-15dB"
      //     },
      //     manufacturer_hex: "test",
      //     manufacturer_base64: "test2"
      //   };
      //   this.$store.dispatch("addAdvertisement", payload);
      // }, 1000);
      // // }

      function chunk(str, n) {
        var ret = [];
        var i;
        var len;

        for (i = 0, len = str.length; i < len; i += n) {
          ret.push(str.substr(i, n));
        }

        return ret;
      }

      function toHexString(byteArray) {
        let result = Array.from(byteArray, function(byte) {
          return ("0" + (byte & 0xff).toString(16)).slice(-2);
        }).join("");
        return chunk(result, 2)
          .join(" ")
          .toUpperCase();
      }

      // function str2ab(str) {
      //   var buf = new ArrayBuffer(str.length * 2); // 1 byte for each char
      //   var bufView = new Uint16Array(buf);
      //   for (var i = 0, strLen = str.length; i < strLen; i++) {
      //     bufView[i] = str.charCodeAt(i);
      //   }
      //   return buf;
      // }

      function arrayBufferToBase64(buffer) {
        var binary = "";
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
      }

      function startBluetoothScan() {
        if (!insideStore.getters.isBluetoothScanning) {
          insideStore.dispatch("updateBluetoothScanning", true);
          window.bluetoothle.startScan(
            result => {
              if (result.status == "scanResult") {
                try {
                  if (result.name != null) {
                    if (result.name == "Delano-Piano") {
                      insideStore.dispatch(
                        "updateSystemStatus",
                        "Found Delano-Piano"
                      );
                      // let alreadySeen = 0;
                      // try {
                      //   alreadySeen = insideStore.getters.getNodes.find(
                      //     el => el[0] == result.name
                      //   );
                      // } catch (err) {
                      //   console.log(err);
                      // }
                      // if (alreadySeen == -1) {
                      // first time we see this advertisement

                      // advertisement is maximum of 31 bytes
                      // example: 02 01 04 13 FF FF FF 57 16 0D ED 01 32 01 8A CE DD E5 79 34 63 61 ED
                      // first 3 bytes: flags
                      // next 20 bytes: Manufacturer specific data, first 4 manufacturer, last 16 real payload
                      // next 8 bytes: Copmlete local name, first 2 indicator, last 6 real name
                      let advertisement_bytes = window.bluetoothle.encodedStringToBytes(
                        result.advertisement
                      );
                      console.log(advertisement_bytes);
                      // let flags = advertisement_bytes.slice(0,4);
                      let manufacturer_data = advertisement_bytes.slice(5, 23);
                      let manufacturer_data_hex = toHexString(
                        manufacturer_data
                      );
                      let manufacturer_data_base64 = arrayBufferToBase64(
                        manufacturer_data
                      );
                      // insideMqtt.publish(
                      //   insideStore.getters.nodes.rx.replace(
                      //     /[+]/g,
                      //     result.name
                      //   ),
                      //   manufacturer_data_base64
                      // );
                      insideStore.dispatch("addAdvertisement", {
                        status: result,
                        manufacturer_hex: manufacturer_data_hex,
                        manufacturer_base64: manufacturer_data_base64
                      });
                      // CONNECT TO DEVICE
                      window.bluetoothle.connect(
                        result => {
                          if (result.status == "connected") {
                            insideStore.dispatch(
                              "updateSystemStatus",
                              "Connected to Delano-Piano"
                            );
                            insideStore.dispatch(
                              "updateBluetoothConnected",
                              true
                            );
                            // get Primary Service 00002A6D-0000-1000-8000-00805F9B34FB
                            insideStore.dispatch(
                              "updateSystemStatus",
                              "Discovering services"
                            );
                            window.bluetoothle.discover(
                              success => {
                                console.log(success);
                                insideStore.dispatch(
                                  "updateDiscovery",
                                  success
                                );
                                insideStore.dispatch(
                                  "updateSystemStatus",
                                  "Logging in"
                                );
                                // // get Characteristic 00002A6E-0000-1000-8000-00805F9B34FB
                                // insideThis.discovery.services[2]
                                //   .characteristics[0].uuid;
                                window.bluetoothle.write(
                                  success2 => {
                                    insideStore.dispatch(
                                      "updateSystemStatus",
                                      "Succesfully logged in"
                                    );
                                    // we are in
                                    // let's go to the main screen
                                    console.log(success2);
                                    insideThis.goNext();
                                  },
                                  err => {
                                    console.log(err);
                                  },
                                  {
                                    address: success.address,
                                    service: success.services[2].uuid,
                                    characteristic:
                                      success.services[2].characteristics[0]
                                        .uuid,
                                    value: window.bluetoothle.bytesToEncodedString(
                                      window.bluetoothle.stringToBytes("0123")
                                    ),
                                    type: null
                                  }
                                );
                              },
                              err => {
                                console.log(err);
                                window.bluetoothle.close(
                                  success => {
                                    console.log(success);
                                    insideStore.dispatch(
                                      "updateBluetoothScanning",
                                      false
                                    );
                                  },
                                  err => {
                                    console.log(err);
                                  },
                                  {
                                    address: result.address
                                  }
                                );
                              },
                              {
                                address: result.address
                              }
                            );
                          }
                        },
                        err => {
                          console.log(err);
                          window.bluetoothle.close(
                            success => {
                              console.log(success);
                              insideStore.dispatch(
                                "updateBluetoothScanning",
                                false
                              );
                            },
                            err => {
                              console.log(err);
                            },
                            {
                              address: result.address
                            }
                          );
                        },
                        {
                          address: result.address,
                          autoConnect: true
                        }
                      );
                    }
                  }
                } catch (err) {
                  console.log(err);
                }
              }
            },
            err => {
              error(err);
            },
            {
              services: [null],
              allowDuplicates: true,
              scanMode: window.bluetoothle.SCAN_MODE_LOW_LATENCY,
              matchMode: window.bluetoothle.MATCH_MODE_AGGRESSIVE,
              matchNum: window.bluetoothle.MATCH_NUM_MAX_ADVERTISEMENT,
              callbackType: window.bluetoothle.CALLBACK_TYPE_ALL_MATCHES
            }
          );
          // insideThis.bleTimer = window.setTimeout(() => {
          //   restartBluetoothScan();
          // }, insideStore.getters.getTimers.bluetooth);
        }
      }

      // async function startHeartBeat() {
      //   // update system info
      //   let q = await Plugins.Device.getInfo();
      //   insideStore.dispatch("updateSystemInfo", q);

      //   // then send over MQTT
      //   insideMqtt.publish(
      //     insideStore.getters.gateway.txu,
      //     JSON.stringify(insideStore.getters.getState)
      //   );

      //   // schedule next heart beat
      //   insideThis.healthTimer = window.setTimeout(() => {
      //     console.log("restarting heartbeat");
      //     startHeartBeat();
      //   }, insideStore.getters.getTimers.heartbeat);
      // }

      // function restartBluetoothScan() {
      //   window.bluetoothle.stopScan(
      //     success => {
      //       insideStore.dispatch("updateBluetoothScanning", false);
      //       console.log(success);
      //       Plugins.Toast.show({
      //         text: "Restarted Bluetooth Scanner"
      //       });
      //       startBluetoothScan();
      //     },
      //     err => {
      //       error(err);
      //     }
      //   );
      // }
    },
    async showAlert() {
      let promptRet = await Plugins.Modals.showActions({
        title: "Photo Options",
        message: "Select an option to perform",
        options: [
          {
            title: "Upload"
          },
          {
            title: "Share"
          },
          {
            title: "Remove"
          }
        ]
      });
      console.log("You selected", promptRet);
    }
  },
  created: function() {
    window.setTimeout(() => {
      Plugins.SplashScreen.hide();
    }, 1000);
    document.addEventListener("deviceready", this.init);
  }
};
</script>

<style scoped>
.intro {
  text-align: center;
  padding: 0 20px;
  margin-top: 40px;
}

ons-card {
  cursor: pointer;
  color: #333;
}

.card__title,
.card--material__title {
  font-size: 20px;
}
</style>

<style>
body
  > ion-app
  > ion-router-outlet
  > ion-header
  > ion-toolbar
  > ion-buttons:nth-child(3)
  > ion-menu-toggle
  > ion-button
  > button
  > span
  > ion-icon
  > div
  > svg {
  fill: white !important;
}
.logo-header {
  padding-left: 10px;
}
.bluetooth-icon {
  padding-left: 10px !important;
}
.content {
  margin-top: 20px !important;
  margin-bottom: 20px !important;
  background-color: white;
  text-align: left !important;
}
.content p {
  color: black;
  /* text-align: center; */
  font-weight: bold;
}
.ion-item-id {
  padding-left: 0 !important;
}
</style>
