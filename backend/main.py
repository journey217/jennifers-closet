from flask import Flask, render_template, request, jsonify
from waitress import serve
import sqlite3
from flask_cors import CORS

app = Flask(__name__, static_url_path='', static_folder="react-build", template_folder='react-build')
CORS(app, resources={r"/*": {"origins": "*"}})
dbfile = 'database.db'


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
@app.errorhandler(404)
def catch_all(path):
    return render_template('index.html')


@app.route('/data', methods=['GET'])
def get_data():
    con = sqlite3.connect(dbfile)
    with con as cursor:
        try:
            query = '''SELECT * FROM active'''
            result = cursor.execute(query)
            rows = result.fetchall()
            aboutData = rows[0][1]
            donateData = rows[0][2]
            volunteerData = rows[0][3]
            return jsonify({"success": True, "aboutData": aboutData, "donateData": donateData, "volunteerData": volunteerData}), 200
        except sqlite3.Error as e:
            print(e)
            return jsonify({"success": False, "message": e}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
    # serve(app, host="0.0.0.0", port=8000)
