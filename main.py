import time
import pycom
from data import Data
from configurebluetooth import ConfigureBluetooth
from machine import Pin
from machine import Timer
import machine
import sys

import network
import socket
from network import Bluetooth

class Main:
    INITIALISING = 0
    CONFIGURING = 1
    UPDATING = 2
    PRODUCTION = 3

    def __init__(self):
        self.toggleList = None
        self.data = Data()
        self.pin_array = None
        self.pycom = pycom

        self.running = True
        self.ble = BLEConfig(self.data,self)

        self.nodeName = ''
        self.connectionFailed = False
        self.bluetoothConnected = False
        self.srv1 = ''
        self.chr1 = ''
        self.srv2 = ''
        self.chr2 = ''
        self.bluetooth = ''
        self.char1_cb = ''
        self.char2_cb = ''
        self.service_uuid = b'1234567890123456'
        self.service_uuid2 = b'1234567890123457'
        self.characteristic_uuid = b'ab34567890123456'
        self.characteristic_uuid2 = b'ab34567890123457'
        self.options = self.data.get('startup.options')
        self.currentIndex = 0
        self.loopStarted = False
        self.timer = Timer.Chrono()
        self.timer.start()

    def start(self):
        print("Start init state")
        
        self.init_pins()
        self.pycom.rgbled(0x000000)
        self.ble.start()

    def set_config_state(self):
        self.stop()

    def init_pins(self):
        #initialize all pins as output (13 needed)
        self.pin_reverb = Pin('P3', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_efx1 = Pin('P4', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_efx2 = Pin('P5', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_minus = Pin('P6', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_plus = Pin('P7', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_variation1 = Pin('P8', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_variation2 = Pin('P9', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_variation3 = Pin('P10', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_transpose = Pin('P11', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_sound_epiano = Pin('P12', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_sound_piano = Pin('P21', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_sound_organ = Pin('P22', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        # self.pin_sound_clav = Pin('P23', mode=Pin.OUT, pull=Pin.PULL_DOWN)
        self.pin_reserve = Pin('P23', mode=Pin.IN, pull=Pin.PULL_DOWN)
        self.pin_array = [self.pin_reverb, self.pin_efx1, self.pin_efx2, self.pin_minus, self.pin_plus, \
                        self.pin_variation1, self.pin_variation2, self.pin_variation3, self.pin_transpose, self.pin_sound_epiano, \
                        self.pin_sound_piano, self.pin_sound_organ, self.pin_reserve]
        # self.pin_reserve.callback(Pin.IRQ_FALLING, self.loop_through_options, self)

    def set_start(self):
        self.toggleList = self.data.get('startup.switch')
        for x in self.toggleList:
            print(x)
            self.toggle_switch(self.pin_array[x-1])
            time.sleep(0.1)

    def loop_through_options(self, pin):
        timePassed = self.timer.read()
        # timePassed > 1.1, otherwise sometimes unstable
        if self.loopStarted == False and timePassed > 1.1:
            self.timer.reset()
            self.loopStarted = True
            self.currentIndex += 1
            #print(self.options)
            if self.currentIndex > len(self.options) - 1:
                self.currentIndex = 0
            # # toggle (on-off sequence) and switch (on or off)
            self.sequence_method(self.options[self.currentIndex])

    def loop_through_reset(self, pin):
        timePassed = self.timer.read()
        if self.loopStarted == False and timePassed > 3.0:
            self.timer.reset()
            self.loopStarted = False
            self.currentIndex = 0
            self.sequence_method(self.options[self.currentIndex])

    def sequence_method(self, param1, param2=0):
        # toggle a sequence of buttons
        # e.g. "11-1-2-3-6"
        self.toggleList = param1.split("-")
        # API: "2,1-2-3,0"
        print(self.toggleList)
        for x in self.toggleList:
            print(x)
            self.toggle_switch(self.pin_array[int(x)-1])
            time.sleep(0.1)
        self.loopStarted = False

    def toggle_switch(self, pin):
        print(pin)
        pin.toggle() #off -> on
        time.sleep(0.2)
        pin.toggle() #on -> off

    def switch_on(self, pin):
        print(pin)
        pin.value(1)

    def switch_off(self, pin):
        print(pin)
        pin.value(0)

    def start_main_state(self):
        print("Start main state")
        self.data.refresh()
        self.running = True

        time.sleep(3)

        self.set_start()
        self.start_main_loop()

    def start_main_loop(self):
        print("Starting main loop")
        try:
            while self.running:
                print('Waiting for instructions over BLE')

                time.sleep(1)
        except KeyboardInterrupt as e:
            print("Keyboard interrupt. Stopping all processes")
            self.stop()

    def stop(self):
        self.running = False

m = None
try:
    m = Main()
    m.start()
except Exception as e:
    print("Exception occurred")
    sys.print_exception(e)
    if m:
        m.stop()
        while True:
            print(e)
    else:
        while True:
            print("Failed inside Main constructor")