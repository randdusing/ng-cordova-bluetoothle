angular.module('myApp', ['ionic', 'ngCordovaBluetoothLE'])

//For live reload debugging
.run(function($state, $ionicPlatform) {
  $ionicPlatform.ready(function() {
    $state.go("tab.central");
  });
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
  }

  $scope.delete = function(address) {
    $cordovaBluetoothLE.close({address: address});
    delete $rootScope.devices[address];
  }

  $scope.goToDevice = function(device) {
    $state.go("tab.device", {address:device.address});
  };

  $scope.isEmpty = function() {
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
    Log.log("Is Location Enabled");

    $cordovaBluetoothLE.isLocationEnabled().then(function(obj) {
      Log.log("Is Location Enabled Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.log("Is Location Enabled Error : " + JSON.stringify(obj));
    });
  };
})

.controller('DeviceCtrl', function($scope, $rootScope, $state, $stateParams, $ionicHistory, $cordovaBluetoothLE, Log) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $rootScope.selectedDevice = $rootScope.devices[$stateParams.address];
  });

  $scope.goToService = function(service) {
    $state.go("tab.service", {address:$rootScope.selectedDevice.address, service: service.uuid});
  };

  $rootScope.connect = function(address) {
    var params = {address:address, timeout: 5000};

    Log.add("Connect : " + JSON.stringify(params));

    $cordovaBluetoothLE.connect(params).then(null, function(obj) {
      Log.add("Connect Error : " + JSON.stringify(obj));
      $rootScope.close(address); //Best practice is to close on connection error
    }, function(obj) {
      Log.add("Connect Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.reconnect =function(address) {
    var params = {address:address, timeout: 5000};

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
      address:address,
      timeout: 5000
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
    var params = {address:address, services:[]};

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
    var params = {address:address, service:service, characteristics:[]};

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
    var params = {address:address, service:service, characteristic:characteristic};

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
    var params = {address:address, service:service, characteristic:characteristic, timeout: 2000};

    Log.add("Read : " + JSON.stringify(params));

    $cordovaBluetoothLE.read(params).then(function(obj) {
      //Log.add("Read Success : " + JSON.stringify(obj));

      var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
      Log.add("Read Success ASCII (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToString(bytes));
    }, function(obj) {
      Log.add("Read Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.subscribe = function(address, service, characteristic) {
    var params = {
      address:address,
      service:service,
      characteristic:characteristic,
      timeout: 2000,
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
      } else if (obj.status == "subscribed") {
        Log.add("Subscribed");
      } else {
        Log.add("Unexpected Subscribe Status");
      }
    });
  };

  $rootScope.unsubscribe = function(address, service, characteristic) {
    var params = {
      address:address,
      service:service,
      characteristic:characteristic,
      timeout: 2000
    };

    Log.add("Unsubscribe : " + JSON.stringify(params));

    $cordovaBluetoothLE.unsubscribe(params).then(function(obj) {
      Log.add("Unsubscribe Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Unsubscribe Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.write =function(address, service, characteristic, value) {
    var params = {address:address, service:service, characteristic:characteristic, value:value, timeout: 2000};

    Log.add("Write : " + JSON.stringify(params));

    $cordovaBluetoothLE.write(params).then(function(obj) {
      Log.add("Write Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Write Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.readDescriptor = function(address, service, characteristic, descriptor) {
    var params = {address:address, service:service, characteristic:characteristic, descriptor:descriptor, timeout: 2000};

    Log.add("Read Descriptor : " + JSON.stringify(params));

    $cordovaBluetoothLE.readDescriptor(params).then(function(obj) {
      Log.add("Read Descriptor Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Read Descriptor Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.writeDescriptor = function(address, service, characteristic, descriptor, value) {
    var params = {address:address, service:service, characteristic:characteristic, descriptor:descriptor, value:value, timeout: 2000};

    Log.add("Write Descriptor : " + JSON.stringify(params));

    $cordovaBluetoothLE.writeDescriptor(params).then(function(obj) {
      Log.add("Write Descriptor Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Write Descriptor Error : " + JSON.stringify(obj));
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
    var params = {address:address, timeout: 2000};

    Log.add("RSSI : " + JSON.stringify(params));

    $cordovaBluetoothLE.rssi(params).then(function(obj) {
      Log.add("RSSI Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("RSSI Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.mtu = function(address) {
    var params = {address:address, mtu: 10, timeout: 2000};

    Log.add("MTU : " + JSON.stringify(params));

    $cordovaBluetoothLE.mtu(params).then(function(obj) {
      Log.add("MTU Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("MTU Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.requestConnectionPriority = function(address) {
    var params = {address:address, connectionPriority:"high", timeout: 2000};

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
  var length = 512;
  var readBytes = new Uint8Array(length);
  var start = 65;
  for (var i = 0; i < length; i++) {
    readBytes[i] = start + i;
  }
  if (window.cordova) {
    readBytes = $cordovaBluetoothLE.stringToBytes("Read Hello World");
  }

  //iOS didn't have this...
  Uint8Array.prototype.slice = function(start, end) {
    if (end === undefined) {
      end = this.length;
    }
    var length = end - start;
    var out = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      out[i] = this[i + start];
    }
    return out;
  }

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
        case "readRequestReceived":
          readRequestReceived(obj);
          break;
        case "writeRequestReceived":
          writeRequestReceived(obj);
          break;
        case "subscribedToCharacteristic":
          subscribedToCharacteristic(obj);
          break;
        case "unsubscribedToCharacteristic":
          unsubscribedToCharacteristic(obj);
          break;
        case "peripheralManagerIsReadyToUpdateSubscribers":
          peripheralManagerIsReadyToUpdateSubscribers(obj);
          break;
        default:
          break;
      }
    });
  };

  function readRequestReceived(obj) {
    Log.add("Read Request Received: " + JSON.stringify(obj));

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

    Log.add("Respond To Request: " + JSON.stringify(params));
    $cordovaBluetoothLE.respondToRequest(params).then(function(obj) {
      Log.add("Respond to Request Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Respond to Request Error : " + JSON.stringify(obj));
    });
  }

  function writeRequestReceived(obj) {
    Log.add("Write Request Received: " + JSON.stringify(obj));

    Log.add("Value: " + $cordovaBluetoothLE.bytesToString($cordovaBluetoothLE.encodedStringToBytes(obj.value)));

    //TODO get value based on service and characteristic

    var bytes = $cordovaBluetoothLE.stringToBytes("Write Hello World");

    //TODO send error if necessary
    if (obj.offset > bytes.length) {
      Log.add("Oops, an error occurred");
    }

    var params = {
      requestId: obj.requestId,
      value: $cordovaBluetoothLE.bytesToEncodedString(bytes),
    };

    Log.add("Respond To Request: " + JSON.stringify(params));
    $cordovaBluetoothLE.respondToRequest(params).then(function(obj) {
      Log.add("Respond to Request Success : " + JSON.stringify(obj));
    }, function(obj) {
      Log.add("Respond to Request Error : " + JSON.stringify(obj));
    });
  }

  var interval = null;

  function subscribedToCharacteristic(obj) {
    Log.add("Subscribed to Characteristic: " + JSON.stringify(obj));

    //NOTES Maximum length was 155

    interval = $interval(function() {
      var bytes = $cordovaBluetoothLE.stringToBytes("Subscribed!");

      var params = {
        service: obj.service,
        characteristic: obj.characteristic,
        value: $cordovaBluetoothLE.bytesToEncodedString($cordovaBluetoothLE.stringToBytes("Subscribe Hello World")),
      };

      Log.add("Update Value:" + JSON.stringify(params));
      $cordovaBluetoothLE.updateValue(params).then(function(obj) {
        Log.add("Update Value Success : " + JSON.stringify(obj));
        if (!obj.sent) {
          Log.add("Subscription queue is busy, stopping subscription");
          //Value wasn't sent
          //Wait until Peripheral Manager Is Ready to Update Subscribers before starting again
          $interval.cancel(interval);
        }
      }, function(obj) {
        Log.add("Update Value Error : " + JSON.stringify(obj));
      });
    }, 1000);
  }

  function unsubscribedToCharacteristic(obj) {
    Log.add("Unsubscribed to Characteristic");

    //TODO Manage this per device
    $interval.cancel(interval);
  }

  function peripheralManagerIsReadyToUpdateSubscribers(obj) {
    Log.add("Peripheral Manager Is Ready to Update Subscribers");
    //Restart sending updates
  }

  $rootScope.addService = function() {
    var params = {
      service: "1234",
      characteristics: [
        {
          uuid: "ABCD",
          permissions: {
            readable: true,
            writeable: true,
            //readEncryptionRequired: true,
            //writeEncryptionRequired: true,
          },
          properties : {
            read: true,
            writeWithoutResponse: true,
            write: true,
            notify: true,
            indicate: true,
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
      name: "Hello World",
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

.factory('Log', function($rootScope) {
  $rootScope.log = [];

  var add = function(message) {
    console.log(message);
    $rootScope.log.push({
      message: message,
      datetime: new Date().toISOString(),
    })
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
