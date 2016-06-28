from flask import Flask, render_template, jsonify, request
from time import sleep

app = Flask(__name__)
settings = dict()


@app.route('/')
def hello_world():
    return render_template('base.html')


@app.route('/record', methods=["POST"])
def record():
    json_obj = request.get_json()
    for obj in json_obj:
        key = obj['name']
        value = obj['value']
        settings[key] = value

    sleep(2)
    return jsonify(recording=True)


@app.route('/test')
def test():
    return jsonify(settings)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
