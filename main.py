import os
from flask import Flask, render_template, send_from_directory, request, jsonify, make_response, redirect
from pymongo import MongoClient
import bcrypt
from hashlib import sha256
from base64 import b64encode
from secrets import randbits


mongo_client = MongoClient("mongo")
db = mongo_client["JennifersCloset"]
account_collection = db["Accounts"]
tokens_collection = db["AuthTokens"]
text_collections = db['TextFields']
backups_collection = db['Backups']


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
    if "showAppsBool" in text.keys():
        ret["showAppsBool"] = text["showAppsBool"]
    else:
        ret["showAppsBool"] = "No"
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

        showAppsBool = request.form['showAppSelect']
        about_us_v = request.form['about-us']
        changes = {}
        if showAppsBool != "":
            changes['showAppsBool'] = showAppsBool
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


about_us = "<p>Jennifer's Closet is a volunteer project being housed at Bethany Presbyterian Church. It was established by a neighborhood mom, named Jennifer, in 2023. We offer gently used clothing in sizes infant to 3X, free of charge for Greece families in need. We are located in the church at 3000 Dewey Ave. (just north of Stone Rd.)<br><strong>We do not serve thrifters or resellers.</strong></p>"

appointments = '<p><strong><span id="hours"> We offer appointments Tuesdays from 1 p.m. to 3 p.m. and Thursdays from 9:30 a.m. to 12 p.m.</span></strong> Please submit your name, email, and phone number to book an appointment. You can also email us at <a href="mailto:jennifersclosetny@gmail.com?subject=Donation Appointment">jennifersclosetny@gmail.com</a> to request additional information.</p>'

donations = "To donate clothing please email us at <a href='mailto:jennifersclosetny@gmail.com?subject=Donation Appointment'>jennifersclosetny@gmail.com</a> to schedule your drop off. <br/><b>We ask that all donations are not stained, damaged, or worn-out clothing.</b> <br/>If you would like to make a financial contribution to support our project, please make the checks payable to Bethany Presbyterian Church with 'Clothing Closet' on the memo, 3000 Dewey Ave., Rochester, NY 14616."

volunteer = "If you are looking to help out in the clothing closet, we are looking for people to help sort donations, replenish clothing racks, and more. <br/> <b>Please email us at <a href='mailto:jennifersclosetny@gmail.com?subject=Donation Appointment'>jennifersclosetny@gmail.com</a> to find a time to volunteer. </b>"


def test_data():
    text_collections.delete_many({})
    account_collection.delete_many({})
    text_collections.insert_one(
        {"data": 1, "about_us_data": about_us, "appointments_data": appointments, "donations_data": donations,
         "volunteering_data": volunteer})


def check_username_exists(username):
    if account_collection.find_one({"username": username}, projection={"_id": False, "ID": False}):
        return True
    return False


def check_password(stored_hash, pass_attempt):
    return bcrypt.checkpw(long_password_hash(pass_attempt), stored_hash)


def verify_password(username, password):
    user = account_collection.find_one({"username": username}, projection={"_id": False, "ID": False})
    hashed_password = user['password']
    return check_password(hashed_password, password)


def verify_login(username, password):
    if not check_username_exists(username):
        return False
    if not verify_password(username, password):
        return False
    return True


def set_browser_cookie(username):
    authToken = str(randbits(80))
    encToken = generated_token_hash(authToken)
    account_collection.update_one({"username": username}, {"$set": {"token": encToken}})
    return authToken


def generated_token_hash(token):
    return sha256(token.encode()).hexdigest()


def generate_hashed_pass(user_password):
    salt = bcrypt.gensalt()
    hashed_pass = bcrypt.hashpw(long_password_hash(user_password), salt)
    return hashed_pass


def long_password_hash(password):
    return b64encode(sha256(password.encode()).digest())


def find_user_by_auth_token(token):
    token = str(token)
    token = sha256(token.encode()).hexdigest()
    return account_collection.find_one({"token": token}, projection={"_id": False, 'token': False})


if __name__ == '__main__':
    test_data()
    from waitress import serve

    serve(app, host="0.0.0.0", port=8000)
