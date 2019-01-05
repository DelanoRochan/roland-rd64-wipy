// import { Plugins } from "@capacitor/core";
// const { Storage } = Plugins;

// async function setObject() {
//   await Storage.set({
//     settings: JSON.stringify({
//       mqttUrl: "connected.saval.nl:443",
//       userName: "admin",
//       password: "bXdc45**!!"
//     })
//   });
// }

// JSON "get" example
// async function getObject() {
//   const settings = JSON.parse(await Storage.get({ key: "settings" }));
//   console.log("fetching local data");
//   console.log(settings);
// }

// async function setItem() {
//   await Storage.set({
//     key: "name",
//     value: "Max"
//   });
// }

// async function getItem() {
//   const value = await Storage.get({ key: "name" });
//   console.log("Got item: ", value);
// }

// async function removeItem() {
//   await Storage.remove({ key: "name" });
// }

// async function keys() {
//   const keys = await Storage.keys();
//   console.log("Got keys: ", keys);
// }

// async function clear() {
//   await Storage.clear();
// }

// nodes: {
//   "delano": {
//   name: "Test",
//   payload: {
//     "base64": "base64",
//     "hex":  "hex"
//   },
//   rssi: "-15dB",
//   time: getCurrentDateTime().time,
//   date: getCurrentDateTime().date
// } }

// timers: {
//   heartbeat: 5400000,
//   bluetooth: 3600000
// },

import { version } from "../../package.json";

// # 1: self.pin_reverb,
// # 2: self.pin_efx1,
// # 3: self.pin_efx2,

// # 4: self.pin_minus,
// # 5: self.pin_plus,

// # 6: self.pin_variation1,
// # 7: self.pin_variation2,
// # 8: self.pin_variation3,
// # 9: self.pin_transpose,
// # 10: self.pin_sound_epiano,
// # 11: self.pin_sound_piano,
// # 12: self.pin_sound_organ
// # 13: self.pin_reserve

// Transpose UP:
// 1,9,1
// 0,5,0
// 1,9,0

// Transpose DOWN:
// 1,9,1
// 0,4,0
// 1,9,0

// Octave UP:
// 0,5,0

// Octave Down:
// 0,4,0

const state = {
  version: version,
  discovery: null,
  ble_write: {
    write_pass: null,
    api: null
  },
  pianoState: {
    reverb: {
      value: true,
      key: 1
    },
    efx1: {
      value: true,
      key: 2
    },
    efx2: {
      value: true,
      key: 3
    },
    octave: {
      value: 0,
      key: [4, 5]
    },
    transpose: {
      value: 0,
      key: 9
    },
    variation: {
      value: 1,
      key: [6, 7, 8]
    },
    sound: {
      value: 1,
      key: [11, 10, 12]
    }
  },
  nodes: [],
  info: "pending",
  startTime: null,
  gatewayID: "",
  timers: {
    heartbeat: 5400000,
    bluetooth: 3600000
  },
  mqtt: {
    gateway: {
      rx: "gateways/+",
      tx: "gateways/+"
    },
    nodes: {
      rx: "sensors/+/rx",
      tx: "sensors/+/tx"
    }
  },
  status: {
    system: "Looking for piano...",
    network: false,
    mqtt: false,
    bluetooth: false,
    bluetooth_scanning: false,
    bluetooth_connected: false,
    permissions: false,
    heartbeat: false
  }
};

// mutations
const mutations = {
  SET_SYSTEM_STATUS: (state, status) => {
    state.status.system = status;
  },
  SET_CORDOVA_STATUS: (state, status) => {
    state.status.cordova = status;
  },
  SET_NETWORK_STATUS: (state, status) => {
    state.status.network = status;
  },
  SET_PERMISSIONS_STATUS: (state, status) => {
    state.status.permissions = status;
  },
  SET_BLUETOOTH_STATUS: (state, status) => {
    state.status.bluetooth = status;
  },
  UPDATE_BLE_NODE: (state, output) => {
    state.nodes.splice(output.index, 1, output.result);
    // state.nodes[output.index] = output.result;
    console.log(state.nodes);
  },
  PUSH_BLE_NODE: (state, output) => {
    state.nodes.push(output.result);
  },
  SET_SYSTEM_INFO: (state, result) => {
    state.info = result;
  },
  SET_BLUETOOTH_SCANNING_STATUS: (state, result) => {
    state.status.bluetooth_scanning = result;
  },
  SET_DISCOVERY: (state, result) => {
    state.discovery = result;
  },
  SET_BLUETOOTH_CONNECTED_STATUS: (state, result) => {
    state.status.bluetooth_connected = result;
  },
  SET_HEARTBEAT_STATUS: (state, result) => {
    state.status.heartbeat = result;
  },
  SET_START_TIME: (state, result) => {
    state.startTime = result;
  },
  SET_GATEWAY_ID: (state, result) => {
    state.gatewayID = result;
  },
  SET_PIANO_STATE: (state, result) => {
    state.pianoState = result;
  }
};

