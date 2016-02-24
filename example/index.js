angular.module('myApp', ['ionic', 'ngCordovaBluetoothLE'])

//For live reload debugging
.run(function($state, $ionicPlatform) {
  $ionicPlatform.ready(function() {
    $state.go("home");
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider.state('app', {
    abstract: true,
    templateUrl: ''
  })

  .state('home', {
    parent: 'app',
    url: '/',
    controller: "HomeCtrl",
    templateUrl: "home.html",
  })

  .state('device', {
    url: '/:address',
    templateUrl: 'device.html',
    controller: "DeviceCtrl"
  })

  .state('service', {
    url: '/:address/:service',
    templateUrl: 'service.html',
    controller: "ServiceCtrl"
  })

  .state('characteristic', {
    url: '/:address/:service/:characteristic',
    templateUrl: 'characteristic.html',
    controller: "CharacteristicCtrl"
  });

  $urlRouterProvider.otherwise('/');
})

.controller('HomeCtrl', function($scope, $rootScope, $state, $cordovaBluetoothLE) {
  $rootScope.devices = {};

  $scope.goToDevice = function(device) {
    $state.go("device", {address:device.address});
  };

  $scope.isEmpty = function() {
    if (Object.keys($rootScope.devices).length === 0) {
      return true;
    }
    return false;
  };

  $rootScope.initialize = function() {
    var params = {request:true};

    console.log("Initialize : " + JSON.stringify(params));

    $cordovaBluetoothLE.initialize(params).then(null, null, function(obj) {
      console.log("Initialize Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.enable = function() {
    console.log("Enable");

    $cordovaBluetoothLE.enable().then(null, function(obj) {
      console.log("Enable Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.disable = function() {
    console.log("Disable");

    $cordovaBluetoothLE.disable().then(null, function(obj) {
      console.log("Disable Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.startScan = function() {
    var params = {
      services:[],
      allowDuplicates: false,
      scanMode: bluetoothle.SCAN_MODE_LOW_POWER,
      matchMode: bluetoothle.MATCH_MODE_STICKY,
      matchNum: bluetoothle.MATCH_NUM_ONE_ADVERTISEMENT,
      //callbackType: bluetoothle.CALLBACK_TYPE_FIRST_MATCH,
      //scanTimeout: 15000,
    };

    console.log("Start Scan : " + JSON.stringify(params));

    $cordovaBluetoothLE.startScan(params).then(function(obj) {
      console.log("Start Scan Auto Stop : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Start Scan Error : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Start Scan Success : " + JSON.stringify(obj));

      addDevice(obj);
    });
  };

  $rootScope.stopScan = function() {
    console.log("Stop Scan");

    $cordovaBluetoothLE.stopScan().then(function(obj) {
      console.log("Stop Scan Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Stop Scan Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.retrieveConnected = function() {
    var params = {services:["180D"]};

    console.log("Retrieve Connected : " + JSON.stringify(params));

    $cordovaBluetoothLE.retrieveConnected(params).then(function(obj) {
      console.log("Retrieve Connected Success : " + JSON.stringify(obj));

      for (var i = 0; i < obj.length; i++) {
        addDevice(obj[i]);
      }
    }, function(obj) {
      console.log("Retrieve Connected Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.isInitialized = function() {
    console.log("Is Initialized");

    $cordovaBluetoothLE.isInitialized().then(function(obj) {
      console.log("Is Initialized Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.isEnabled = function() {
    console.log("Is Enabled");

    $cordovaBluetoothLE.isEnabled().then(function(obj) {
      console.log("Is Enabled Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.isScanning = function() {
    console.log("Is Scanning");

    $cordovaBluetoothLE.isScanning().then(function(obj) {
      console.log("Is Scanning Success : " + JSON.stringify(obj));
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
    console.log("Has Permission");

    $cordovaBluetoothLE.hasPermission().then(function(obj) {
      console.log("Has Permission Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Has Permission Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.requestPermission = function() {
    console.log("Request Permission");

    $cordovaBluetoothLE.requestPermission().then(function(obj) {
      console.log("Request Permission Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Request Permission Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.isLocationEnabled = function() {
    console.log("Is Location Enabled");

    $cordovaBluetoothLE.isLocationEnabled().then(function(obj) {
      console.log("Is Location Enabled Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Is Location Enabled Error : " + JSON.stringify(obj));
    });
  };
})

.controller('DeviceCtrl', function($scope, $rootScope, $state, $stateParams, $ionicHistory, $cordovaBluetoothLE) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $rootScope.selectedDevice = $rootScope.devices[$stateParams.address];
  });

  $scope.goToService = function(service) {
    $state.go("service", {address:$rootScope.selectedDevice.address, service: service.uuid});
  };

  $rootScope.connect = function(address) {
    var params = {address:address, timeout: 5000};

    console.log("Connect : " + JSON.stringify(params));

    $cordovaBluetoothLE.connect(params).then(null, function(obj) {
      console.log("Connect Error : " + JSON.stringify(obj));
      $rootScope.close(address); //Best practice is to close on connection error
    }, function(obj) {
      console.log("Connect Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.reconnect =function(address) {
    var params = {address:address, timeout: 5000};

    console.log("Reconnect : " + JSON.stringify(params));

    $cordovaBluetoothLE.reconnect(params).then(null, function(obj) {
      console.log("Reconnect Error : " + JSON.stringify(obj));
      $rootScope.close(address); //Best practice is to close on connection error
    }, function(obj) {
      console.log("Reconnect Success : " + JSON.stringify(obj));
    });
  };

  $rootScope.disconnect = function(address) {
    var params = {address:address};

    console.log("Disconnect : " + JSON.stringify(params));

    $cordovaBluetoothLE.disconnect(params).then(function(obj) {
      console.log("Disconnect Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Disconnect Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.close = function(address) {
    var params = {address:address};

    console.log("Close : " + JSON.stringify(params));

    $cordovaBluetoothLE.close(params).then(function(obj) {
     console.log("Close Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Close Error : " + JSON.stringify(obj));
    });

    var device = $rootScope.devices[address];
    device.services = {};
  };

  $rootScope.discover = function(address) {
    var params = {
      address:address,
      timeout: 5000
    };

    console.log("Discover : " + JSON.stringify(params));

    $cordovaBluetoothLE.discover(params).then(function(obj) {
      console.log("Discover Success : " + JSON.stringify(obj));

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
      console.log("Discover Error : " + JSON.stringify(obj));
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

    console.log("Services : " + JSON.stringify(params));

    $cordovaBluetoothLE.services(params).then(function(obj) {
      console.log("Services Success : " + JSON.stringify(obj));

      var device = $rootScope.devices[obj.address];

      for (var i = 0; i < obj.services.length; i++) {
        addService({uuid: obj.services[i]}, device);
      }
    }, function(obj) {
      console.log("Services Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.characteristics = function(address, service) {
    var params = {address:address, service:service, characteristics:[]};

    console.log("Characteristics : " + JSON.stringify(params));

    $cordovaBluetoothLE.characteristics(params).then(function(obj) {
      console.log("Characteristics Success : " + JSON.stringify(obj));

      var device = $rootScope.devices[obj.address];
      var service = device.services[obj.service];

      for (var i = 0; i < obj.characteristics.length; i++) {
        addCharacteristic(obj.characteristics[i], service);
      }
    }, function(obj) {
      console.log("Characteristics Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.descriptors = function(address, service, characteristic) {
    var params = {address:address, service:service, characteristic:characteristic};

    console.log("Descriptors : " + JSON.stringify(params));

    $cordovaBluetoothLE.descriptors(params).then(function(obj) {
      console.log("Descriptors Success : " + JSON.stringify(obj));

      var device = $rootScope.devices[obj.address];
      var service = device.services[obj.service];
      var characteristic = service.characteristics[obj.characteristic];

      var descriptors = obj.descriptors;

      for (var i = 0; i < descriptors.length; i++) {
        addDescriptor({uuid: descriptors[i]}, characteristic);
      }
    }, function(obj) {
      console.log("Descriptors Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.read = function(address, service, characteristic) {
    var params = {address:address, service:service, characteristic:characteristic, timeout: 2000};

    console.log("Read : " + JSON.stringify(params));

    $cordovaBluetoothLE.read(params).then(function(obj) {
      console.log("Read Success : " + JSON.stringify(obj));

      var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
      console.log("Read : " + bytes[0]);
    }, function(obj) {
      console.log("Read Error : " + JSON.stringify(obj));
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

    console.log("Subscribe : " + JSON.stringify(params));

    $cordovaBluetoothLE.subscribe(params).then(function(obj) {
      console.log("Subscribe Auto Unsubscribe : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Subscribe Error : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Subscribe Success : " + JSON.stringify(obj));

      if (obj.status == "subscribedResult") {
        console.log("Subscribed Result");
      } else if (obj.status == "subscribed") {
        console.log("Subscribed");
      } else {
        console.log("Unexpected Subscribe Status");
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

    console.log("Unsubscribe : " + JSON.stringify(params));

    $cordovaBluetoothLE.unsubscribe(params).then(function(obj) {
      console.log("Unsubscribe Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Unsubscribe Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.write =function(address, service, characteristic, value) {
    var params = {address:address, service:service, characteristic:characteristic, value:value, timeout: 2000};

    console.log("Write : " + JSON.stringify(params));

    $cordovaBluetoothLE.write(params).then(function(obj) {
      console.log("Write Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Write Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.readDescriptor = function(address, service, characteristic, descriptor) {
    var params = {address:address, service:service, characteristic:characteristic, descriptor:descriptor, timeout: 2000};

    console.log("Read Descriptor : " + JSON.stringify(params));

    $cordovaBluetoothLE.readDescriptor(params).then(function(obj) {
      console.log("Read Descriptor Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Read Descriptor Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.writeDescriptor = function(address, service, characteristic, descriptor, value) {
    var params = {address:address, service:service, characteristic:characteristic, descriptor:descriptor, value:value, timeout: 2000};

    console.log("Write Descriptor : " + JSON.stringify(params));

    $cordovaBluetoothLE.writeDescriptor(params).then(function(obj) {
      console.log("Write Descriptor Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Write Descriptor Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.isConnected = function(address) {
    var params = {address:address};

    console.log("Is Connected : " + JSON.stringify(params));

    $cordovaBluetoothLE.isConnected(params).then(function(obj) {
      console.log("Is Connected Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Is Connected Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.isDiscovered = function(address) {
    var params = {address:address};

    console.log("Is Discovered : " + JSON.stringify(params));

    $cordovaBluetoothLE.isDiscovered(params).then(function(obj) {
      console.log("Is Discovered Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Is Discovered Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.rssi = function(address) {
    var params = {address:address, timeout: 2000};

    console.log("RSSI : " + JSON.stringify(params));

    $cordovaBluetoothLE.rssi(params).then(function(obj) {
      console.log("RSSI Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("RSSI Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.mtu = function(address) {
    var params = {address:address, mtu: 10, timeout: 2000};

    console.log("MTU : " + JSON.stringify(params));

    $cordovaBluetoothLE.mtu(params).then(function(obj) {
      console.log("MTU Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("MTU Error : " + JSON.stringify(obj));
    });
  };

  $rootScope.requestConnectionPriority = function(address) {
    var params = {address:address, connectionPriority:"high", timeout: 2000};

    console.log("Request Connection Priority : " + JSON.stringify(params));

    $cordovaBluetoothLE.requestConnectionPriority(params).then(function(obj) {
      console.log("Request Connection Priority Success : " + JSON.stringify(obj));
    }, function(obj) {
      console.log("Request Connection Priority Error : " + JSON.stringify(obj));
    });
  };
})

.controller('ServiceCtrl', function($scope, $rootScope, $state, $stateParams, $cordovaBluetoothLE) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $rootScope.selectedService = $rootScope.selectedDevice.services[$stateParams.service];
  });

  $scope.goToCharacteristic = function(characteristic) {
    $state.go("characteristic", {address:$rootScope.selectedDevice.address, service: $rootScope.selectedService.uuid, characteristic: characteristic.uuid});
  };
})

.controller('CharacteristicCtrl', function($scope, $rootScope, $stateParams, $cordovaBluetoothLE) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $scope.selectedCharacteristic = $rootScope.selectedService.characteristics[$stateParams.characteristic];
  });
})

.filter('null', function() {
  return function(value) {
    if (value === null || value === undefined) {
      return "<null>";
    }
    return value;
  };
});
