import requests

API_KEY = 'YvYcKRHulGRybPNdgcEm2mwY5F4eS195WvB5O5fOV2g'
route_url = 'https://atlas.microsoft.com/route/directions/json'

speeds = [10, 20, 28, 35, 40, 45, 55, 61, 68, 73, 78, 90, 101, 110, 120, 130, 135, 140, 148, 155, 165, 180, 185]
fuel_consumptions = [15, 13.5, 7.5, 7.4, 5.7, 5.7, 5.8, 5.1, 5.3, 5.5, 5.8, 6.1, 6.3, 7.5, 8.5, 9.8, 9.9, 10, 10.15, 10.35, 11.3, 15.6, 16.3]
speed_to_consumption = ':'.join([f'{speed},{consumption}' for speed, consumption in zip(speeds, fuel_consumptions)])

default_params = {
    'subscription-key': API_KEY,
    'api-version': 1.0,
    'tarvelMode': 'car',
    'traffic': True,
    'routeType': 'eco',
    'vehicleEngineType': 'combustion',
    'constantSpeedConsumptionInLitersPerHundredkm': speed_to_consumption,
    'fuelEnergyDensityInMJoulesPerLiter': 34.2,
    'auxiliaryPowerInLitersPerHour': 0.2,
    'accelerationEfficiency': 0.33,
    'decelerationEfficiency': 0.83,
    'uphillEfficiency': 0.27,
    'downhillEfficiency': 0.51,
    'vehicleWeight': 1400,
    'vehicleMaxSpeed': 0
}


def combine_dicts(d1, d2):
    d = d1.copy()
    for key, val in d2.items():
        d[key] = val
    return d


def get_route_from_api(args):
    params = combine_dicts(default_params, args)
    res = requests.get(route_url, params)
    return res.text
