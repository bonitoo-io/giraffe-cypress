#!/usr/bin/env bash

# to be used to configure jenkins nodes

# install preferred npm
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

# install yarn (needed for workspaces)
npm install yarn -g

# setup xvfb for cypress
sudo apt-get -y install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev \
libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb




