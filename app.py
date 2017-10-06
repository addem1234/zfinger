from os import getenv
from io import BytesIO

from flask import Flask, request, redirect, jsonify, send_file, Response
from werkzeug.contrib.fixers import ProxyFix
from werkzeug.urls import url_quote

from requests import get
from magic import from_buffer
from PIL import Image

import s3

app = Flask(__name__, static_url_path='', static_folder='build')
app.wsgi_app = ProxyFix(app.wsgi_app)

LOGIN_API_KEY = getenv('LOGIN_API_KEY')
LOGIN_HOST = getenv('LOGIN_HOST')
API_HOST = getenv('API_HOST')

def verify_token(token):
    payload = {'format': 'json', 'api_key': LOGIN_API_KEY}
    response = get('https://{}/verify/{}'.format(LOGIN_HOST, token), params=payload)
    if response.status_code == 200:
        return response.json()['user']
    else:
        return False

@app.route('/')
def index():
    user = verify_token(request.args.get('token'))
    if user:
        return app.send_static_file('index.html')
    else:
        return redirect('https://{}/login?callback={}?token='.format(LOGIN_HOST, url_quote(request.base_url)))


def path(user):     return '{}/{}/{}'.format(user[0], user[1], user)
def personal(path): return 'personal_images/{}'.format(path)
def original(path): return 'original_images/{}'.format(path)

@app.route('/me')
def me():
    user = verify_token(request.args.get('token'))
    if user:
        return jsonify({
            'uid': user,
            'personal': s3.exists(personal(path(user)))
        })
    else:
        return jsonify({
            'uid': 'unknown',
            'personal': False
        })

missing = s3.get('missing.svg')['Body'].read()

@app.route('/user/<user>/image', methods=['GET', 'POST', 'DELETE'])
def user_image(user):
    if request.method == 'GET':
        if s3.exists(personal(path(user))):
            obj = s3.get(personal(path(user)))
            return send_file(obj['Body'], mimetype=obj['ContentType'])
        elif s3.exists(original(path(user))):
            obj = s3.get(original(path(user)))
            return send_file(obj['Body'], mimetype=obj['ContentType'])
        else:
            return Response(missing, content_type='image/svg+xml')

    elif request.method == 'POST' and verify_token(request.args.get('token')):
        image = request.files['file']
        mimetype = from_buffer(image.stream.read(1024), mime=True)
        s3.put(personal(path(user)), image, mimetype)
        return 'Personal image uploaded successfully'

    elif request.method == 'DELETE' and verify_token(request.args.get('token')):
        s3.delete(personal(path(user)))
        return 'Personal image deleted successfully'
    else:
        return 'You can only edit you own picture!'

@app.route('/user/<user>/image/<int:size>')
def user_image_resize(user, size):
    tmp = False
    if s3.exists(personal(path(user))):
        tmp = BytesIO(s3.get(personal(path(user)))['Body'].read())
    elif s3.exists(original(path(user))):
        tmp = BytesIO(s3.get(original(path(user)))['Body'].read())

    if tmp:
        image = Image.open(tmp)
        image.thumbnail((size, size), Image.ANTIALIAS)
        tmp = BytesIO()
        image.save(tmp, 'JPEG')
        tmp.seek(0)
        return Response(tmp, content_type='image/jpeg')
    else:
        return missing

# Redirects to the old API
@app.route('/users/<query>')
def users(query):
    resp = redirect(API_HOST + '/users/' + query)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/ugkthid/<id>')
def ugkthid(id):
    resp = redirect(API_HOST + '/ugkthid/' + id)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/user/<user>', methods=['GET', 'POST'])
def user(user):
    resp = redirect(API_HOST + '/uid/' + user)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

