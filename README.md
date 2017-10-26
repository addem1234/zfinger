# zfinger
React app that talks to a RESTful-ish API written in Python/Flask.

API endpoints:
```
  /login                     Log in using login2.datasektionen.se
  /logout                    Log out using login2.datasektionen.se

  /users/<query>             LDAP search for users, at most 20 results due to LDAP restrictions

  /user/<user>               LDAP info for user, plus "personal" field indicating personal image status.
  /user/<user>/image         Image for user, redirects to S3. POST/DELETE is supported if the user is logged in.
  /user/<user>/image/<size>  Resized image for user
```

Required environment variables:
```
  AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID>
  AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>

  API_HOST=https://hodis.datasektionen.se
  LOGIN_HOST=https://login2.datasektionen.se
  LOGIN_API_KEY=<LOGIN_API_KEY>
```
