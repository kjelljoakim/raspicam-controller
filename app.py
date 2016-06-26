from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('base.html')


@app.route('/test/<name>')
def test_route(name):
    return render_template('test.html', name=name)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
