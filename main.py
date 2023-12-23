import os
from login import *
from flask import Flask, render_template, send_from_directory, request, jsonify, make_response, redirect

app = Flask(__name__, template_folder='templates', static_folder='static')


@app.route('/')
def home():
    return render_template('home-page.html')


@app.route('/wish-list.html')
def wish():
    return render_template('wish-list.html')


@app.route('/login.html')
def login_page():
    return render_template('login.html')


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'static/favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.route('/scripts.js')
def scripts():
    return send_from_directory(os.path.join(app.root_path),
                               './scripts.js', mimetype='text/javascript')


@app.post('/login')
def login():
    username = request.form['username']
    password = request.form['password']
    if verify_login(username, password):
        authToken = set_browser_cookie(username)
        response = make_response(render_template('edit_page.html'))
        response.set_cookie('authenticationToken', authToken,
                            max_age=3600, httponly=True, samesite='Strict')
        return response
    else:
        response = make_response(render_template("login.html"))
        return response


@app.route('/page_data')
def fetch_pages():
    text = text_collections.find_one({"data": 1}, projection={"_id": False, "ID": False})
    ret = {"about_us_data": text['about_us_data'], "donations_data": text['donations_data'],
           "volunteering_data": text['volunteering_data'], "appointments_data": text['appointments_data']}
    response = jsonify(ret)
    return response


@app.post('/update-text')
def update():
    cookieToken = request.cookies.get('authenticationToken')
    user = find_user_by_auth_token(cookieToken)
    if user:
        text = text_collections.find_one({"data": 1}, projection={"_id": False, "ID": False})
        backups_collection.insert_one({"about_us_data": text['about_us_data'], "donations_data": text['donations_data'],
                                       "volunteering_data": text['volunteering_data'],
                                       "appointments_data": text['appointments_data']})
        about_us_v = request.form['about-us']
        changes = {}
        if about_us_v != "":
            changes['about_us_data'] = about_us_v
        appointments_v = request.form['appointments']
        if appointments_v != "":
            changes['appointments_data'] = appointments_v
        donations_v = request.form['donations']
        if donations_v != "":
            changes['donations_data'] = donations_v
        volunteering_v = request.form['volunteering']
        if volunteering_v != "":
            changes['volunteering_data'] = volunteering_v
        # text_collections.update_one({"data": 1}, {"$set": {"about_us_data": about_us_v,
        #                                           "appointments_data": appointments_v,
        #                                           "donations_data": donations_v,
        #                                           "volunteering_data": volunteering_v}})
        if len(changes) == 0:
            return redirect('/')
        text_collections.update_one({"data": 1}, {"$set": changes})
    return redirect("/")


@app.route('/check_account')
def check():
    if account_collection.count_documents({}) < 1:
        response_data = {"accounts": 0}
    else:
        response_data = {"accounts": 1}
    response = jsonify(response_data)
    return response


@app.post('/register')
def register():
    if account_collection.count_documents({}) < 1:
        username = request.form['username']
        password = request.form['password']
        hashed_pass = generate_hashed_pass(password)
        account_collection.insert_one({"username": username, "password": hashed_pass})
    return redirect('/')


if __name__ == '__main__':
    test_data()
    from waitress import serve
    serve(app, host="0.0.0.0", port=8000)
