from flask import Flask, request, render_template, jsonify
import datetime


app = Flask(__name__)
app.config.from_object(__name__)

entry_id = 100

@app.route('/')
def main_page():
    return render_template('index.html')

@app.route('/', methods=['POST'])
def new_entry():
	global entry_id
	entry_id += 1
	entry = request.form['input_text']
	timestamp = datetime.datetime.now()
	data_list = {"entry":entry,'time':timestamp,'done':0,"id":entry_id}
	return jsonify(data_list)

@app.errorhandler(404)
def page_not_found(error):
    return render_template('index.html'), 404


if __name__ == '__main__':
    app.run()