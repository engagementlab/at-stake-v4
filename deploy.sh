#!/bin/bash

# Require arg
if [  $# -eq 0 ]; then
    echo "Must run script w/ one arg, either 'qa' or 'prod'"
    exit 1
fi

# Source/load nvm
[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh;

# Client
cd client; 
bash ../downtime.sh start; 

nvm use;
npm i;

pm2 stop 'at-stake-client'; 

if [ "$1" == "prod" ]; then
    npm run build;
else
    npm run build-qa;
fi

pm2 start 'at-stake-client';

# Server
cd ../server;
nvm use;
npm i;
pm2 restart 'at-stake-server';
bash ../downtime.sh stop; 