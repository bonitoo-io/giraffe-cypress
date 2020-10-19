#!/usr/bin/env bash

# N.B. this file is Source of Truth of Influx values for app and test modules
#      see for example tests/utils/genInfluxFixture.ts

export INFLUX_URL=http://localhost:8086
export INFLUX_USERNAME=admin
export INFLUX_PASSWORD=changeit
export INFLUX_ORG=qa
export INFLUX_BUCKET=qa
export INFLUX_TOKEN=TEST_TOKEN

