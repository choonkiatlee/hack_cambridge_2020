from flask import Flask, render_template, request, url_for, jsonify
from flask_cors import CORS

import random, json
import pandas as pd
import numpy as np
import glob
import routes

M=4000
A=181.4
B=2.42
C=0.62

v = []
a = []

app = Flask(__name__)
CORS(app)

@app.route('/get_route', methods=['GET'])
def get_route():
    if 'query' not in request.args:
        return '400'
    res = routes.get_route_from_api(request.args)
    return res
    

@app.route('/',  methods=['GET'])
def form():
    json_helper = {}
    json_helper['aggression'] = get_aggression(vel_arr[0:4])
    order = np.argsort(json_helper['aggression'])
    json_helper["aggression"] = list(np.array(json_helper["aggression"])[order])
    json_helper['trace'] = get_trace(fuel_cons[0:4], order)
    json_helper['max_fuel'] = max([max(i) for i in fuel_cons[0:4]])
    print(json_helper['max_fuel'])
    print(json_helper['trace'][0])
    print(json_helper['aggression'])
    json_object = json.dumps(json_helper)
    return render_template('index.html' , s_data=json_object)

@app.route('/acceleration',  methods=['GET'])
def acceleration():
    return render_template('index2.html')

@app.route('/felix',  methods=['GET'])
def felix():
    return render_template('index2_felix.html')

@app.route("/get_aggressive_update")
def get_aggressive_update():
    current_v = float(request.args["current_v"])
    current_a = float(request.args["current_a"])
    v.append(current_v)
    a.append(current_a)
    return jsonify( {"aggressive":aggressive_w_accel(v,a)} )

def get_aggression(velocities):
    res = [aggressive(i) for i in velocities]
    return res

def aggressive_w_accel(v, a):

    a,v = np.array(a), np.array(v)
    av=a*v
    agg=abs((1/M)*((A*v.sum()+B*(v**2).sum()+C*(v**3).sum()+M*av.sum())/v.sum())*(8.9/np.mean(v)))
    return np.round(agg * 20, decimals=2)

def aggressive(v):
    v = np.array(v)
    a=np.gradient(v)
    av=a*v
    agg=abs((1/M)*((A*v.sum()+B*(v**2).sum()+C*(v**3).sum()+M*av.sum())/v.sum())*(8.9/np.mean(v)))
    return np.round(agg * 20, decimals=2)

def get_trace(array, order):
    res = []

    print([len(a) for a in array])

    for idx in range(100):
        part = {"x": idx}
        for j in order:
            part["trace_{}".format(j)] = array[j][idx]
        res.append(part)
    return res


if __name__ == '__main__':

    filenames = glob.glob("VED_DynamicData_Part1/*")
    vel_arr = []
    fuel_cons = []
    for filename in filenames:
        df = pd.read_csv(filename)
        df["Fuel Rate[L/hr]"] = pd.to_numeric(df["Fuel Rate[L/hr]"])
        df = df[pd.notna(df["Fuel Rate[L/hr]"])]
        df = df[df["Fuel Rate[L/hr]"] > 0]
        df["Vehicle Speed[km/h]"] = pd.to_numeric(df["Vehicle Speed[km/h]"])
        for vehId in df["VehId"].unique():
            veh1 = df[df["VehId"] == vehId].reset_index()
            vel = list(np.array(veh1["Vehicle Speed[km/h]"])*1000/3600)
            fuel = list(np.array(veh1["Vehicle Speed[km/h]"]))
            vel_arr.append(list(vel))
            fuel_cons.append(list(np.array(fuel)/np.mean(vel)))

    app.run('0.0.0.0',debug=True)
