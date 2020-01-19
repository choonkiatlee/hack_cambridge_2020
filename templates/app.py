from flask import Flask, jsonify

app = Flask(__name__)

x = [1, 2, 3]
y = [4, 5, 6]
data = {'x': x, 'y': y}

@app.route('/', methods=['GET'])
def api():
    return jsonify(data)

app.run()
