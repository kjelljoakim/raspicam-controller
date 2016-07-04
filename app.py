from flask import Flask, render_template, jsonify, request
from camera import CameraWrapper

app = Flask(__name__)
camera = CameraWrapper()
print("Starting....")


@app.route('/')
def hello_world():
    return render_template('base.html')


@app.route('/apply', methods=["POST", "GET"])
def apply():
    if(request.method == "POST"):
        new_settings = request.get_json()
        for setting in new_settings:
            key = setting['name']
            value = setting['value']
            if not camera.apply_setting(key, value):
                return jsonify(applied=False, error=key)

        return jsonify(applied=True)
    if(request.method == "GET"):
        return jsonify(**camera.get_settings())


@app.route('/record', methods=['POST'])
def start_recording():
    if(camera.start_recording('newFile.h264')):
        return jsonify(recording=True)
    else:
        return jsonify(recording=False)


@app.route('/stopRecord', methods=['POST'])
def stop_recording():
    if(camera.stop_recording()):
        return jsonify(stopped=True)
    else:
        return jsonify(stopped=False)


@app.route('/status')
def get_status():
    return jsonify(camera.camera_status())


if __name__ == '__main__':
    app.run(host='0.0.0.0')