// actions
const actions = {
  setPianoState: (context, status) => {
    context.commit("SET_PIANO_STATE", status);
  },
  updateSystemStatus: (context, status) => {
    context.commit("SET_SYSTEM_STATUS", status);
  },
  updateNetworkStatus: (context, status) => {
    context.commit("SET_NETWORK_STATUS", status);
  },
  updatePermissionsStatus: (context, status) => {
    context.commit("SET_PERMISSIONS_STATUS", status);
  },
  updateBluetoothStatus: (context, status) => {
    context.commit("SET_BLUETOOTH_STATUS", status);
  },
  updateSystemInfo: (context, status) => {
    context.commit("SET_SYSTEM_INFO", status);
    context.commit(
      "SET_GATEWAY_ID",
      status.uuid.substr(status.uuid.length - 4)
    );
  },
  updateDiscovery: (context, status) => {
    context.commit("SET_DISCOVERY", status);
  },
  updateBluetoothScanning: (context, status) => {
    context.commit("SET_BLUETOOTH_SCANNING_STATUS", status);
  },
  updateBluetoothConnected: (context, status) => {
    context.commit("SET_BLUETOOTH_CONNECTED_STATUS", status);
  },
  updateHeartBeatStatus: (context, status) => {
    context.commit("SET_HEARTBEAT_STATUS", status);
  },
  updateGatewayID: context => {
    context.commit(
      "SET_GATEWAY_ID",
      state.info.uuid.substr(state.info.uuid.length - 4)
    );
  },
  updateStartTime: context => {
    context.commit(
      "SET_START_TIME",
      getCurrentDateTime().date + " | " + getCurrentDateTime().time
    );
  },
  updateNodeInformation: (context, status) => {
    let data = status.data;
    let result = state.nodes[status.index].concat(JSON.stringify(data));
    context.commit("UPDATE_BLE_NODE", {
      index: status.index,
      result: result
    });
  },
  _setValue: (context, status) => {
    try {
      // // then, get service 00002A6F-0000-1000-8000-00805F9B34FB
      // // get characteristic 00002B6E-0000-1000-8000-00805F9B34FB
      // insideThis.discovery.services[3]
      //   .characteristics[0].uuid;
      // status contains API call, e.g. (1,9,1)
      window.bluetoothle.write(
        success => {
          // update state
          console.log(success);
        },
        err => {
          console.log(err);
          // do not update state
        },
        {
          address: state.discovery.address,
          service: state.discovery.services[3].uuid,
          characteristic: state.discovery.services[3].characteristics[0].uuid,
          value: window.bluetoothle.bytesToEncodedString(
            window.bluetoothle.stringToBytes(status)
          ),
          type: null
        }
      );
    } catch (err) {
      console.log(err);
    }
  },
  addAdvertisement: (context, data) => {
    let status = data.status;
    let result = [
      status.name,
      status.advertisement,
      data.manufacturer_base64,
      data.manufacturer_hex,
      status.rssi,
      getCurrentDateTime().time,
      getCurrentDateTime().date
    ];
    // is this a new item?
    let index = state.nodes.findIndex(
      el => el[0].substr(1) == result[0].substr(1)
    );
    if (index != -1) {
      // exists
      context.commit("UPDATE_BLE_NODE", {
        index: index,
        result: result
      });
    } else {
      // new item
      context.commit("PUSH_BLE_NODE", {
        result: result
      });
    }
  }
};

// getters
const getters = {
  getSystemStatus: state => {
    return state.status.system;
  },
  getNodes: state => {
    return state.nodes;
  },
  getDiscovery: state => {
    return state.discovery;
  },
  getPianoState: state => {
    return state.pianoState;
  },
  getSystemInfo: state => {
    return state.info;
  },
  getSystemID: state => {
    return state.info.uuid;
  },
  mqtt: state => {
    return state.mqtt;
  },
  isBluetoothScanning: state => {
    return state.status.bluetooth_scanning;
  },
  isHeartBeatRunning: state => {
    return state.status.heartbeat;
  },
  gateway: state => {
    return {
      txu: state.mqtt.gateway.tx.replace(/[+]/g, state.gatewayID),
      tx: state.mqtt.gateway.tx,
      rxu: state.mqtt.gateway.rx.replace(/[+]/g, state.gatewayID),
      rx: state.mqtt.gateway.rx
    };
  },
  nodes: state => {
    return {
      rx: state.mqtt.nodes.rx,
      tx: state.mqtt.nodes.tx
    };
  },
  getVersion: state => {
    return state.version;
  }
};

function getCurrentDateTime() {
  var currentdate = new Date();
  var date =
    pad(currentdate.getDate()) +
    "-" +
    pad(currentdate.getMonth() + 1) +
    "-" +
    pad(currentdate.getFullYear());
  var time =
    pad(currentdate.getHours()) +
    ":" +
    pad(currentdate.getMinutes()) +
    ":" +
    pad(currentdate.getSeconds());
  return { date: date, time: time };
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
  strict: true,
  modules: {
    navigator: {
      strict: true,
      namespaced: true,
      state: {
        stack: [],
        options: {}
      },
      mutations: {
        push(state, page) {
          state.stack.push(page);
        },
        pop(state) {
          if (state.stack.length > 1) {
            state.stack.pop();
          }
        },
        replace(state, page) {
          state.stack.pop();
          state.stack.push(page);
        },
        reset(state, page) {
          state.stack = [page || state.stack[0]];
        },
        options(state, newOptions = {}) {
          state.options = newOptions;
        }
      }
    },

    splitter: {
      strict: true,
      namespaced: true,
      state: {
        open: false
      },
      mutations: {
        toggle(state, shouldOpen) {
          if (typeof shouldOpen === "boolean") {
            state.open = shouldOpen;
          } else {
            state.open = !state.open;
          }
        }
      }
    },

    tabbar: {
      strict: true,
      namespaced: true,
      state: {
        index: 2
      },
      mutations: {
        set(state, index) {
          console.log("tabbar/set triggered");
          console.log(index);
          console.log(window.bluetoothle.write);
          state.index = index;
        }
      },
      getters: {
        getIndex: function() {
          return state.index;
        }
      }
    }
  }
};
