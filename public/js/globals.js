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
        getPinsForExtent: function() {}, // to define later
        locator: new Locator('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer')
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
        _globals.map = map;

        window.addEventListener('orientationchange', orientationChanged);

        socketHandler();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
        } else {
            console.log('Browser doesn\'t support Geolocation.');
        }
    }

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
        $map.methods.getPinsForExtent();
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
        $map.graphics.add(graphic);
        $map.methods.locator.locationToAddress(pt, 100);
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

    function onConnect(evt) {
        console.log('CONNECTED');

        _globals.socket = $socket;
    }

    function onDisconnect(evt) {
        console.log('DISCONNECTED');
    }

    function onError(message) {
        console.log('ERROR: ' + message);
    }
}
