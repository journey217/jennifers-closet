from flask import Flask, render_template, request, jsonify
from waitress import serve
import sqlite3
from flask_cors import CORS
import os
from datetime import datetime, timedelta
from functools import wraps
from dotenv import load_dotenv
from data_encryption import generate_token, hash_token, verify_token, verify_password

load_dotenv()

app = Flask(__name__, static_url_path='', static_folder="react-build", template_folder='react-build')
CORS(app, resources={r"/*": {"origins": "*"}})
dbfile = 'database/database.db'

USER_ATTR_12967 = int(os.getenv('USER_ATTRIBUTE_ID_12967', 1))
USER_ATTR_13345 = int(os.getenv('USER_ATTRIBUTE_ID_13345', 2))
USER_ATTR_16767 = int(os.getenv('USER_ATTRIBUTE_ID_16767', 3))
USER_ATTR_12677 = int(os.getenv('USER_ATTRIBUTE_ID_12677', 4))
USER_ATTR_12923 = int(os.getenv('USER_ATTRIBUTE_ID_12923', 5))


def get_user_attribute(user_id, attribute_label_id):
    con = sqlite3.connect(dbfile)
    with con as cursor:
        query = '''SELECT value FROM user_attribute 
                   WHERE user = ? AND user_attribute_label = ?'''
        result = cursor.execute(query, (user_id, attribute_label_id))
        row = result.fetchone()
        return row[0] if row else None


def set_user_attribute(user_id, attribute_label_id, value):
    con = sqlite3.connect(dbfile)
    with con as cursor:
        check_query = '''SELECT id FROM user_attribute 
                        WHERE user = ? AND user_attribute_label = ?'''
        result = cursor.execute(check_query, (user_id, attribute_label_id))
        existing = result.fetchone()
        
        if existing:
            update_query = '''UPDATE user_attribute SET value = ? 
                            WHERE user = ? AND user_attribute_label = ?'''
            cursor.execute(update_query, (value, user_id, attribute_label_id))
        else:
            insert_query = '''INSERT INTO user_attribute (user, user_attribute_label, value) 
                            VALUES (?, ?, ?)'''
            cursor.execute(insert_query, (user_id, attribute_label_id, value))
        
        con.commit()


def verify_user_auth(user_id, auth_token):
    if not auth_token or not user_id:
        return False
    
    con = sqlite3.connect(dbfile)
    with con as cursor:
        stored_hash = get_user_attribute(user_id, USER_ATTR_13345)
        expiration_str = get_user_attribute(user_id, USER_ATTR_12677)
        
        if not stored_hash:
            return False
        
        if not verify_token(auth_token, stored_hash):
            return False
        
        if expiration_str:
            expiration_dt = datetime.fromisoformat(expiration_str)
            if datetime.utcnow() > expiration_dt:
                return False
        
        return True


def verify_page_token(user_id, page_token):
    if not page_token or not user_id:
        return False
    
    stored_hash = get_user_attribute(user_id, USER_ATTR_16767)
    expiration_str = get_user_attribute(user_id, USER_ATTR_12923)
    
    if not stored_hash:
        return False
    
    if not verify_token(page_token, stored_hash):
        return False
    
    if expiration_str:
        expiration_dt = datetime.fromisoformat(expiration_str)
        if datetime.utcnow() > expiration_dt:
            return False
    
    return True


def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_token = request.headers.get('Authorization')
        if auth_token and auth_token.startswith('Bearer '):
            auth_token = auth_token[7:]
        
        data = request.json if request.is_json else {}
        user_id = data.get('user_id') or request.args.get('user_id')
        
        if not user_id:
            return jsonify({"success": False, "message": "User ID required"}), 400
        
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({"success": False, "message": "Invalid user ID"}), 400
        
        if not verify_user_auth(user_id, auth_token):
            return jsonify({"success": False, "message": "Unauthorized"}), 401
        
        return f(user_id, *args, **kwargs)
    
    return decorated_function


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
@app.errorhandler(404)
def catch_all(path):
    return render_template('index.html')


@app.route('/api/verify-auth-token', methods=['POST'])
def verify_auth_token_route():
    try:
        data = request.json
        user_id = data.get('user_id')
        auth_token = data.get('auth_token')
        
        if not user_id or not auth_token:
            return jsonify({
                "success": False,
                "valid": False,
                "message": "User ID and auth token required"
            }), 400
        
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "valid": False,
                "message": "Invalid user ID"
            }), 400
        
        is_valid = verify_user_auth(user_id, auth_token)
        
        return jsonify({
            "success": True,
            "valid": is_valid
        }), 200
        
    except Exception as e:
        print(f"Error verifying auth token: {e}")
        return jsonify({
            "success": False,
            "valid": False,
            "message": "Verification failed"
        }), 500


@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                "success": False,
                "message": "Username and password required"
            }), 400
        
        con = sqlite3.connect(dbfile)
        with con as cursor:
            user_query = '''SELECT id FROM users WHERE username = ?'''
            result = cursor.execute(user_query, (username,))
            user_row = result.fetchone()
            
            if not user_row:
                return jsonify({
                    "success": False,
                    "message": "Invalid credentials"
                }), 401
            
            user_id = user_row[0]
            
            stored_password_hash = get_user_attribute(user_id, USER_ATTR_12967)
            
            if not stored_password_hash:
                return jsonify({
                    "success": False,
                    "message": "Invalid credentials"
                }), 401
            
            if not verify_password(password, stored_password_hash):
                return jsonify({
                    "success": False,
                    "message": "Invalid credentials"
                }), 401
            
            auth_token = generate_token(32)
            auth_token_hash = hash_token(auth_token)
            expiration_time = datetime.utcnow() + timedelta(days=30)
            expiration_str = expiration_time.isoformat()
            
            set_user_attribute(user_id, USER_ATTR_13345, auth_token_hash)
            set_user_attribute(user_id, USER_ATTR_12677, expiration_str)
            
            return jsonify({
                "success": True,
                "user_id": user_id,
                "auth_token": auth_token,
                "expires_at": expiration_str,
                "message": "Login successful"
            }), 200
            
    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({
            "success": False,
            "message": "Login failed"
        }), 500


