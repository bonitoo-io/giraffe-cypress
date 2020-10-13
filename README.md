# Giraffe Cypress

Testing framework for Giraffe features.

This project runs a lightweight nextjs application with Giraffe, against which are executed cypress tests.

The testing cycle is comprised of three basic tasks. 

1. Start the Application
   1. Start Nexjs in either dev or prod mode
   1. Start a backend Influxdata database (currently OSS docker)
   1. Initiate Influxdata with test account
1. Add data to the backend database (in future should become part of third step)
1. Run the tests 

## Simplest Getting Started 

1) Setup the application

`$ scripts/setup.sh`

2) Add test data

`$ cd data/ && ./DataGen.ts; cd -`

3) Run tests

`$ cd tests`

`$ yarn cy:all`

Test reports are in the directory `tests/site`

4) Clean up test reports (in the directory `tests`)

`$ yarn rep:clean`

5) Shutdown app (in the project base directory)

`$ scripts/setup.sh shutdown`

6) Cleanup app workspace by removing Giraffe (in the project base directory)

`$ scripts/setup.sh clean`

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

## The Data Module 

In order to share data sources and data related utilities between the application and the test suite all data related artefacts are stored in the data module.  This module is then built and linked into the app workspace as part of the `create` command in the setup.sh script.  The `data` command in the setup.sh script rebuilds the module and links it into both `app` and `test` modules.

## Tests

Tests in the tests directory are Cypress based.  Two types of reports are generated; Mochawesome and Junit. When using the _workspace_ idiom Cypress cannot find the reporting modules located in the parent module.  In order to work around this issue, the reporting modules need to be soft-linked into the `tests/node_modules` directory.  This is also handled by the setup.sh script through the `reporting` command.  This is also wrapped in the yarn/npm scripts in the `tests` module.  

  

