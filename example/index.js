angular.module('myApp', ['ionic', 'ngCordovaBluetoothLE'])

//For live reload debugging
.run(function($state, $ionicPlatform) {
  $ionicPlatform.ready(function() {
    $state.go("tab.central");
  });

  //Slice shim for iOS
  Uint8Array.prototype.slice = function(start, end) {
    if (end === undefined) {
      end = this.length;
    }
    if (end > this.length) {
      end = this.length;
    }

    var length = end - start;
    var out = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      out[i] = this[i + start];
    }
    return out;
  };
})

.config(function($stateProvider, $urlRouterProvider) {
   $stateProvider.state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'tabs.html'
  })

  .state('tab.central', {
    url: '/central',
    views: {
      'tab-central': {
        templateUrl: 'central.html',
        controller: 'CentralCtrl'
      }
    }
  })
  .state('tab.device', {
    url: '/central/:address',
    views: {
      'tab-central': {
        templateUrl: 'device.html',
        controller: 'DeviceCtrl'
      }
    }
  })
  .state('tab.service', {
    url: '/central/:address/:service',
    views: {
      'tab-central': {
        templateUrl: 'service.html',
        controller: 'ServiceCtrl'
      }
    }
  })
  .state('tab.characteristic', {
    url: '/central/:address/:service/:characteristic',
    views: {
      'tab-central': {
        templateUrl: 'characteristic.html',
        controller: 'CharacteristicCtrl'
      }
    }
  })
  .state('tab.peripheral', {
    url: '/peripheral',
    views: {
      'tab-peripheral': {
        templateUrl: 'peripheral.html',
        controller: 'PeripheralCtrl'
      }
    }
  })
 .state('tab.examples', {
    url: '/examples',
    views: {
      'tab-examples': {
        templateUrl: 'examples.html',
        controller: 'ExamplesCtrl'
      }
    }
  })
  .state('tab.log', {
    url: '/log',
    views: {
      'tab-log': {
        templateUrl: 'log.html',
        controller: 'LogCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/tab/central');
})

.controller('CentralCtrl', function($scope, $rootScope, $state, $cordovaBluetoothLE, Log) {
  $rootScope.devices = {};

  $scope.clear = function() {
    for (var address in $rootScope.devices) {
      if ($rootScope.devices.hasOwnProperty(address)) {
        $cordovaBluetoothLE.close({address: address});
      }
    }

    $rootScope.devices = {};
  };

  $scope.delete = function(address) {
    $cordovaBluetoothLE.close({address: address});
    delete $rootScope.devices[address];
  };

  $scope.goToDevice = function(device) {
    $state.go("tab.device", {address:device.address});
  };

  $rootScope.isEmpty = function() {
    if (Object.keys($rootScope.devices).length === 0) {
      return true;
    }
    return false;
  };

  $rootScope.initialize = function() {
    var params = {
      request: true,
      //restoreKey: "bluetooth-test-app"
    };

    Log.add("Initialize : " + JSON.stringify(params));

    $cordovaBluetoothLE.initialize(params).then(null, function(obj) {
      Log.add("Initialize Error : " + JSON.stringify(obj)); //Should only happen when testing in browser
    }, function(obj) {
      Log.add("Initialize Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.enable = function() {
    Log.add("Enable");

    $cordovaBluetoothLE.enable().then(null, function(obj) {
      Log.add("Enable Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.disable = function() {
    Log.add("Disable");

    $cordovaBluetoothLE.disable().then(null, function(obj) {
      Log.add("Disable Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.startScan = function() {
    var params = {
      services:[],
      allowDuplicates: false,
      //scanTimeout: 15000,
    };

    if (window.cordova) {
      params.scanMode = bluetoothle.SCAN_MODE_LOW_POWER;
      params.matchMode = bluetoothle.MATCH_MODE_STICKY;
      params.matchNum = bluetoothle.MATCH_NUM_ONE_ADVERTISEMENT;
      //params.callbackType = bluetoothle.CALLBACK_TYPE_FIRST_MATCH;
    }

    Log.add("Start Scan : " + JSON.stringify(params));

    $cordovaBluetoothLE.startScan(params).then(function(obj) {
      Log.add("Start Scan Auto Stop : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Start Scan Error : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Start Scan Success : " + JSON.stringify(obj));

      addDevice(obj);
    });
  };

  $rootScope.stopScan = function() {
    Log.add("Stop Scan");

    $cordovaBluetoothLE.stopScan().then(function(obj) {
      Log.add("Stop Scan Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Stop Scan Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.retrieveConnected = function() {
    var params = {services:["180D"]};

    Log.add("Retrieve Connected : " + JSON.stringify(params));

    $cordovaBluetoothLE.retrieveConnected(params).then(function(obj) {
      Log.add("Retrieve Connected Success : " + JSON.stringify(obj));

      for (var i = 0; i < obj.length; i++) {
        addDevice(obj[i]);
      }
    }, function(obj) {
      Log.add("Retrieve Connected Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.isInitialized = function() {
    Log.add("Is Initialized");

    $cordovaBluetoothLE.isInitialized().then(function(obj) {
      Log.add("Is Initialized Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.isEnabled = function() {
    Log.add("Is Enabled");

    $cordovaBluetoothLE.isEnabled().then(function(obj) {
      Log.add("Is Enabled Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.isScanning = function() {
    Log.add("Is Scanning");

    $cordovaBluetoothLE.isScanning().then(function(obj) {
      Log.add("Is Scanning Success : " + JSON.stringify(obj));
    });
  };

  function addDevice(obj) {
    if (obj.status == "scanStarted") {
      return;
    }

    if ($rootScope.devices[obj.address] !== undefined) {
      return;
    }

    obj.services = {};
    $rootScope.devices[obj.address] = obj;
  }

  $rootScope.hasPermission = function() {
    Log.add("Has Permission");

    $cordovaBluetoothLE.hasPermission().then(function(obj) {
      Log.add("Has Permission Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Has Permission Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.requestPermission = function() {
    Log.add("Request Permission");

    $cordovaBluetoothLE.requestPermission().then(function(obj) {
      Log.add("Request Permission Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Request Permission Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.isLocationEnabled = function() {
    Log.add("Is Location Enabled");

    $cordovaBluetoothLE.isLocationEnabled().then(function(obj) {
      Log.add("Is Location Enabled Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Is Location Enabled Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.requestLocation = function() {
    Log.add("Request Location");

    $cordovaBluetoothLE.requestLocation().then(function(obj) {
      Log.add("Request Location Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Request Location Error : " + JSON.stringify(obj));
    });
  };
})

.controller('DeviceCtrl', function($scope, $rootScope, $state, $stateParams, $ionicHistory, $cordovaBluetoothLE, $interval, Log) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $rootScope.selectedDevice = $rootScope.devices[$stateParams.address];
  });

  $scope.goToService = function(service) {
    $state.go("tab.service", {address:$rootScope.selectedDevice.address, service: service.uuid});
  };

  $rootScope.connect = function(address) {
    var params = {address:address, timeout: 10000};

    Log.add("Connect : " + JSON.stringify(params));

    $cordovaBluetoothLE.connect(params).then(null, function(obj) {
      Log.add("Connect Error : " + JSON.stringify(obj));
      $rootScope.close(address); //Best practice is to close on connection error
    }, function(obj) {
      Log.add("Connect Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.reconnect =function(address) {
    var params = {address:address, timeout: 10000};

    Log.add("Reconnect : " + JSON.stringify(params));

    $cordovaBluetoothLE.reconnect(params).then(null, function(obj) {
      Log.add("Reconnect Error : " + JSON.stringify(obj));
      $rootScope.close(address); //Best practice is to close on connection error
    }, function(obj) {
      Log.add("Reconnect Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.disconnect = function(address) {
    var params = {address:address};

    Log.add("Disconnect : " + JSON.stringify(params));

    $cordovaBluetoothLE.disconnect(params).then(function(obj) {
      Log.add("Disconnect Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Disconnect Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.bond = function(address) {
    var params = {address:address};

    Log.add("Bond : " + JSON.stringify(params));

    $cordovaBluetoothLE.bond(params).then(null, function(obj) {
      Log.add("Bond Error : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Bond Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.unbond = function(address) {
    var params = {address:address};

    Log.add("Unbond : " + JSON.stringify(params));

    $cordovaBluetoothLE.unbond(params).then(function(obj) {
      Log.add("Unbond Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Unbond Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.close = function(address) {
    var params = {address:address};

    Log.add("Close : " + JSON.stringify(params));

    $cordovaBluetoothLE.close(params).then(function(obj) {
     Log.add("Close Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Close Error : " + JSON.stringify(obj));
    });

    var device = $rootScope.devices[address];
    device.services = {};
  };

  $rootScope.discover = function(address) {
    var params = {
      address: address,
      timeout: 10000
    };

    Log.add("Discover : " + JSON.stringify(params));

    $cordovaBluetoothLE.discover(params).then(function(obj) {
      Log.add("Discover Success : " + JSON.stringify(obj));

      var device = $rootScope.devices[obj.address];

      var services = obj.services;

      for (var i = 0; i < services.length; i++) {
        var service = services[i];

        addService(service, device);

        var serviceNew = device.services[service.uuid];

        var characteristics = service.characteristics;

        for (var j = 0; j < characteristics.length; j++) {
          var characteristic = characteristics[j];

          addCharacteristic(characteristic, serviceNew);

          var characteristicNew = serviceNew.characteristics[characteristic.uuid];

          var descriptors = characteristic.descriptors;

          for (var k = 0; k < descriptors.length; k++) {
            var descriptor = descriptors[k];

            addDescriptor(descriptor, characteristicNew);
          }
        }
      }
    }, function(obj) {
      Log.add("Discover Error : " + JSON.stringify(obj));
    });
  };

  function addService(service, device) {
    if (device.services[service.uuid] !== undefined) {
      return;
    }
    device.services[service.uuid] = {uuid : service.uuid, characteristics: {}};
  }

  function addCharacteristic(characteristic, service) {
    if (service.characteristics[characteristic.uuid] !== undefined) {
      return;
    }
    service.characteristics[characteristic.uuid] = {uuid: characteristic.uuid, descriptors: {}, properties: characteristic.properties};
  }

  function addDescriptor(descriptor, characteristic) {
    if (characteristic.descriptors[descriptor.uuid] !== undefined) {
      return;
    }
    characteristic.descriptors[descriptor.uuid] = {uuid : descriptor.uuid};
  }

  $rootScope.services = function(address) {
    var params = {
      address:address,
      services:[],
      timeout: 5000
    };

    Log.add("Services : " + JSON.stringify(params));

    $cordovaBluetoothLE.services(params).then(function(obj) {
      Log.add("Services Success : " + JSON.stringify(obj));

      var device = $rootScope.devices[obj.address];

      for (var i = 0; i < obj.services.length; i++) {
        addService({uuid: obj.services[i]}, device);
      }
    }, function(obj) {
      Log.add("Services Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.characteristics = function(address, service) {
    var params = {
      address: address,
      service: service,
      characteristics: [],
      timeout: 5000
    };

    Log.add("Characteristics : " + JSON.stringify(params));

    $cordovaBluetoothLE.characteristics(params).then(function(obj) {
      Log.add("Characteristics Success : " + JSON.stringify(obj));

      var device = $rootScope.devices[obj.address];
      var service = device.services[obj.service];

      for (var i = 0; i < obj.characteristics.length; i++) {
        addCharacteristic(obj.characteristics[i], service);
      }
    }, function(obj) {
      Log.add("Characteristics Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.descriptors = function(address, service, characteristic) {
    var params = {
      address: address,
      service: service,
      characteristic: characteristic,
      timeout: 5000
    };

    Log.add("Descriptors : " + JSON.stringify(params));

    $cordovaBluetoothLE.descriptors(params).then(function(obj) {
      Log.add("Descriptors Success : " + JSON.stringify(obj));

      var device = $rootScope.devices[obj.address];
      var service = device.services[obj.service];
      var characteristic = service.characteristics[obj.characteristic];

      var descriptors = obj.descriptors;

      for (var i = 0; i < descriptors.length; i++) {
        addDescriptor({uuid: descriptors[i]}, characteristic);
      }
    }, function(obj) {
      Log.add("Descriptors Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.read = function(address, service, characteristic) {
    //Set this to something higher to verify queueing on read/write
    var count = 1;

    $interval(function() {
      var params = {address:address, service:service, characteristic:characteristic, timeout: 5000};

      //Uncomment if you'd like to force some errors
      /*var random = Math.random();
      if (random < .50) {
        params.address = "AA:AA:AA:AA:AA:AA";
      }*/

      Log.add("Read : " + JSON.stringify(params));

      $cordovaBluetoothLE.read(params).then(function(obj) {
        params.address = address;
        Log.add("Read Success : " + JSON.stringify(obj));

        if (!obj.value) {
          return;
        }

        var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
        Log.add("ASCII (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToString(bytes));
        Log.add("HEX (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToHex(bytes));
      }, function(obj) {
        Log.add("Read Error : " + JSON.stringify(obj));
      });
    }, 1, count);

  };

  $rootScope.subscribe = function(address, service, characteristic) {
    var params = {
      address:address,
      service:service,
      characteristic:characteristic,
      timeout: 5000,
      //subscribeTimeout: 5000
    };

    Log.add("Subscribe : " + JSON.stringify(params));

    $cordovaBluetoothLE.subscribe(params).then(function(obj) {
      Log.add("Subscribe Auto Unsubscribe : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Subscribe Error : " + JSON.stringify(obj));
    }, function(obj) {
      //Log.add("Subscribe Success : " + JSON.stringify(obj));

      if (obj.status == "subscribedResult") {
        //Log.add("Subscribed Result");
        var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
        Log.add("Subscribe Success ASCII (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToString(bytes));
        Log.add("HEX (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToHex(bytes));
      } else if (obj.status == "subscribed") {
        Log.add("Subscribed");
      } else {
        Log.add("Unexpected Subscribe Status");
      }
    });
  };

  $rootScope.unsubscribe = function(address, service, characteristic) {
    var params = {
      address: address,
      service: service,
      characteristic: characteristic,
      timeout: 5000
    };

    Log.add("Unsubscribe : " + JSON.stringify(params));

    $cordovaBluetoothLE.unsubscribe(params).then(function(obj) {
      Log.add("Unsubscribe Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Unsubscribe Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.write = function(address, service, characteristic) {
    //Set this to something higher to verify queueing on read/write
    var count = 1;

    $interval(function() {
      var params = {
        address: address,
        service: service,
        characteristic: characteristic,
        value: $cordovaBluetoothLE.bytesToEncodedString($cordovaBluetoothLE.stringToBytes("Hello World")),
        timeout: 5000
      };

      //Uncomment if you'd like to force some errors
      /*var random = Math.random();
      if (random < .50) {
        params.address = "AA:AA:AA:AA:AA:AA";
      }*/

      Log.add("Write : " + JSON.stringify(params));
      $cordovaBluetoothLE.write(params).then(function(obj) {
        Log.add("Write Success : " + JSON.stringify(obj));
      }, function(obj) {
        Log.add("Write Error : " + JSON.stringify(obj));
      });
    }, 1, count);
  };

  $rootScope.writeQ = function(address, service, characteristic) {
    var params = {
      address: address,
      service: service,
      characteristic: characteristic,
      value: $cordovaBluetoothLE.bytesToEncodedString($cordovaBluetoothLE.stringToBytes("Hello World Hello World Hello World Hello World Hello World")),
      type: "noResponse",
      timeout: 5000
    };

    Log.add("WriteQ : " + JSON.stringify(params));

    $cordovaBluetoothLE.writeQ(params).then(function(obj) {
      Log.add("WriteQ Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("WriteQ Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.readDescriptor = function(address, service, characteristic, descriptor) {
    var params = {address:address, service:service, characteristic:characteristic, descriptor:descriptor, timeout: 5000};

    Log.add("Read Descriptor : " + JSON.stringify(params));

    $cordovaBluetoothLE.readDescriptor(params).then(function(obj) {
      Log.add("Read Descriptor Success : " + JSON.stringify(obj));

      if (obj.value && (!obj.type || obj.type == "data")) {
        var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
        Log.add("ASCII (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToString(bytes));
        Log.add("HEX (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToHex(bytes));
      }
    }, function(obj) {
      Log.add("Read Descriptor Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.writeDescriptor = function(address, service, characteristic, descriptor) {
    var params = {
      address: address,
      service: service,
      characteristic: characteristic,
      descriptor: descriptor,
      timeout: 5000
    };

    if (ionic.Platform.isIOS()) {
      params.type = "number";
      params.value = 0;
    } else {
      params.value = $cordovaBluetoothLE.bytesToEncodedString($cordovaBluetoothLE.stringToBytes("123"));
    }

    Log.add("Write Descriptor : " + JSON.stringify(params));

    $cordovaBluetoothLE.writeDescriptor(params).then(function(obj) {
      Log.add("Write Descriptor Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Write Descriptor Error : " + JSON.stringify(obj));
    });
  };
  
  $rootScope.isBonded = function(address) {
    var params = {address:address};

    Log.add("Is Bonded : " + JSON.stringify(params));

    $cordovaBluetoothLE.isBonded(params).then(function(obj) {
      Log.add("Is Bonded Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Is Bonded Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.wasConnected = function(address) {
    var params = {address:address};

    Log.add("Was Connected : " + JSON.stringify(params));

    $cordovaBluetoothLE.wasConnected(params).then(function(obj) {
      Log.add("Was Connected Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Was Connected Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.isConnected = function(address) {
    var params = {address:address};

    Log.add("Is Connected : " + JSON.stringify(params));

    $cordovaBluetoothLE.isConnected(params).then(function(obj) {
      Log.add("Is Connected Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Is Connected Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.isDiscovered = function(address) {
    var params = {address:address};

    Log.add("Is Discovered : " + JSON.stringify(params));

    $cordovaBluetoothLE.isDiscovered(params).then(function(obj) {
      Log.add("Is Discovered Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Is Discovered Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.rssi = function(address) {
    var params = {address:address, timeout: 5000};

    Log.add("RSSI : " + JSON.stringify(params));

    $cordovaBluetoothLE.rssi(params).then(function(obj) {
      Log.add("RSSI Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("RSSI Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.mtu = function(address) {
    var params = {address:address, mtu: 10, timeout: 5000};

    Log.add("MTU : " + JSON.stringify(params));

    $cordovaBluetoothLE.mtu(params).then(function(obj) {
      Log.add("MTU Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("MTU Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.requestConnectionPriority = function(address) {
    var params = {address:address, connectionPriority:"high", timeout: 5000};

    Log.add("Request Connection Priority : " + JSON.stringify(params));

    $cordovaBluetoothLE.requestConnectionPriority(params).then(function(obj) {
      Log.add("Request Connection Priority Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Request Connection Priority Error : " + JSON.stringify(obj));
    });
  };
})

.controller('ServiceCtrl', function($scope, $rootScope, $state, $stateParams, $cordovaBluetoothLE, Log) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $rootScope.selectedService = $rootScope.selectedDevice.services[$stateParams.service];
  });

  $scope.goToCharacteristic = function(characteristic) {
    $state.go("tab.characteristic", {address:$rootScope.selectedDevice.address, service: $rootScope.selectedService.uuid, characteristic: characteristic.uuid});
  };
})

.controller('CharacteristicCtrl', function($scope, $rootScope, $stateParams, $cordovaBluetoothLE, Log) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $scope.selectedCharacteristic = $rootScope.selectedService.characteristics[$stateParams.characteristic];
  });
})

.controller('PeripheralCtrl', function($scope, $rootScope, $stateParams, $interval, $cordovaBluetoothLE, Log) {
  var readBytes = $cordovaBluetoothLE.stringToBytes("Read Hello World");

  $scope.centrals = {};

  $rootScope.initializePeripheral = function() {
    var params = {
      request: true,
      //restoreKey: "bluetooth-test-app"
    };

    Log.add("Initialize Peripheral: " + JSON.stringify(params));

    $cordovaBluetoothLE.initializePeripheral(params).then(null, function(obj) {
      Log.add("Initialize Peripheral Error : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Initialize Peripheral Success : " + JSON.stringify(obj));

      switch (obj.status) {
        case "readRequested":
          readRequested(obj);
          break;
        case "writeRequested":
          writeRequested(obj);
          break;
        case "subscribed":
          subscribed(obj);
          break;
        case "unsubscribed":
          unsubscribed(obj);
          break;
        case "notificationReady":
          notificationReady(obj);
          break;
        case "connected":
          connected(obj);
          break;
        case "disconnected":
          disconnected(obj);
          break;
        case "mtuChanged":
          mtuChanged(obj);
          break;
        default:
          break;
      }
    });
  };

  function readRequested(obj) {
    Log.add("Read Requested: " + JSON.stringify(obj));

    //TODO send error if necessary
    if (obj.offset > readBytes.length) {
      Log.add("Oops, an error occurred");
    }

    //NOTES maximum length was around 6xx, 512 is Bluetooth standards maximum

    var slice = readBytes.slice(obj.offset);

    var params = {
      requestId: obj.requestId,
      value: $cordovaBluetoothLE.bytesToEncodedString(slice),
      //code: "invalidHandle", //Adjust error code
    };

    if (obj.address) {
      params.address = obj.address;
    }

    respond(params);
  }

  function writeRequested(obj) {
    Log.add("Write Requested: " + JSON.stringify(obj));

    var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
    //TODO send error if necessary
    if (obj.offset > bytes.length) {
      Log.add("Oops, an error occurred");
    }

    Log.add("Value: " + $cordovaBluetoothLE.bytesToString(bytes));

    var params = {
      requestId: obj.requestId,
      value: $cordovaBluetoothLE.bytesToEncodedString(bytes),
    };

    if (obj.address) {
      params.address = obj.address;
    }

    respond(params);
  }

  function respond(params) {
    Log.add("Respond: " + JSON.stringify(params));
    $cordovaBluetoothLE.respond(params).then(function(obj) {
      Log.add("Respond Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Respond Error : " + JSON.stringify(obj));
    });
  }

  var interval = null;

  function subscribed(obj) {
    Log.add("Subscribed: " + JSON.stringify(obj));

    //NOTES Maximum length was 155

    interval = $interval(function() {
      var params = {
        service: obj.service,
        characteristic: obj.characteristic,
        value: $cordovaBluetoothLE.bytesToEncodedString($cordovaBluetoothLE.stringToBytes("Subscribed!")),
      };

      if (obj.address) {
        params.address = obj.address;
      }

      Log.add("Notify:" + JSON.stringify(params));
      $cordovaBluetoothLE.notify(params).then(function(obj) {
        Log.add("Notify Success : " + JSON.stringify(obj));
        if (!obj.sent) {
          Log.add("Notification queue is busy, stopping subscription");
          //Value wasn't sent
          //Wait until Peripheral Manager Is Ready to Update Subscribers before starting again
          $interval.cancel(interval);
        }
      }, function(obj) {
        Log.add("Notify Error : " + JSON.stringify(obj));
      });
    }, 1000);
  }

  function unsubscribed(obj) {
    Log.add("Unsubscribed to Characteristic: " + JSON.stringify(obj));

    //TODO Manage this per device
    $interval.cancel(interval);
  }

  function notificationReady(obj) {
    Log.add("Notification Ready");
    //Restart sending updates
  }

  function connected(obj) {
    $scope.centrals[obj.address] = {
      address: obj.address,
      name: obj.name,
    };
  }

  function disconnected(obj) {
    delete $scope.centrals[obj.address];
  }

  function mtuChanged(obj) {
    Log.add("MTU Changed:" + JSON.stringify(obj));
  }

  $rootScope.addService = function() {
    var params = {
      service: "1234",
      characteristics: [
        {
          uuid: "ABCD",
          permissions: {
            read: true,
            write: true,
            //readEncryptionRequired: true,
            //writeEncryptionRequired: true,
          },
          properties : {
            read: true,
            writeWithoutResponse: true,
            write: true,
            notify: true,
            //indicate: true,
            //authenticatedSignedWrites: true,
            //notifyEncryptionRequired: true,
            //indicateEncryptionRequired: true,
          },
          value: "base64encodedstring"
        },
      ]
    };

    Log.add("Add Service: " + JSON.stringify(params));

    $cordovaBluetoothLE.addService(params).then(function(obj) {
      Log.add("Add Service Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Add Service Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.removeService = function() {
    var params = {
      service: "1234",
    };

    Log.add("Remove Service: " + JSON.stringify(params));

    $cordovaBluetoothLE.removeService(params).then(function(obj) {
      Log.add("Remove Service Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Remove Service Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.removeAllServices = function() {
    Log.add("Remove All Services");

    $cordovaBluetoothLE.removeAllServices().then(function(obj) {
      Log.add("Remove All Services Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Remove All Services Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.startAdvertising = function() {
    var params = {
      services: ["1234"],
      service: "1234",
      name: "Hello World",
      mode: "lowLatency",
      connectable: true,
      timeout: 500,
      powerLevel: "high",
      manufacturerId: 01,
      manufacturerSpecificData: "Rand",
    };

    Log.add("Start Advertising: " + JSON.stringify(params));

    $cordovaBluetoothLE.startAdvertising(params).then(function(obj) {
      Log.add("Start Advertising Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Start Advertising Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.stopAdvertising = function() {
    Log.add("Stop Advertising");

    $cordovaBluetoothLE.stopAdvertising().then(function(obj) {
      Log.add("Stop Advertising Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Stop Advertising Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.isAdvertising = function() {
    Log.add("Is Advertising");

    $cordovaBluetoothLE.isAdvertising().then(function(obj) {
      Log.add("Is Advertising Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Is Advertising Error : " + JSON.stringify(obj));
    });
  };
})

.controller('LogCtrl', function($scope, $rootScope, $stateParams, $cordovaBluetoothLE, $ionicScrollDelegate, Log) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $ionicScrollDelegate.scrollBottom();
  });

  $scope.clear = function() {
    Log.clear();
  };

  /*$rootScope.$watch('log', function() {
    $ionicScrollDelegate.scrollBottom();
  })*/

  //TODO Automatically scroll to bottom when on LogCtrl page?
})

.controller('ExamplesCtrl', function($scope, $stateParams, $cordovaBluetoothLE, $q, $timeout, $ionicPopup, $ionicListDelegate, $ionicLoading, Log) {
  $scope.fileSize = 5000;
  $scope.packetSize = 128;
  $scope.isNormalWrite = false;
  $scope.isNotification = true;

  var service = "1234";
  var characteristic = "ABCD";

  $scope.throughputCentral = function() {
    var saveDevice = null;

    promptPeripheral().then(function() {
      return promptFileSize();
    }).then(function() {
      return confirmWriteType();
    }).then(function() {
      return promptPacketSize();
    }).then(function() {
      return confirmNotificationType();
    }).then(function() {
      $ionicLoading.show();
      return checkInitialize();
    }).then(function() {
      return find(service);
    }).then(function(device) {
      saveDevice = device;
      return connect(device);
    }).then(function() {
      return transfer(saveDevice);
    }).then(function(msg) {
      Log.add("Throughput Test Successful: " + JSON.stringify(msg));
    }).catch(function(msg) {
      Log.add("Throughput Test Unsuccessful: " + JSON.stringify(msg))
    }).finally(function() {
      if (saveDevice) {
        $cordovaBluetoothLE.unsubscribe({
          address: saveDevice.address,
          service: service,
          characteristic: characteristic
        }).finally(function() {
          $cordovaBluetoothLE.close({
            address: saveDevice.address
          });
        });
      }
      $ionicLoading.hide();
    });
  };

  function promptPeripheral() {
    return $ionicPopup.confirm({
      title: 'Peripheral Available',
      template: 'Did you already start the test on the peripheral?',
      cancelText: "No",
      okText: "Yes",
    }).then(function(res) {
      if (res) {
        return $q.resolve();
      } else {
        return $q.reject("Peripheral must be started first");
      }
    });
  }

  function promptFileSize() {
    return $ionicPopup.prompt({
      title: 'File Size',
      template: 'How many bytes?',
      inputType: 'number',
      defaultText: $scope.fileSize,
    }).then(function(res) {
      if (res === undefined) {
        return $q.reject("User didn't define file size");
      }

      var check = parseInt(res);
      $scope.fileSize = isNaN(check) ? $scope.fileSize : check;

      if ($scope.fileSize <= 0) {
        return $q.reject("Packet size must be a positive integer");
      }

      return $q.resolve();
    });
  }

  function promptPacketSize() {
    return $ionicPopup.prompt({
      title: 'Packet Size',
      template: 'How many bytes? Min 1, Max 512',
      inputType: 'number',
      defaultText: $scope.packetSize,
    }).then(function(res) {
      if (res === undefined) {
        return $q.reject("User didn't define packet size");
      }

      var check = parseInt(res);
      $scope.packetSize = isNaN(check) ? $scope.packetSize : check;

      if ($scope.packetSize <= 0) {
        return $q.reject("Packet size must be a minimum of 1 byte");
      }

      if ($scope.packetSize > 512) {
        return $q.reject("Packet size must be a maximum of 512 bytes");
      }

      return $q.resolve();
    });
  }

  function confirmWriteType() {
    return $ionicPopup.confirm({
      title: 'Write Type',
      template: 'Should the write be normal (rather than without response)?',
      cancelText: "No",
      okText: "Yes",
    }).then(function(res) {
      $scope.isNormalWrite = res;
    });
  }

  function confirmNotificationType() {
    return $ionicPopup.confirm({
      title: 'Notification Type',
      template: 'Should the notification be normal (rather than indication)?',
      cancelText: "No",
      okText: "Yes",
    }).then(function(res) {
      $scope.isNotification = res;
    });
  }

  function checkInitialize() {
    var q = $q.defer();

    Log.add("Initializing...");

    $cordovaBluetoothLE.isInitialized().then(function(obj) {
      if (obj.isInitialized) {
        return q.resolve();
      } else {
        $cordovaBluetoothLE.initialize().then(null, function(obj) {
          return q.reject(obj.message);
        }, function(obj) {
          return q.resolve();
        });
      }
    }, function(obj) {
      return q.reject(obj.message);
    });

    return q.promise;
  }

  function find(service) {
    Log.add("Finding device");

    var q = $q.defer();

    var params = {
      scanTimeout: 10000
    };

    if (service) {
      params.services = [service];
    }

    $cordovaBluetoothLE.startScan(params).then(function() {
      return q.reject("Scan stopped without finding any devices");
    }, function(obj) {
      return q.reject(obj.message);
    }, function(obj) {
      if (obj.advertisement && obj.advertisement.isConnectable === false) {
        Log.add("Ignored Scan Result: " + JSON.stringify(obj));
        return;
      }
      if (obj.status == "scanResult") {
        return q.resolve(obj);
      }
    });

    q.promise.finally(function() {
      $cordovaBluetoothLE.stopScan();
    });

    return q.promise;
  }

  function connect(device) {
    Log.add("Connecting to device: " + device.name + " (" + device.address + ")");

    return $cordovaBluetoothLE.connect({
      address: device.address,
      useResolve: true,
      timeout: 5000,
    }).then(function() {
      return $cordovaBluetoothLE.discover({
        address: device.address,
        timeout: 5000,
      });
    });
  }

  function generateBytes(size) {
    var bytes = new Uint8Array(size);
    for (var i = 0; i < size; i++) {
      bytes[i] = Math.round(Math.random() * 255);
    }

    var hash = md5($cordovaBluetoothLE.bytesToString(bytes));
    Log.add("MD5: " + hash);

    return bytes;
  }

  function transfer(device) {
    Log.add("Throughput: beginning transfer");
    var q = $q.defer();

    var bytes = generateBytes($scope.fileSize);

    var packetCount = 0;
    var packetTotal = Math.ceil($scope.fileSize / $scope.packetSize);

    var params = {
      address: device.address,
      service: service,
      characteristic: characteristic,
    };

    var start = null;
    var writeTimeout = null;

    $cordovaBluetoothLE.subscribe(params).then(null, function(obj) {
      q.reject(obj.message);
    }, function(obj) {
      if (start === null) {
        start = (new Date()).getTime();
      }

      $timeout.cancel(writeTimeout);

      if (packetCount >= packetTotal) {
        /*
          We need to tell the peripheral when we are done transferring. Under ideal circumstances, we could just use the unsubscribe event, but this could be fired on disconnects or other errors. Instead, we need to write a different characteristic to tell it to end.
        */

        var diff = ((new Date()).getTime() - start) / 1000;
        q.resolve("Transfered " + $scope.fileSize/1000 + " KB in " + diff + " seconds with packets up to " + $scope.packetSize + " bytes, " + ($scope.fileSize/1000/diff).toFixed(3) + " KB/s");
        return;
      }

      var slice = bytes.slice(packetCount * $scope.packetSize, (packetCount + 1) * $scope.packetSize);
      var value = $cordovaBluetoothLE.bytesToEncodedString(slice);

      writeTimeout = $timeout(function() {
        q.reject("Timed out, no response after write");
      }, 2000);

      write(device, value).catch(function(obj) {
        q.reject(obj.message);
      });

      packetCount++;
    });

    return q.promise;
  }

  function write(device, value) {
    var params = {
      address: device.address,
      service: service,
      characteristic: characteristic,
      value: value
    };

    if (!$scope.isNormalWrite) {
      params.type = "noResponse";
    }

    return $cordovaBluetoothLE.write(params);
  }

  var file = null; //Keep track of record bytes
  var finish = null; //Promise to force main to wait
  var subscriberTimeout = null; //Timeout if no subscriptions are detected
  var writeTimeout = null; //Timeout if no write occurs. Something may have happened on the client side

  $scope.throughputPeripheral = function() {
    Log.add("Throughput: Peripheral");
    file = [];

    finish = $q.defer();

    subscriberTimeout = $timeout(function() {
      finish.reject("No subscribers");
    }, 60000);

    checkInitialize().then(function() {
      return initializePeripheral();
    }).then(function() {
      return removeAllServices();
    }).then(function() {
      return addService();
    }).then(function() {
      return startAdvertising();
    }).then(function() {
      return finish.promise;
    }).then(function(msg) {
      Log.add("Throughput Test Successful: " + JSON.stringify(msg));
    }).catch(function(msg) {
      Log.add("Throughput Test Unsuccessful: " + JSON.stringify(msg));
    }).finally(function() {
      stopAdvertising();
    });
  };

  //TODO Add throughput statistics similar to central side

  function initializePeripheral() {
    Log.add("Initializing Peripheral");

    var q = $q.defer();

    $cordovaBluetoothLE.initializePeripheral({}).then(null, function(obj) {
      q.reject(obj.message);
    }, function(obj) {
      q.resolve();

      //Log.add("Throughput: Initialize Peripheral Success : " + JSON.stringify(obj));

      switch (obj.status) {
        case "writeRequested":
          writeRequested(obj);
          break;
        case "subscribed":
          subscribed(obj);
          break;
        case "unsubscribed":
          unsubscribed(obj);
          break;
        case "notificationReady":
          notificationReady(obj);
          break;
        default:
          break;
      }
    });

    return q.promise;
  }

  function writeRequested(obj) {
    //TODO Cleanup this function

    //Log.add("Write Requested: " + JSON.stringify(obj));

    if (file === null) {
      Log.add("Write Requested when unexpected");
      return;
    }

    $timeout.cancel(writeTimeout);

    var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
    Array.prototype.push.apply(file, bytes);

    //Log.add("Value: " + $cordovaBluetoothLE.bytesToString(bytes));

    var params = {
      requestId: obj.requestId,
      value: $cordovaBluetoothLE.bytesToEncodedString(bytes),
    };

    if (obj.address) {
      params.address = obj.address;
    }

    //Log.add("Respond: " + JSON.stringify(params));
    $cordovaBluetoothLE.respond(params).then(function(obj) {
      //Log.add("Respond Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Respond Error : " + JSON.stringify(obj));
    });

    params = {
      service: obj.service,
      characteristic: obj.characteristic,
      value: $cordovaBluetoothLE.bytesToEncodedString($cordovaBluetoothLE.stringToBytes("Received")),
    };

    if (obj.address) {
      params.address = obj.address;
    }

    //Log.add("Notify:" + JSON.stringify(params));
    $cordovaBluetoothLE.notify(params).then(function(obj) {
      //Log.add("Notify Success : " + JSON.stringify(obj));
      if (!obj.sent) {
        Log.add("Unable to notify");
      }
    }, function(obj) {
      Log.add("Notify Error : " + JSON.stringify(obj));
    });

    createWriteTimeout();
  }

  function subscribed(obj) {
    $timeout.cancel(subscriberTimeout);
    createWriteTimeout();
  }

  function unsubscribed(obj) {
    //This will be called on disconnect as well
    $timeout.cancel(writeTimeout);

    if (file.length > 0) {
      var hash = md5($cordovaBluetoothLE.bytesToString(file));
      finish.resolve("MD5: " + hash + ", Length: " + file.length);
    } else {
      finish.reject("No bytes received");
    }
  }

  function notificationReady(obj) {
    Log.add("Throughput: Notification Ready");

    //TODO implement this, but it shouldn't occur unless notifications are being delivered super fast
  }

  function createWriteTimeout() {
    writeTimeout = $timeout(function() {
      finish.reject("Write timed out");
    }, 10000);
  }

  function addService() {
    Log.add("Adding Service");

    var params = {
      service: "1234",
      characteristics: [
        {
          uuid: "ABCD",
          permissions: {
            read: true,
            write: true,
          },
          properties : {
            read: true,
            writeWithoutResponse: true,
            write: true,
            notify: true,
            //indicate: true,
          }
        }
      ]
    };

    return $cordovaBluetoothLE.addService(params);
  }

  function removeAllServices() {
    Log.add("Remove All Services");
    return $cordovaBluetoothLE.removeAllServices();
  }

  function startAdvertising() {
    Log.add("Starting advertising");

    var params = {
      services: ["1234"], //iOS
      service: "1234", //Android
      name: "Throughput",
    };

    return $cordovaBluetoothLE.startAdvertising(params);
  }

  function stopAdvertising() {
    Log.add("Stopping advertising");

    return $cordovaBluetoothLE.stopAdvertising();
  }

  $scope.readAll = function() {
    var saveDevice = null;

    checkInitialize().then(function() {
      return find();
    }).then(function(obj) {
      saveDevice = obj;
      return connect(obj);
    }).then(function(obj) {
      return process(obj);
    }).then(function() {
      Log.add("Read All Success!");
    }).catch(function(msg) {
      Log.add("Read All Error: " + JSON.stringify(msg));
    }).finally(function() {
      if (saveDevice) {
        $cordovaBluetoothLE.close({address: saveDevice.address});
      }
    });
  };

  function process(device) {
    var promise = $q.when();

    for (var i = 0; i < device.services.length; i++) {
      var service = device.services[i];

      for (var j = 0; j < service.characteristics.length; j++) {
        var characteristic = service.characteristics[j];

        if (characteristic.properties.read) {
          promise = promise.then(read(device.address, service.uuid, characteristic.uuid));
        }
      }
    }

    return promise;
  }

  function read(address, service, characteristic) {
    return function() {
      var params = {address:address, service:service, characteristic:characteristic, timeout: 2000};

      Log.add("Read : " + JSON.stringify(params));

      return $cordovaBluetoothLE.read(params).then(function(obj) {
        Log.add("Read Success : " + JSON.stringify(obj));

        if (!obj.value) {
          return;
        }

        var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
        Log.add("ASCII (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToString(bytes));
        Log.add("HEX (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToHex(bytes));
      }, function(obj) {
        Log.add("Read Error : " + JSON.stringify(obj));
      });
    };
  }
})

.factory('Log', function($rootScope, $ionicPopup) {
  $rootScope.log = [];

  var add = function(message) {
    console.log(message);
    $rootScope.log.push({
      message: message,
      datetime: new Date().toISOString(),
    });
  };

  $rootScope.show = function(item) {
   $ionicPopup.show({
      template: item.message,
      title: 'Log',
      subTitle: item.datetime,
      buttons: [
        { text: 'Cancel' },
      ]
    });
  };

  var clear = function() {
    $rootScope.log = [];
  };

  return {
    add: add,
    clear: clear,
  };
})

.filter('null', function() {
  return function(value) {
    if (value === null || value === undefined) {
      return "<null>";
    }
    return value;
  };
});
