#!/usr/bin/env sh

if [ -z ${REACT_APP_API_BASE_URL} ]; then
    echo "REACT_APP_API_BASE_URL is not set, setting to default localhost:8080"
    REACT_APP_API_BASE_URL="http://localhost:8080/api"
else
    echo "REACT_APP_API_BASE_URL is set to ${REACT_APP_API_BASE_URL}"
fi

sed -i -e "s#__REACT_APP_API_BASE_URL__#${REACT_APP_API_BASE_URL}#g" /var/www/env.js

exec "$@"
