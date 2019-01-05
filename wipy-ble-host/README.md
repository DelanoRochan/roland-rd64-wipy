# Roland RD-64 control with relays and WiPy (PoC)

## Features
- Startup with WiFi and BLE activated
- Broadcast "Delano-Piano" SSID and BLE ID
- Set pins to output
- Toggle external MOSFETS/Relays to simulate open-short-open activity like button
- Receive commands over Bluetooth to toggle pins

## Structure
- ./boot.py -> setup WiFi and shutdown LED
- ./data.json -> configuration file
- ./data.py -> set/get data to json file
- ./configurebluetooth.py -> class to set BLE with handlers
- ./main.py -> main class