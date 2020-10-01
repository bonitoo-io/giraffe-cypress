#!/bin/bash

PRJ_ROOT="$(dirname "$(dirname "$(readlink -fm "$0")")")"
INFLUX_DIR="$PRJ_ROOT/influxdata"
GIRAFFE_GITHUB_URL="https://github.com/dubsky/giraffe.git"

echo setting up Giraffe Cypress framework

echo PRJ_ROOT $PRJ_ROOT

echo INFLUX_DIR $INFLUX_DIR

#mkdir -p "$PRJ_ROOT/$INFLUX_DIR"

[ -d $INFLUX_DIR ] || mkdir $INFLUX_DIR

[ -d $INFLUX_DIR/giraffe/giraffe ] || git clone ${GIRAFFE_GITHUB_URL} ${INFLUX_DIR}/giraffe

cd ${INFLUX_DIR}/giraffe/giraffe

git checkout "feat/geo"

yarn

yarn build


