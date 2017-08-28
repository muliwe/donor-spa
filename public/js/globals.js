var $hash = (window.location.hash ? window.location.hash.substring(1) : null);
var $map;
var $socket;

var _globals = {
    hash: $hash,
    map: $map,
    socket: $socket
};

var $globals = function() {
    return _globals;
};

var graphic;
var selectedPin;
var pins = [];
var showPins = function () {};
var pinInfo = function () {};
var getPinsForExtent = function () {};
var extent;

require([
    'esri/map', 'esri/geometry/Point', 'esri/symbols/TextSymbol', 'esri/symbols/Font', 'esri/tasks/locator',
    'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/geometry/webMercatorUtils',
    'esri/graphic', 'esri/Color', 'esri/InfoTemplate', 'esri/dijit/Search', 'esri/dijit/LocateButton',
    'dojo/domReady!'
], function(
    Map, Point, TextSymbol, Font, Locator,
    SimpleMarkerSymbol, SimpleLineSymbol, webMercatorUtils,
    Graphic, Color, InfoTemplate, Search, LocateButton
) {
    $map = new Map('map', {
        basemap: 'streets',
        center: [-122.144, 37.468],
        zoom: 8
    });

    $map.methods = {
        Map: Map, Point: Point, TextSymbol: TextSymbol, Font: Font, Locator: Locator,
        SimpleMarkerSymbol: SimpleMarkerSymbol, SimpleLineSymbol: SimpleLineSymbol, webMercatorUtils: webMercatorUtils,
        Graphic: Graphic, Color: Color, InfoTemplate: InfoTemplate, Search: Search, LocateButton: LocateButton,
        locator: new Locator('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'),
        graphic: graphic
    };

    $map.on('load', initFunc);

    var search = new Search({
        map: $map
    }, 'search');
    search.startup();

    var geoLocate = new LocateButton({
        map: $map
    }, 'LocateButton');
    geoLocate.startup();

    function initFunc(map) {
        _globals.map = map.map;

        window.addEventListener('orientationchange', orientationChanged);

        socketHandler();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
        } else {
            console.log('Browser doesn\'t support Geolocation.');
        }

        map.map.on('click', function (evt) {
            if (evt.graphic) {
                swapPins(evt);
            } else {
                console.log(evt.mapPoint.getLatitude(), evt.mapPoint.getLongitude());
                showLocation({
                    coords: {
                        latitude: evt.mapPoint.getLatitude(),
                        longitude: evt.mapPoint.getLongitude()
                    }
                });
                $map.methods.locator.locationToAddress(webMercatorUtils.webMercatorToGeographic(evt.mapPoint), 100);
            }
        });

        getPinsForExtent($map);
    }

    getPinsForExtent = function(map) {
        var min = webMercatorUtils.xyToLngLat(map.extent.xmin.toFixed(3),
            map.extent.ymin.toFixed(3), true);
        var max = webMercatorUtils.xyToLngLat(map.extent.xmax.toFixed(3),
            map.extent.ymax.toFixed(3), true);

        console.log(min, max);

        if (!$socket || !$socket.connected) {
            extent = [min, max];
            return;
        }

        // request pin data for extent
        $socket.emit('location', JSON.stringify({
            fromLat: min[1],
            fromLong: min[0],
            toLat: max[1],
            toLong: max[0]
        }));
    };

    $map.on('extent-change', getPinsForExtent);

    var orientationChanged = function() {
        if ($map) {
            $map.reposition();
            $map.resize();
        }
    };

    function zoomToLocation(location) {
        console.log(location.coords.longitude, location.coords.latitude);
        currLocation = location.coords.longitude + location.coords.latitude;

        var pt = new Point(location.coords.longitude, location.coords.latitude);
        addGraphic(pt);
        $map.centerAndZoom(pt, 12);
        getPinsForExtent($map);
    }

    function showLocation(location) {
        var newLocation = location.coords.longitude + location.coords.latitude;

        if (newLocation === currLocation) {
            return;
        }

        currLocation = newLocation;

        //zoom to the users location and add a graphic
        var pt = new Point(location.coords.longitude, location.coords.latitude);
        if ( !graphic ) {
            addGraphic(pt);
        } else { // move the graphic if it already exists
            graphic.setGeometry(pt);
        }
        $map.centerAt(pt);
    }

    pinInfo = function(pinHash) {
        $socket.emit('get-pin', pinHash);
    };

    function swapPins(evt) {
        console.log(evt.graphic.attributes);

        if (selectedPin && evt.graphic.attributes && !evt.graphic.attributes.selected) {
            $map.infoWindow.hide();

            // switch selected
            var pin = evt.graphic.attributes;
            var pin2 = selectedPin.attributes;

            var symbol = symbolGenerator();
            var graphic = new Graphic(new Point(pin2.long, pin2.lat), symbol);
            pin2.graphic = graphic;
            pin2.showed = true;
            pin2.selected = false;
            graphic.setAttributes(pin2);

            var selectedSymbol = symbolGenerator(true);
            var graphic2 = new Graphic(new Point(pin.long, pin.lat), selectedSymbol);
            pin.graphic = graphic;
            pin.showed = true;
            pin.selected = true;
            graphic2.setAttributes(pin);

            $map.graphics.remove(evt.graphic);
            $map.graphics.remove(selectedPin);

            $map.graphics.add(graphic);
            $map.graphics.add(graphic2);

            selectedPin = graphic2;

            $map.infoWindow.setContent('Blood Group: <b>' + selectedPin.attributes.bloodGroup + '</b><br>' +
                '<a onclick="pinInfo(\'' + selectedPin.attributes.hash + '\'); return false;" href="#">' +
                'Click for more info</a>');
            $map.infoWindow.show(new Point(pin.long, pin.lat), selectedSymbol);

        } else if (!selectedPin) {
            // mark selected
            var pin = evt.graphic.attributes;

            var selectedSymbol = symbolGenerator(true);
            var graphic = new Graphic(new Point(pin.long, pin.lat), selectedSymbol);
            pin.graphic = graphic;
            pin.showed = true;
            pin.selected = true;
            graphic.setAttributes(pin);

            $map.graphics.remove(evt.graphic);
            $map.graphics.remove(selectedPin);

            $map.graphics.add(graphic);

            selectedPin = graphic;
        }
        console.log(selectedPin.attributes);
    }

    showPins = function() {
        pins.filter(function(pin) {
            return !pin.hide && !pin.showed && !pin.graphic;
        }).forEach(function(pin) {
            var symbol = symbolGenerator();
            var infoTemplate = new InfoTemplate('Blood Donor', 'Blood Group: <b>${bloodGroup}</b><br>' +
                '<a onclick="pinInfo(\'${hash}\'); return false;" href="#"">Click for more info</a>');
            var graphic = new Graphic(new Point(pin.long, pin.lat), symbol, {}, infoTemplate);

            pin.graphic = graphic;
            pin.showed = true;
            pin.selected = false;
            graphic.setAttributes(pin);

            $map.graphics.add(graphic);
        });
    };

    function symbolGenerator(isSelected) {
        return new SimpleMarkerSymbol(
            SimpleMarkerSymbol.STYLE_CIRCLE,
            24,
            new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color([210, 0, 0, 0.9]),
                4
            ),
            new Color([isSelected ? 255 : 210, 0, 0, isSelected ? 1 : 0.9])
        )
    }

    function addGraphic(pt){
        var symbol = new SimpleMarkerSymbol(
            SimpleMarkerSymbol.STYLE_CIRCLE,
            12,
            new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color([210, 105, 30, 0.5]),
                8
            ),
            new Color([210, 105, 30, 0.8])
        );
        graphic = new Graphic(pt, symbol);
        $map.methods.graphic = graphic;
        $map.graphics.add(graphic);
        $map.methods.locator.locationToAddress(pt, 100);
    }

    function locationError(error) {
        // error occurred so stop watchPosition
        if (navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
        }
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.log('Location not provided');
                break;

            case error.POSITION_UNAVAILABLE:
                console.log('Current location not available');
                break;

            case error.TIMEOUT:
                console.log('Timeout');
                break;

            default:
                console.log('unknown error');
                break;
        }
    }
});

