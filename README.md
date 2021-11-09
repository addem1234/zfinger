# zfinger
React app that talks to a RESTful-ish API written in Python/Flask.

API endpoints:

| Path | Method | Requires Log-in | Result |
| ----- | ----- | ----- | ----- |
| `/` | `GET` | Yes | Displays index/searchbar |
| `/me` | `GET` | Yes | Displays an object with kth `uid` and wheter the user has uploaded an image to `s3`(`personal`) |
| `/user/<user>/image` | `GET` | No | Image for user, redirects to `s3` |
| `/user/<user>/image` | `POST` | Yes | Uploads image for user to `s3` |
| `/user/<user>/image` | `DELETE` | Yes | Deletes image for user from `s3` |
| `/user/<user>/image/<size>` | `GET` | No | Resized image for user |
| `/users/<query>` | `GET`| No | Redirects to `hodis`, quering all information, displaying all matching as objects in an array |
| `/ugkthid/<ugid>` | `GET` | No | Redirects to `hodis`, displaying information of `ugKthid` as an object |
| `/user/<user>` | `GET`,`POST` | No | Redirects to `hodis`, displaying information of `uid` as an object |

If log-in is required, user will be redirected to `login.kth.se` if not already.

Information displayed in `hodis` is `ugKthid`,`uid`,`on`,`mail`,`givenName`,`displayName`,`year` and`tag`.

## How to run
1. Define environment variables in `.env`
1. `pipenv install`
1. `pipenv shell`
1. `flask run`

## Environment variables
Required environment variables:
```
  AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID>
  AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
  LOGIN_API_KEY=<LOGIN_API_KEY>

## Optional
  S3_BUCKET=zfinger
  HODIS_HOST=https://hodis.datasektionen.se
  LOGIN_HOST=https://login2.datasektionen.se
```
