# zfinger
React app that talks to a RESTful-ish API written in Python/Flask.

API endpoints:
```
  /user/<user>/image         Image for user, redirects to S3. POST/DELETE is supported if the user is logged in.
  /user/<user>/image/<size>  Resized image for user
```

Required environment variables:
```
  AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID>
  AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
  LOGIN_API_KEY=<LOGIN_API_KEY>

## Optional
  HODIS_HOST=https://hodis.datasektionen.se
  LOGIN_HOST=https://login2.datasektionen.se
```
