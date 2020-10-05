# Giraffe Cypress

Testing framework for Giraffe features.

This project runs a light weight nextjs application with Giraffe, against which are executed cypress tests. 

## The App

**Start**

In dev mode (for adding elements) 

`$ scripts/setup.sh`

In production mode (for testing)

`$ scripts/setup.sh create -m prod`

The script installs Giraffe 

TODO describe Giraffe install options 

**Shutdown**

To shutdown the app and stop the influxdb docker container. 

`$ scripts/setup.sh shutdown`

**Clean**

To clean up the installation by removing Giraffe and cleaning up the local Influxdata directory. 

`$ scripts/setup.sh clean`



