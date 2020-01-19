var map, datasource;
var routePoints = [];
const speed_to_consumption = "10,15:20,13.5:28,7.5:35,7.4:40,5.7:45,5.7:55,5.8:61,5.1:68,5.3:73,5.5:78,5.8:90,6.1:101,6.3:110,7.5:120,8.5:130,9.8:135,9.9:140,10:148,10.15:155,10.35:165,11.3:180,15.6:185,16.3"
var routeUrl = "http://172.20.3.14:5000/get_route?query={query}&routeType={routeType}"
// &departAt=&departAt=2020-01-22T20:00:00-00:00


// var fuel_eco;

function InitMap() {
    //Initialize a map instance.
    map = new atlas.Map('myMap', {
        center: [0.121817, 52.205338],
        zoom: 12,
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
            strokeColor: ['get', 'strokeColor'],
            strokeWidth: ['get', 'strokeWidth']
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
    datasource.clear();
    var subscriptionKeyCredential = new atlas.service.SubscriptionKeyCredential(atlas.getSubscriptionKey());
    var pipeline = atlas.service.MapsURL.newPipeline(subscriptionKeyCredential);
    routeURL = new atlas.service.RouteURL(pipeline);

    startLat = startPosition.geometry.location.lat();
    startLng = startPosition.geometry.location.lng();
    endLat = endPosition.geometry.location.lat();
    endLng = endPosition.geometry.location.lng();

    var startPoint = new atlas.data.Feature(new atlas.data.Point([startLng, startLat]), {
        title: startPosition.name,
        icon: "pin-round-darkblue"
    });

    var endPoint = new atlas.data.Feature(new atlas.data.Point([endLng, endLat]), {
        title: endPosition.name,
        icon: "pin-red"
    });

    datasource.add([startPoint, endPoint]);

    var coordinates = startLat + ',' + startLng + ':' + endLat + ',' + endLng;

    var requestUrl = routeUrl.replace('{routeType}', 'fastest').replace('{query}', coordinates);
    
    fetch(requestUrl)
        .then(function(response){
            return response.json();
        }).then(function(response){
            console.log(response)
            addRouteToMap(response.routes[0], '#FF5733', 6);
            summary = response.routes[0].summary;
            fuel_orig = summary.fuelConsumptionInLiters;
            // console.log(fuel_eco)
            document.getElementById("orig_time").textContent = (summary.travelTimeInSeconds/3600).toFixed(2) + 'hr';
            document.getElementById("orig_distance").textContent = (summary.lengthInMeters/1000).toFixed(0) + 'km';
            
            // fastest route
            var requestUrl = routeUrl.replace('{routeType}', 'eco').replace('{query}', coordinates);
            
            fetch(requestUrl)
                .then(function(response){
                    return response.json();
                }).then(function(response){
                    addRouteToMap(response.routes[0], 'green', 4);
                    summary = response.routes[0].summary;
                    fuel_eco = summary.fuelConsumptionInLiters;
                    document.getElementById("eco_time").textContent = (summary.travelTimeInSeconds/3600).toFixed(2) + 'hr';
                    document.getElementById("eco_distance").textContent = (summary.lengthInMeters/1000).toFixed(0) + 'km';
        
                    document.getElementById("driver-1-agg").textContent = (fuel_orig - fuel_eco).toFixed(2) + 'L';
                    document.getElementById("driver-2-agg").textContent = ((fuel_orig - fuel_eco) / fuel_orig * 100).toFixed(2) + '%';
                });
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