from flask import Flask, request, jsonify, render_template
import mysql.connector
import os

app = Flask(__name__, static_folder='assets', template_folder='.')

# Database connection function
def get_db_connection():
    return mysql.connector.connect(
        host='bluerynodb.cj02o08agyaa.us-east-2.rds.amazonaws.com',
        user='admin',
        password='admin123',
        database='BlueRynoProjectDB'
    )

# Fetch New Invoices (where Status is 'Approved' or 'Pending')
def fetch_new_invoices():
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM Quotes WHERE Status in ('Approved','Pending')"
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# Fetch Old Invoices (where Status is 'Completed')
def fetch_old_invoices():
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM Quotes WHERE Status = 'Completed'"
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# API to fetch all invoices (GET request)
@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Quotes")
    invoices = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(invoices)

# API to add a new invoice (POST request)
@app.route('/api/invoices', methods=['POST'])
def add_invoice():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO Quotes (CustomerID, EmployeeID, QuoteDate, EndDate, TotalAmount, Status, PaymentStatus, PaymentMethod)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        data['CustomerID'], data['EmployeeID'], data['QuoteDate'], data['EndDate'], data['TotalAmount'],
        data['Status'], data['PaymentStatus'], data['PaymentMethod']
    )

    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Invoice added successfully'}), 201

# API to update an existing invoice (PUT request)
@app.route('/api/invoices/<int:invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    UPDATE Quotes 
    SET CustomerID = %s, EmployeeID = %s, QuoteDate = %s, EndDate = %s, TotalAmount = %s, Status = %s, PaymentStatus = %s, PaymentMethod = %s
    WHERE QuoteID = %s
    """
    values = (
        data['CustomerID'], data['EmployeeID'], data['QuoteDate'], data['EndDate'], data['TotalAmount'],
        data['Status'], data['PaymentStatus'], data['PaymentMethod'], invoice_id
    )

    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Invoice updated successfully'})

# Route to show new invoices (HTML page)
@app.route('/new_invoices', methods=['GET'])
def new_invoices():
    invoices = fetch_new_invoices()
    return render_template('new_invoices.html', invoices=invoices)

# Route to show old invoices (HTML page)
@app.route('/old_invoices', methods=['GET'])
def old_invoices():
    invoices = fetch_old_invoices()
    return render_template('old_invoices.html', invoices=invoices)

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
