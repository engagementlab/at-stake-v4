#!/bin/bash

# Set 'error' page to downtime version when build is ongoing
if [  $# -eq 0 ]; then
    echo "Must run script w/ one arg, either 'start' or 'end'"
    exit 1
fi

rm client/static/error.html

if [ "$1" == "start" ]; then
    echo "Set error page to downtime."
    cp client/static/downtime.html client/static/error.html
else
    echo "Set error page back to 404 mode."
    cp client/static/404.html client/static/error.html
fi