@app.route('/data', methods=['GET'])
def get_data():
    con = sqlite3.connect(dbfile)
    with con as cursor:
        try:
            # Fetch active data
            query = '''SELECT * FROM active'''
            result = cursor.execute(query)
            rows = result.fetchall()
            aboutData = rows[0][1]
            donateData = rows[0][2]
            volunteerData = rows[0][3]
            hoursData = rows[0][4]
            
            # Fetch wishlist data
            wishlist_query = '''SELECT id, item FROM wishlist ORDER BY id'''
            wishlist_result = cursor.execute(wishlist_query)
            wishlist_rows = wishlist_result.fetchall()
            
            # Format wishlist data as a list of dictionaries
            wishlist = [{"id": row[0], "item": row[1]} for row in wishlist_rows]
            
            return jsonify({
                "success": True, 
                "aboutData": aboutData, 
                "donateData": donateData, 
                "volunteerData": volunteerData,
                "hoursData": hoursData,
                "wishlist": wishlist
            }), 200
        except sqlite3.Error as e:
            print(e)
            return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/active', methods=['PUT'])
def update_active():
    """Update the active table data"""
    con = sqlite3.connect(dbfile)
    data = request.json
    
    with con as cursor:
        try:
            query = '''UPDATE active SET about = ?, donate = ?, volunteer = ?, hours = ? WHERE id = 1'''
            cursor.execute(query, (
                data.get('about', ''),
                data.get('donate', ''),
                data.get('volunteer', ''),
                data.get('hours', '')
            ))
            con.commit()
            return jsonify({"success": True, "message": "Active data updated successfully"}), 200
        except sqlite3.Error as e:
            print(e)
            return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/wishlist', methods=['POST'])
def add_wishlist_item():
    """Add a new wishlist item"""
    con = sqlite3.connect(dbfile)
    data = request.json
    
    with con as cursor:
        try:
            query = '''INSERT INTO wishlist (item) VALUES (?)'''
            cursor.execute(query, (data.get('item', ''),))
            con.commit()
            new_id = cursor.lastrowid
            return jsonify({"success": True, "id": new_id, "message": "Wishlist item added"}), 201
        except sqlite3.Error as e:
            print(e)
            return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/wishlist/<int:item_id>', methods=['DELETE'])
def delete_wishlist_item(item_id):
    """Delete a wishlist item"""
    con = sqlite3.connect(dbfile)
    
    with con as cursor:
        try:
            query = '''DELETE FROM wishlist WHERE id = ?'''
            cursor.execute(query, (item_id,))
            con.commit()
            return jsonify({"success": True, "message": "Wishlist item deleted"}), 200
        except sqlite3.Error as e:
            print(e)
            return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/wishlist/<int:item_id>', methods=['PUT'])
def update_wishlist_item(item_id):
    """Update a wishlist item"""
    con = sqlite3.connect(dbfile)
    data = request.json
    
    with con as cursor:
        try:
            query = '''UPDATE wishlist SET item = ? WHERE id = ?'''
            cursor.execute(query, (data.get('item', ''), item_id))
            con.commit()
            return jsonify({"success": True, "message": "Wishlist item updated"}), 200
        except sqlite3.Error as e:
            print(e)
            return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/wishlist/reorder', methods=['POST'])
def reorder_wishlist():
    """Reorder wishlist items by updating their IDs"""
    con = sqlite3.connect(dbfile)
    data = request.json
    items = data.get('items', [])
    
    with con as cursor:
        try:
            # First, create a temporary mapping table
            cursor.execute('CREATE TEMPORARY TABLE wishlist_temp AS SELECT * FROM wishlist WHERE 0')
            
            # Insert items in the new order
            for index, item in enumerate(items):
                cursor.execute('INSERT INTO wishlist_temp (id, item) VALUES (?, ?)', 
                             (index + 1, item['item']))
            
            # Delete all from original table
            cursor.execute('DELETE FROM wishlist')
            
            # Copy back from temp table
            cursor.execute('INSERT INTO wishlist (id, item) SELECT id, item FROM wishlist_temp')
            
            # Drop temp table
            cursor.execute('DROP TABLE wishlist_temp')
            
            con.commit()
            return jsonify({"success": True, "message": "Wishlist reordered successfully"}), 200
        except sqlite3.Error as e:
            print(e)
            con.rollback()
            return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/generate-page-token', methods=['POST'])
@require_auth
def generate_page_token(user_id):
    try:
        page_token = generate_token(32)
        page_token_hash = hash_token(page_token)
        expiration_time = datetime.utcnow() + timedelta(hours=24)
        expiration_str = expiration_time.isoformat()
        
        set_user_attribute(user_id, USER_ATTR_16767, page_token_hash)
        set_user_attribute(user_id, USER_ATTR_12923, expiration_str)
        
        return jsonify({
            "success": True,
            "page_token": page_token,
            "expires_at": expiration_str,
            "message": "Page token generated successfully"
        }), 200
        
    except Exception as e:
        print(f"Error generating page token: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to generate page token"
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
    # serve(app, host="0.0.0.0", port=8000)