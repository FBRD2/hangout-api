#!/bin/bash

API="http://localhost:4741"
URL_PATH="/hangs"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "hang": {
      "title": "'"${TITLE}"'",
      "date": "'"${DATE}"'",
      "time": "'"${TIME}"'",
      "location": "'"${LOCATION}"'",
      "description": "'"${DESCRIPTION}"'"
    }
  }'

echo
