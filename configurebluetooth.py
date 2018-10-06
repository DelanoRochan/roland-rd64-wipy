import time
import network
import socket
from network import Bluetooth
import machine
import pycom

class ConfigureBluetooth:
    def __init__(self,data,main):
        self.data = data
        self.main = main
        self.mode = 0
        self.pycom = main.pycom
        self.nodeName = None
        self.connectionFailed = False
        self.bluetoothConnected = False
        self.srv1 = None
        self.chr1 = None
        self.srv2 = None
        self.chr2 = None
        self.chr3 = None
        self.bluetooth = None
        self.char1_cb = None
        self.char2_cb = None
        self.service_uuid = 0x2A6D
        self.service_uuid2 = 0x2A6F
        self.characteristic_uuid = 0x2A6E
        self.characteristic_uuid2 = 0x2B6E
        self.state = 'start'
        self.unlocked = False

        # 1: self.pin_reverb,
        # 2: self.pin_efx1,
        # 3: self.pin_efx2,
        # 4: self.pin_minus,
        # 5: self.pin_plus,
        # 6: self.pin_variation1, 
        # 7: self.pin_variation2, 
        # 8: self.pin_variation3,
        # 9: self.pin_transpose,
        # 10: self.pin_sound_epiano,
        # 11: self.pin_sound_piano,
        # 12: self.pin_sound_organ
        # 13: self.pin_reserve

    ## start() gets called by main.py in initialisation phase
    ## returns when main state can be started
    def start(self):
        self.setBluetoothAdvertisement(self.mode)

        return True

    def setBluetoothAdvertisement(self, mode):
        if mode == 0:
            print("Bluetooth Basic activated")

            self.nodeName = self.data.get('name')
            print("Advertising on bluetooth with:")
            print(self.nodeName)

            self.bluetooth = Bluetooth()
            self.bluetooth.init()
            ## service_uuid is dummy, is there an existing profile we should use?

            self.bluetooth.set_advertisement(name=self.nodeName, service_uuid=self.service_uuid)
            self.bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=self.conn_cb)
            self.bluetooth.advertise(True)

            ## Below is dummy code, only for testing purposes, services and characteristics should become classes
            self.srv1 = self.bluetooth.service(uuid=self.service_uuid, isprimary=True)
            self.chr1 = self.srv1.characteristic(uuid=self.characteristic_uuid, value=b'123')
            self.char1_cb = self.chr1.callback(trigger=Bluetooth.CHAR_WRITE_EVENT | Bluetooth.CHAR_READ_EVENT, handler=self.unlock_handler)

            self.srv1.start()

            self.srv2 = self.bluetooth.service(uuid=self.service_uuid2, isprimary=True)

            self.chr2 = self.srv2.characteristic(uuid=self.characteristic_uuid2, value=b'chr2')
            self.chr3 = self.srv2.characteristic(uuid=self.characteristic_uuid2, value=b'chr3')
            self.char2_cb = self.chr2.callback(trigger=Bluetooth.CHAR_WRITE_EVENT | Bluetooth.CHAR_READ_EVENT, handler=self.interface_handler)

            self.srv2.start()

            self.main.start_main_state()

    def conn_cb(self, bt_o):
        events = bt_o.events()
        if events & Bluetooth.CLIENT_CONNECTED:
            print("Client connected")
            self.bluetoothConnected = True

        elif events & Bluetooth.CLIENT_DISCONNECTED:
            print("Client disconnected")
            self.stop_config_state()

    def unlock_handler(self, chr):
        events = chr.events()
        if events & Bluetooth.CHAR_WRITE_EVENT:
            print("Client has written to UNLOCK characteristic")
            # if written correct passphrase:
            if (chr.value() == b'0123'):
                self.start_config_state()
                self.unlocked = True
            else:
                print('wrong password')
                print("Write request with value = {}".format(chr.value()))
        if events & Bluetooth.CHAR_READ_EVENT:
            print("Client has read characteristic")

    def toggle_method(self, param1, param2):
        # quickly turn on then off = toggle
        self.main.toggle_switch(self.main.pin_array[int(param1)-1])
        print('Toggled ' + str(self.main.pin_array[int(param1)-1]))

    def loop_through_options(self):
        # loop through indexes
        self.main.currentIndex += 1
        print(self.main.options)
        if self.main.currentIndex > len(self.main.options) - 1:
            self.main.currentIndex = 0
        print(self.main.currentIndex)
        # # toggle (on-off sequence) and switch (on or off)
        self.main.sequence_method(self.main.options[self.main.currentIndex])

    def switch_method(self, param1, param2=0):
        # switch on or off (controlled by param2)
        if int(param2) == 1:
            self.main.switch_on(self.main.pin_array[int(param1)-1])
            print('Switched ON ' + str(self.main.pin_array[int(param1)-1]))
        else:
            self.main.switch_off(self.main.pin_array[int(param1)-1])
            print('Switched OFF ' + str(self.main.pin_array[int(param1)-1]))

    def sequence_method(self, param1, param2=0):
        # toggle a sequence of buttons
        # e.g. "11-1-2-3-6"
        self.toggleList = param1.split("-")
        # API: "2,1-2-3,0"
        print(self.toggleList)
        for x in self.toggleList:
            print(x)
            self.main.toggle_switch(self.main.pin_array[int(x)-1])
            time.sleep(0.1)

    def toggle_setting(self, param1, param2):
        # toggle a sequence of buttons depending on param1 setting int

        self.toggleList = [1, 2, 3]
        print(self.toggleList)
        for x in self.toggleList:
            print(x)
            self.main.toggle_switch(self.main.pin_array[int(x)-1])
            time.sleep(0.1)

    def transpose_up(self):
        # tranpose up
        # switch 9 to ON (1)
        # toggle 5 (plus)
        self.switch_method(9,1)
        time.sleep(0.1)
        self.main.toggle_switch(self.main.pin_array[5-1])
        time.sleep(0.1)
        self.switch_method(9,0)

    def transpose_down(self):
        # tranpose down
        # switch 9 to ON (1)
        # toggle 4 (minus)
        self.switch_method(9,1)
        time.sleep(0.1)
        self.main.toggle_switch(self.main.pin_array[4-1])
        time.sleep(0.1)
        self.switch_method(9,0)

    def octave_up(self):
        # octave up, could be triggered with e.g. PuckJS as BLE client
        self.main.toggle_switch(self.main.pin_array[5-1])

    def octave_down(self):
        # octave down
        self.main.toggle_switch(self.main.pin_array[4-1])
        
    def interface_handler(self, chr):
        events = chr.events()
        if events & Bluetooth.CHAR_WRITE_EVENT:
            print("Client has written to characteristic")
            if self.unlocked:
                print("Write request with value = {}".format(chr.value()))
                a = str(chr.value())
                a = a[2:-1].split(",")
                print(a)
                # e.g. STRING="0,00ff00,1"
                # i.e. LED function (0), color, mode (blink / constant / etc.)
                options = {
                    0: self.toggle_method,
                    1: self.switch_method,
                    2: self.sequence_method,
                    3: self.toggle_setting,
                    4: self.transpose_up,
                    5: self.transpose_down,
                    6: self.octave_up,
                    7: self.octave_down,
                    8: self.loop_through_options
                }
                try:
                    if int(a[0]) == 8 or int(a[0]) == 7 or int(a[0]) == 6 or int(a[0]) == 5 or int(a[0]) == 4:
                        options(int(a[0]))()                    
                    else:
                        options[int(a[0])](a[1], a[2])
                except:
                    print('Error')
                    # self.chr2.value(b'Error')
                # give response back:
                # self.chr2.value(bytearray(a))
                print('OK')
                self.chr2.value(b'OK')

        if events & Bluetooth.CHAR_READ_EVENT:
            print("Client has read characteristic")

    def start_config_state(self):
        self.mode = 1
        self.state = 'start_config_state'
        self.pycom.rgbled(0x0000ff)
        self.chr1.value(b'Welcome')

    def stop_config_state(self):
        self.state = 'stop_config_state'
        self.unlocked = False
        self.pycom.rgbled(0xff0000)
        self.bluetoothConnected = False
        self.mode = 0