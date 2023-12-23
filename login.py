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

about_us = "Jennifer&#39;s Closet is a volunteer project of Bethany Presbyterian " \
           "Church established by a neighborhood mom, named Jennifer, " \
           "in 2023. We offer gently used clothing in sizes infant to 3X, free " \
           "of charge for Greece families in need. We are located in the " \
           "church at 3000 Dewey Ave. (just north of Stone Rd.)<br> " \
           "<b>We do not serve thrifters or resellers.</b>"

appointments = "<b><span id='hours'> We offer appointments Mondays and Thursdays from 9:30 a.m. to 12 p.m.</span></b> " \
                               "Please submit your name, email, and phone number to book an appointment. You can also email us at" \
            "<a href='mailto:jennifersclosetny@gmail.com?subject=Donation Appointment'>jennifersclosetny@gmail.com</a>" \
            "to request additional information."

donations = "To donate clothing please email us at <a href='mailto:jennifersclosetny@gmail.com?subject=Donation Appointment'>jennifersclosetny@gmail.com</a>" \
            " to schedule your drop off. <br/>" \
            "<b>We ask that all donations are not stained, damaged, or worn-out clothing.</b> <br/>" \
            "If you would like to make a financial contribution to support our project, please make the checks payable to " \
            "Bethany Presbyterian Church with 'Clothing Closet' on the memo, 3000 Dewey Ave., Rochester, NY 14616."

volunteer = "If you are looking to help out in the clothing closet, we are looking for people to help sort donations, " \
            "replenish clothing racks, and more. <br/> " \
            "<b>Please email us at <a href='mailto:jennifersclosetny@gmail.com?subject=Donation Appointment'>jennifersclosetny@gmail.com</a> to find a time to volunteer. </b>"


def test_data():
    text_collections.delete_many({})
    account_collection.delete_many({})
    text_collections.insert_one({"data": 1, "about_us_data": about_us, "appointments_data": appointments, "donations_data": donations, "volunteering_data": volunteer})


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