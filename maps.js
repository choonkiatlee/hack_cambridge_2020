var map, datasource;
var routePoints = [];
const speed_to_consumption = "10,15:20,13.5:28,7.5:35,7.4:40,5.7:45,5.7:55,5.8:61,5.1:68,5.3:73,5.5:78,5.8:90,6.1:101,6.3:110,7.5:120,8.5:130,9.8:135,9.9:140,10:148,10.15:155,10.35:165,11.3:180,15.6:185,16.3"
var routeUrl = "http://172.20.3.14:5000/get_route?query={query}&routeType={routeType}"

function InitMap() {
    //Initialize a map instance.
    map = new atlas.Map('myMap', {
        center: [0.121817, 52.205338],
        zoom: 20,
        view: 'Auto',

        //Add your Azure Maps subscription key to the map SDK. Get an Azure Maps key at https://azure.com/maps
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'YvYcKRHulGRybPNdgcEm2mwY5F4eS195WvB5O5fOV2g'
        }
    });

    //Wait until the map resources are ready.
    map.events.add('ready', function () {
        datasource = new atlas.source.DataSource();
        map.sources.add(datasource);

        map.layers.add(new atlas.layer.LineLayer(datasource, null, {
            strokeColor: '#2272B9',
            strokeWidth: 10,
            lineJoin: 'round',
            lineCap: 'round'
        }), 'labels');

        //Create a layer for rendering the start and end points of the route as symbols.
        map.layers.add(new atlas.layer.SymbolLayer(datasource, null, {
            iconOptions: {
                image: ['get', 'icon'],
                allowOverlap: true,
                ignorePlacement: true
            },
            textOptions: {
                textField: ['get', 'title'],
                offset: [0, 1.2]
            },
            filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.
        }));
    });
}

function updateRoute(startPosition, endPosition) {
    // datasource.clear();
    console.log('updating')
    var subscriptionKeyCredential = new atlas.service.SubscriptionKeyCredential(atlas.getSubscriptionKey());
    var pipeline = atlas.service.MapsURL.newPipeline(subscriptionKeyCredential);
    routeURL = new atlas.service.RouteURL(pipeline);

    startLat = startPosition.geometry.location.lat();
    startLng = startPosition.geometry.location.lng();
    endLat = endPosition.geometry.location.lat();
    endLng = endPosition.geometry.location.lng();

    var startPoint = new atlas.data.Feature(new atlas.data.Point([startLng, startLat]), {
        title: startPosition.name,
        icon: "pin-round-blue"
    });

    var endPoint = new atlas.data.Feature(new atlas.data.Point([endLng, endLat]), {
        title: endPosition.name,
        icon: "pin-round-blue"
    });

    datasource.add([startPoint, endPoint]);

    var coordinates = startLng + ',' + startLat + ':' + endLng + ',' + endLat;

    // eco route
    var requestUrl = routeUrl.replace('{routeType}', 'eco').replace('{query}', coordinates);

    fetch(requestUrl)
        .then(function(response){
            return response.json();
        }).then(function(response){
            console.log(response)
            addRouteToMap(response.routes[0], '#2272B9', 2)
        });
    
    // fastest route
    var requestUrl = routeUrl.replace('{routeType}', 'fastest').replace('{query}', coordinates);
    
    fetch(requestUrl)
        .then(function(response){
            return response.json();
        }).then(function(response){
            addRouteToMap(response.routes[0], '#FF5733', 20)
        });
}


function addRouteToMap(route, strokeColor, strokeWidth){
    var routeCoordinates = [];
        
    for (var legIndex = 0; legIndex < route.legs.length; legIndex++) {
        var leg = route.legs[legIndex];

        var legCoordinates = leg.points.map(function(point) {
            return [point.longitude, point.latitude];
        });

        routeCoordinates = routeCoordinates.concat(legCoordinates);
    }

    datasource.add(new atlas.data.Feature(new atlas.data.LineString(routeCoordinates), {
        strokeColor: strokeColor,
        strokeWidth: strokeWidth
    }));

    routePoints = routePoints.concat(routeCoordinates);
    map.setCamera({
        bounds: atlas.data.BoundingBox.fromPositions(routePoints),
        padding: 50
    });
}