function socketHandler() {
    $socket = io('http://localhost:3001/');

    $socket.on('connect', onConnect);
    $socket.on('disconnect', onDisconnect);
    $socket.on('connect_error', onError);
    $socket.on('reconnect_error', onError);
    $socket.on('pin-map-update', onPinMapUpdate);
    $socket.on('pin-info', onPinInfo);

    function onConnect(evt) {
        console.log('CONNECTED');

        _globals.socket = $socket;

        // perform hanged actions
        if (extent) {
            $socket.emit('location', JSON.stringify({
                fromLat: extent[0][1],
                fromLong: extent[0][0],
                toLat: extent[1][1],
                toLong: extent[1][0]
            }));
            getPinsForExtent($map);
            extent = undefined;
        }
    }

    function onDisconnect(evt) {
        console.log('DISCONNECTED');
    }

    function onError(message) {
        console.log('ERROR: ' + message);
    }

    function onPinInfo(msg) {
        console.log('Pin info: ', msg);

        var msgData;

        try {
            msgData = JSON.parse(msg);
        } catch (error) {
            console.error(error);
        }

        var content = '<div><span>Blood Group:</span> <b>' + msgData.bloodGroup + '</b></div>' +
            '<div><span>Name:</span> <b>' + msgData.firstName + ' ' + msgData.lastName + '</b></div>' +
            '<div><span>Address:</span> ' + msgData.address + '</div>' +
            '<div><span>Email:</span> <a href="mailto:' + msgData.email + '"><b>' + msgData.email +
            '</b></a></div>' +
            '<div><span>Phone:</span> <b>' + msgData.phone + '</b></div>';

        $map.infoWindow.setContent(msgData.deleted ? 'Sorry! Donor info was deleted' : content);
    }

    function onPinMapUpdate(msg) {
        console.log('Pin map update: ', msg);

        var msgData;

        try {
            msgData = JSON.parse(msg);
        } catch (error) {
            console.error(error);
        }

        patchPins(msgData);
        showPins();
    }
}

function patchPins(pinsData) {
    if (Array.isArray(pinsData)) {
        var pinsHash = {};

        pinsData.forEach(function(pin) {
            pinsHash[pin.hash] = pin;
        });

        for (var i=0; i < pins.length; i++) {
            if (pinsHash[pins[i].hash]) {
                if (pins[i].graphic) {
                   $map.graphics.remove(pins[i].graphic);
                }

                pins[i] = Object.assign({}, pinsHash[pins[i].hash]);
            }

            delete pinsHash[pins[i].hash];
        }

        Object.keys(pinsHash).forEach(function(hash) {
            pins.push(pinsHash[hash]);
        });
    }
}
