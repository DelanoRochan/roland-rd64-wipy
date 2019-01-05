// let the Puck search for the piano and trigger a characteristic command on click and double click
var minus = true;
var connected = false;
var passwordCharacteristic = false;
var txCharacteristic = false;

var clickcount = 0;
var clickevent = null;

var octaveUp = false;
var octaveDown = false;

digitalPulse(LED3, 1, 1000);

function triggerAction(count) {
  if (!connected || count === 0) {
    // connect
    findAndConnect('Delano-Piano');
  } else {
    // execute actions
    // 1: self.pin_reverb,
    // 2: self.pin_efx1,
    // 3: self.pin_efx2,
    // 4: self.pin_minus,
    // 5: self.pin_plus,
    // 6: self.pin_variation1, 
    // 7: self.pin_variation2, 
    // 8: self.pin_variation3,
    // 9: self.pin_transpose,
    // 10: self.pin_sound_epiano,
    // 11: self.pin_sound_piano,
    // 12: self.pin_sound_organ
    // 13: self.pin_reserve

    if (count === 1) {
      console.log('Going up');
      try {
        txCharacteristic.writeValue("0,5,0").then(function () {
          digitalPulse(LED2, 1, 500); // light green to show it worked
        }).catch(function () {
          digitalPulse(LED1, 1, 500); // light red if we had a problem
        });
      } catch (err) {
        console.log(err);
        //findAndConnect('Delano-Piano'); 
      }
    }
    if (count === 2) {
      console.log('Going down');
      try {
        txCharacteristic.writeValue("0,4,0").then(function () {
          digitalPulse(LED2, 1, 500); // light green to show it worked
        }).catch(function () {
          digitalPulse(LED1, 1, 500); // light red if we had a problem
        });
      } catch (err) {
        console.log(err);
        //findAndConnect('Delano-Piano'); 
      }
    }
  }
}

function writeCharacteristic(value) {
  txCharacteristic.writeValue(value).then(function () {
    digitalPulse(LED2, 1, 500); // light green to show it worked
  }).catch(function () {
    digitalPulse(LED1, 1, 500); // light red if we had a problem
  });
}

function findAndConnect(filterName) {
  digitalPulse(LED3, 1, 100);
  console.log('start Find and Connect');
  // connect to delano-piano, set password and be ready to fire commands
  NRF.requestDevice({
    filters: [{
      name: filterName
    }]
  }).then(function (device) {
    digitalPulse(LED3, 1, 100);
    return device.gatt.connect();
  }).then(function (d) {
    connected = d;
    console.log('getPrimaryService pass');
    return d.getPrimaryService("00002A6D-0000-1000-8000-00805F9B34FB");
  }).then(function (s) {
    console.log('getPrimaryChar pass');
    return s.getCharacteristic("00002A6E-0000-1000-8000-00805F9B34FB");
  }).then(function (c) {
    passwordCharacteristic = c;
    passwordCharacteristic.writeValue('0123').then(function () {
      console.log('succes!');
      digitalPulse(LED2, 1, 1000);
      return connected;
    }).then(function (d) {
      return d.getPrimaryService("00002A6F-0000-1000-8000-00805F9B34FB");
    }).then(function (s) {
      return s.getCharacteristic("00002B6E-0000-1000-8000-00805F9B34FB");
    }).then(function (c) {
      txCharacteristic = c;
      digitalPulse(LED2, 2, 500);
      console.log('Finished handshake, ready to take action');
    }).catch(function () {
      if (connected) connected.disconnect();
      digitalPulse(LED1, 1, 500); // light red if we had a problem
    });
  }).catch(function () {
    if (connected) connected.disconnect();
    digitalPulse(LED1, 1, 500); // light red if we had a problem
  });
}

//setWatch(triggerAction, BTN, { edge:"rising", debounce:50, repeat: true });

setWatch((e) => {
  clickcount++;
  if (clickevent !== null) clearTimeout(clickevent);

  clickevent = setTimeout(() => {
    if (clickcount === 1) {
      if (octaveUp === false && octaveDown === false) {
        triggerAction(1);
        octaveUp = true;
      } else {
        if (octaveUp === true) {
          triggerAction(2);
          octaveUp = false;
        }
        if (octaveDown === true) {
          triggerAction(1);
          octaveDown = false;
        }
      }
    } else if (clickcount === 2) {
      if (octaveDown === false && octaveUp === false) {
        octaveDown = true;
        triggerAction(2);
      } else {
        if (octaveUp === true) {
          triggerAction(2);
          octaveUp = false;
        }
        if (octaveDown === true) {
          triggerAction(1);
          octaveDown = false;
        }
      }
    } else if (clickcount === 3) {
      digitalPulse(LED3, 1, 1000);
      triggerAction(0);
    }

    clickcount = 0;
  }, 150);
}, BTN, {
  edge: "rising",
  debounce: 10,
  repeat: true
});

setWatch((e) => {
  setTimeout(() => {
    clickevent = null;
    console.log(octaveUp, octaveDown);
  }, 250);
}, BTN, {
  edge: "falling",
  debounce: 10,
  repeat: true
});


// ToDO: on connection lost: reset puck // otherwise battery drain