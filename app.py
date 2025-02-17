from os import getenv
from io import BytesIO
from typing import Dict, Tuple

from flask import Flask, request, redirect, jsonify, send_file, Response, abort
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.urls import url_quote

from functools import wraps
from datetime import datetime, timedelta
from requests import get
from magic import from_buffer
from PIL import Image

import s3

import re

app = Flask(__name__, static_url_path='', static_folder='build')
app.wsgi_app = ProxyFix(app.wsgi_app)

LOGIN_API_KEY = getenv('LOGIN_API_KEY')
LOGIN_API_URL = getenv('LOGIN_API_URL', 'https://login.datasektionen.se')
LOGIN_FRONTEND_URL = getenv('LOGIN_FRONTEND_URL', 'https://login.datasektionen.se')
HODIS_HOST = getenv('HODIS_HOST', 'https://hodis.datasektionen.se')

MISSING = s3.get('missing.svg')['Body'].read()
MISSING_JPG = s3.get('missing.jpeg')['Body'].read()

login_cache: Dict[str, Tuple[str, datetime]] = dict()

cache_timeout = 3600 * 24 * 31 # one month

def verify_token(token: str):
    match = re.search('^[A-Za-z0-9\-]+$', token)
    if match is None:
        return None
    if token in login_cache and login_cache[token][1] > datetime.now() - timedelta(hours=1):
        return login_cache[token][0]

    payload = {'format': 'json', 'api_key': LOGIN_API_KEY}
    response = get(f'{LOGIN_API_URL}/verify/{token}', params=payload)
    if response.status_code == 200:
        user = response.json()['user']
        login_cache[token] = (user, datetime.now())
        return user
    else:
        return None


def require_login(user_param_name='user'):
    def inner_decorator(func):
        @wraps(func)
        def wrapped_func(*args, **kwargs):
            token = request.args.get('token')
            if token is not None:
                resp = redirect(request.base_url)
                resp.set_cookie('token',token,httponly=True,samesite='lax')
                return resp
            token = request.cookies.get('token')
            user = None if token is None else verify_token(token)

            if user is None:
                return redirect(f'{LOGIN_FRONTEND_URL}/login?callback={url_quote(request.base_url)}?token=')

            kwargs[user_param_name] = user
            return func(*args, **kwargs)

        return wrapped_func

    return inner_decorator


# noinspection PyUnusedLocal
@app.route('/', methods=['GET'])
@require_login()
def index(user):
    # Don't give a flying flamingo about the user, just that you're logged in
    return app.send_static_file('index.html')

def path(user):
    return '{}/{}/{}'.format(user[0], user[1], user)


def personal_path(user):
    return f'personal_images/{path(user).lower()}'


def original_path(user):
    return f'original_images/{path(user).lower()}'


@app.route('/me', methods=['GET'])
@require_login()
def me(user):
    return jsonify({
        'uid': user,
        'personal': s3.exists(personal_path(user))
    })


@app.route('/user/<user>/image', methods=['GET'])
def user_image(user):
    if s3.exists(personal_path(user)):
        obj = s3.get(personal_path(user))
        # cache_timeout sets Cache-Control: max-age=x
        return send_file(obj['Body'], mimetype=obj['ContentType'], cache_timeout=cache_timeout)
    elif s3.exists(original_path(user)):
        obj = s3.get(original_path(user))
        return send_file(obj['Body'], mimetype=obj['ContentType'], cache_timeout=cache_timeout)
    else:
        resp = Response(MISSING, content_type='image/svg+xml')
        resp.headers['Cache-Control'] = f"public, max-age={cache_timeout}"
        resp.headers['Expires'] = (datetime.now() + timedelta(seconds=cache_timeout)).strftime('%a, %d %b %Y %H:%M:%S GMT')
        return resp


@app.route('/user/<user>/image', methods=['POST'])
@require_login('req_user')
def edit_user_image(user, req_user):
    if user != req_user:
        abort(403)
    image = request.files['file']
    mimetype = from_buffer(image.stream.read(1024), mime=True)
    if mimetype not in ['image/jpeg', 'image/png']:
        abort(400, 'The format of this file is invalid, we only allow, png and jp(e)g')

    s3.put(personal_path(user), image, mimetype)
    return "Personal image uploaded successfully"


@app.route('/user/<user>/image', methods=['DELETE'])
@require_login('req_user')
def delete_user_image(user, req_user):
    if user != req_user:
        abort(403)
    s3.delete(personal_path(user))
    return "Personal image deleted successfully"


@app.route('/user/<user>/image/<int:size>', methods=['GET'])
def user_image_resize(user, size):
    tmp = False
    mimetype = ""
    if s3.exists(personal_path(user)):
        tmp = BytesIO(s3.get(personal_path(user))['Body'].read())
    elif s3.exists(original_path(user)):
        tmp = BytesIO(s3.get(original_path(user))['Body'].read())

    if not tmp:
        # Can't resize svg, resize jpg instead
        tmp = BytesIO(MISSING_JPG)

    image = Image.open(tmp)
    image.thumbnail((size, size), Image.ANTIALIAS)
    tmp = BytesIO()
    if image.mode in ("RGBA", "P"): 
        image = image.convert("RGB")
    image.save(tmp, 'JPEG')
    tmp.seek(0)

    resp = Response(tmp, content_type='image/jpeg')
    resp.headers['Cache-Control'] = f"public, max-age={cache_timeout}"
    resp.headers['Expires'] = (datetime.now() + timedelta(seconds=cache_timeout)).strftime('%a, %d %b %Y %H:%M:%S GMT')
    return resp


# Redirects to the old API
@app.route('/users/<query>', methods=['GET'])
def find_users(query):
    resp = redirect(HODIS_HOST + '/users/' + query)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


@app.route('/ugkthid/<ugid>', methods=['GET'])
def ugkthid(ugid):
    resp = redirect(HODIS_HOST + '/ugkthid/' + ugid)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


@app.route('/user/<user>', methods=['GET', 'POST'])
def user_info(user):
    resp = redirect(HODIS_HOST + '/uid/' + user)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
