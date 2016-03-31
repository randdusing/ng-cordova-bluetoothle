# ng-cordova-bluetoothle

This wraps the [Bluetooth Low Energy Phonegap Plugin](https://github.com/randdusing/cordova-plugin-bluetoothle) by Rand Dusing in AngularJS code so it can be used more easily in AngularJS mobile applications.



## Installation

* Install the Bluetooth LE Plugin: ``` cordova plugin add cordova-plugin-bluetoothle ```
* Install the Angular Wrapper: ``` bower install git://github.com/randdusing/ng-cordova-bluetoothle.git#master ```



### Example App

An example app has been created using the Ionic Framework to demonstrate the functionality. To install the example app, follow the steps below:

* Create a new Ionic Project: ionic start test tabs
* Install the Bluetooth LE plugin: cordova plugin add cordova-plugin-bluetoothle
* Install the Angular Wrapper: ```bower install git://github.com/randdusing/ng-cordova-bluetoothle.git#master```
* Install crypto-js library if using examples: ```bower install js-md5```
* Add contents from /example to /www of the Cordova project, replacing if necessary
* Build and run the Cordova project



### Example Usage
A few examples, but the example app is your best resource.

#### Initialize
```
  $cordovaBluetoothLE.initialize({request:true}).then(null,
    function(obj) {
      //Handle errors
    },
    function(obj) {
      //Handle successes
    }
  );
```

Initialize uses the notify callback to keep track of changes in the Bluetooth state (on/off).

#### Scan
```
  $cordovaBluetoothLE.startScan({services:[]}).then(null,
    function(obj) {
      //Handle errors
      console.log(obj.message);
    },
    function(obj) {
      if (obj.status == "scanResult")
      {
        //Device found
      }
      else if (obj.status == "scanStarted")
      {
        //Scan started
      }
    }
  );
```

Scan uses the notify callback as well since multiple scanned devices may be returned.

#### Connect
```
  $cordovaBluetoothLE.connect({address:"ABCDEFG"}).then(null,
    function(obj) {
      //Handle errors
      console.log(obj.message);
    },
    function(obj) {
      if (obj.status == "connected") {
        //Device connected
      } else {
        //Device disconnected, handle this unexpected disconnect
      }
    }
  );
```

Connect uses the notify callback as well since the connection state may change. See useResolve option below for resolve vs notify.



## Available Functions
For details on each function, please visit https://github.com/randdusing/cordova-plugin-bluetoothle. A few methods require you wait for notify rather than resolve since the callback may be called multiple times: intialize, startScan, connect, reconnect, disconnect, subscribe. Enable and disable only wait for error since the "success" is returned to the initialize

* $cordovaBluetoothLE.initialize(params).then(null, error, success);
* $cordovaBluetoothLE.enable().then(null, error); **Android**
* $cordovaBluetoothLE.disable().then(null, error); **Android**
* $cordovaBluetoothLE.startScan(params).then(null, error, success);
* $cordovaBluetoothLE.stopScan().then(success, error);
* $cordovaBluetoothLE.retrieveConnected(params).then(success, error);
* $cordovaBluetoothLE.connect(params).then(null, error, success);
* $cordovaBluetoothLE.reconnect(params).then(null, error, success);
* $cordovaBluetoothLE.disconnect(params).then(null, error, success);
* $cordovaBluetoothLE.close(params).then(success, error);
* $cordovaBluetoothLE.discover(params).then(success, error);
* $cordovaBluetoothLE.services(params).then(success, error); **iOS**
* $cordovaBluetoothLE.characteristics(params).then(success, error); **iOS**
* $cordovaBluetoothLE.descriptors(params).then(success, error); **iOS**
* $cordovaBluetoothLE.read(params).then(success, error);
* $cordovaBluetoothLE.subscribe(params).then(null, error, success);
* $cordovaBluetoothLE.unsubscribe(params).then(success, error);
* $cordovaBluetoothLE.write(params).then(success, error);
* $cordovaBluetoothLE.writeQ(params).then(success, error);
* $cordovaBluetoothLE.readDescriptor(params).then(success, error);
* $cordovaBluetoothLE.writeDescriptor(params).then(success, error);
* $cordovaBluetoothLE.rssi(params).then(success, error);
* $cordovaBluetoothLE.mtu(params).then(success, error); **Android**
* $cordovaBluetoothLE.requestConnectionPriority(params).then(success, error); **Android**
* $cordovaBluetoothLE.isInitialized(params).then(success);
* $cordovaBluetoothLE.isEnabled(params).then(success);
* $cordovaBluetoothLE.isScanning(params).then(success);
* $cordovaBluetoothLE.wasConnected(params).then(success, error);
* $cordovaBluetoothLE.isConnected(params).then(success, error);
* $cordovaBluetoothLE.isDiscovered(params).then(success, error);
* $cordovaBluetoothLE.hasPermission().then(success, error); **Android 6.0+**
* $cordovaBluetoothLE.requestPermission().then(success, error); **Android 6.0+**
* $cordovaBluetoothLE.isLocationEnabled().then(success, error); **Android 6.0+**
* $cordovaBluetoothLE.requestLocation().then(success, error); **Android 6.0+**
* $cordovaBluetoothLE.initializePeripheral(params).then(success, error);
* $cordovaBluetoothLE.addService(params).then(success, error);
* $cordovaBluetoothLE.removeService(params).then(success, error);
* $cordovaBluetoothLE.removeAllServices().then(success, error);
* $cordovaBluetoothLE.startAdvertising().then(success, error);
* $cordovaBluetoothLE.stopAdvertising().then(success, error);
* $cordovaBluetoothLE.isAdvertising().then(success, error);
* $cordovaBluetoothLE.respond(params).then(success, error);
* $cordovaBluetoothLE.notify(params).then(success, error);
* $cordovaBluetoothLE.encodedStringToBytes(encodedString);
* $cordovaBluetoothLE.bytesToEncodedString(bytes);
* $cordovaBluetoothLE.stringToBytes(string);
* $cordovaBluetoothLE.bytesToString(bytes);

### Options ###
* useResolve - If true, forces connect and reconnect to resolve the promise rather than using notify.
* timeout - If set, the operation will timeout with an error after X milliseconds. Available on connect, reconnect, discover, services, characteristics, descriptors, read, subscribe, unsubscribe, write, readDescriptor, writeDescriptor, rssi, mtu, requestConnectionPriority.
* scanTimeout - On a successful scan start, automatically stop the scan after X milliseconds.
* subscribeTimeout - On a successful subscribe, automatically unsubscribe after X milliseconds.

### Examples ###
Some examples are provided to help demonstrate different common scenarios. Looking for more examples? Let me know!

* Throughput (Central) - Transfers a file to another device running Throughput (Peripheral). Make sure to start the Throughput (Peripheral) test first.
* Throughput (Peripheral) - Receives a file from another device running Throughput (Central).
* Read All - Scans for first available device, connects to it, discovers it, iterates through all characteristics and reads them, disconnects and finally closes. This provides a good example of promise chains.

### Queueing Operations ###
Example of how you could queue up three read operations.
```javascript
  $cordovaBluetoothLE.read(params1).then(function() { //Read 1
    return $cordovaBluetoothLE.read(params2); //Read 2
  }).then(function() {
    return $cordovaBluetoothLE.read(params3); //Read 3
  }).catch(function(err) {
    console.log(err); //Catch any errors
  });
```

## Have a question or found a bug?

[Open an issue](https://github.com/randdusing/ng-cordova-bluetoothle/issues).

## Resources

AngularJS - [http://www.angularjs.org](http://www.angularjs.org)

Apache Cordova - [http://cordova.apache.org](http://cordova.apache.org)

### License and Source
The code that powers the 'build generation' is a carbon copy (with minimal changes) of [Nic Raboy's ngCordovaBeacon project](https://github.com/nraboy/ng-cordova-beacon).  As of the Fork, it was licensed under the MIT license;  The Cordova Wrapper was written by myself, and my employer and I retain the copyright for that; but this project is also licensed under the [MIT License](LICENSE.md).

If you want to follow more of Nic's work, his blog is located [here](https://blog.nraboy.com). If you want to know more about me or Jewelbots, you can follow [Jewelbots](http://twitter.com/jewelbots) on twitter, [our Ink](https://medium.com/jewelbots-weblog), or [me](http://twitter.com/gortok).

### Contributing
Rand Dusing - Primary author of the [Cordova Bluetooth LE Plugin](https://github.com/randdusing/cordova-plugin-bluetoothle). You can contact me via: <randdusing@gmail.com>, [Facebook](https://www.facebook.com/randdusing), [LinkedIn](https://www.linkedin.com/in/randdusing) or [Twitter](https://twitter.com/randdusing).
