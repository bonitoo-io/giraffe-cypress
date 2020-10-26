#!/usr/bin/env bash

echo "======== PREPARING JENKINS HEADLESS ENV ========"

# to be used to configure jenkins nodes

echo "=============== Installing NODE 12 ===="
NODE_VER=$(node --version)
exit_status=$?

if [ $exit_status -eq 0 ]; then
    echo "NODEJS already installed ${NODE_VER}"
else
    echo "Installing node and npm"
    # install preferred npm
    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "=============== Installing Yarn ===="
YARN_VER=$(yarn --version)
exit_status=$?

if [ $exit_status -eq 0 ]; then
    echo "Yarn already installed ${YARN_VER}"
else
    echo "Installing yarn globally"
    # install yarn (needed for workspaces)
    sudo npm install yarn -g
fi

echo "=============== Installing XVFB ===="
# setup xvfb for cypress
sudo apt-get -y install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev \
libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
