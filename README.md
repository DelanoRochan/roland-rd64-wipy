# Roland RD-64 - Project Feather
## Goals
* Create smaller, more portable and elegant version of the Roland RD64
* Control main PCB with switches (solid state relays) that are controlled by PyCom WiPy
* Control WiPy over BLE
* Auto connect and login with Capacitor app using Cordova BLE plugin and a Vue UI
* AUto connect and trigger octave up/down with Puck.js BLE client

## Structure
- ./mobile-ble-client -> Capacitor + Vue.js Android app proof of concept BLE client (should be compilable for IOS, not tested though)
- ./puckjs-ble-client -> Puck.js javascript proof of concept BLE client
- ./wipy-ble-host -> Proof of concept code to set-up BLE host with PyCom WiPy

Code quality differs per section, although it works fine with daily use; feel free to use as you see fit.