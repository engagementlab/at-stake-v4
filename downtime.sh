#!/bin/bash

# Set 'error' page to downtime version when build is ongoing
if [  $# -eq 0 ]; then
    echo "Must run script w/ one arg, either 'start' or 'end'"
    exit 1
fi

rm /srv/at-stake/current/client/static/error.html

if [ "$1" == "start" ]; then
    echo "Set error page to downtime."
    cp /srv/at-stake/current/client/static/downtime.html /srv/at-stake/current/client/static/error.html
else
    echo "Set error page back to 404 mode."
    cp /srv/at-stake/current/client/static/404.html /srv/at-stake/current/client/static/error.html
fi