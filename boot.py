import pycom
import machine
from network import WLAN
import network

# set WLAN SSID
wl = WLAN(mode=WLAN.AP, ssid="Delano-Piano", auth=(WLAN.WPA2, 'bXdc45**'), channel=6)

# disable heartbeat
pycom.heartbeat(False)
pycom.rgbled(0x000000)

machine.main('main.py')