from flask import Flask, render_template, request, jsonify
from waitress import serve
import sqlite3
from flask_cors import CORS

app = Flask(__name__, static_url_path='', static_folder="react-build", template_folder='react-build')
CORS(app, resources={r"/*": {"origins": "*"}})
dbfile = 'database/database.db'


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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
    # serve(app, host="0.0.0.0", port=8000)