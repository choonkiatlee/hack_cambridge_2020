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
    });
}

// function updateRoute(startPosition, endPosition) {
    
// }

function GetMap() {
    //Initialize a map instance.
    map = new atlas.Map('myMap', {
        center: [0.121817, 52.205338],
        zoom: 7,
        view: 'Auto',

        //Add your Azure Maps subscription key to the map SDK. Get an Azure Maps key at https://azure.com/maps
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'YvYcKRHulGRybPNdgcEm2mwY5F4eS195WvB5O5fOV2g'
        }
    });

    //Use SubscriptionKeyCredential with a subscription key
    var subscriptionKeyCredential = new atlas.service.SubscriptionKeyCredential(atlas.getSubscriptionKey());

    //Use subscriptionKeyCredential to create a pipeline
    var pipeline = atlas.service.MapsURL.newPipeline(subscriptionKeyCredential);

    // Construct the RouteURL object
    routeURL = new atlas.service.RouteURL(pipeline);

    //Wait until the map resources are ready.
    map.events.add('ready', function () {
        datasource = new atlas.source.DataSource();
        map.sources.add(datasource);

        //Create the GeoJSON objects which represent the start and end points of the route.
        var startPoint = new atlas.data.Feature(new atlas.data.Point([0.121817, 52.205338]), {
            title: "Christ's College, Cambridge",
            icon: "pin-round-blue"
        });

        var endPoint = new atlas.data.Feature(new atlas.data.Point([0.1274, 51.50743]), {
            title: "London",
            icon: "pin-blue"
        });

        //Add the data to the data source.
        datasource.add([startPoint, endPoint]);

        //Create a layer for rendering the route line under the road labels.
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

        //Get the coordnates of the start and end points.
        var coordinates = [
            startPoint.geometry.coordinates,
            endPoint.geometry.coordinates
        ];

        calculateRouteDirectionsOptions = {
            traffic: true,
            travelMode: 'car',
            routeType: 'fastest',
            // vehicleEngineType: 'combustion',
            // constantSpeedConsumptionInLitersPerHundredkm: 50,
            // fuelEnergyDensityInMJoulesPerLiter: 34.2
        }

        //Calculate a route.
        routeURL.calculateRouteDirections(atlas.service.Aborter.timeout(10000), coordinates, calculateRouteDirectionsOptions).then((directions) => {
            //Get the route data as GeoJSON and add it to the data source.
            var data = directions.geojson.getFeatures();
            console.log(directions)
            datasource.add(data);

            //Update the map view to center over the route.
            map.setCamera({
                bounds: data.bbox,
                padding: 30 //Add a padding to account for the pixel size of symbols.
            });
        });
    });
}