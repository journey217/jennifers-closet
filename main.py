import os

from flask import Flask, render_template, send_from_directory

app = Flask(__name__, template_folder='templates', static_folder='static')


@app.route('/')
def home():
    return render_template('home-page.html')


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'static/favicon.ico', mimetype='image/vnd.microsoft.icon')


if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=8000)
    # app.run(host="0.0.0.0", port=8000)