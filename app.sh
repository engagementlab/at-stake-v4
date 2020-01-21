#!/usr/bin/env bash
export NVM_DIR=~/.nvm
source ~/.nvm/nvm.sh

cd server;
nvm use;
npm start;
