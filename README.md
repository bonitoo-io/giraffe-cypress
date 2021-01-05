# Giraffe Cypress

Testing framework for Giraffe features.

This project runs a lightweight nextjs application with Giraffe, against which are executed cypress tests.

The testing cycle is comprised of three basic tasks. 

1. Start the Application
   1. Start Nexjs in either dev or prod mode
   1. Start a backend Influxdata database (currently OSS docker)
   1. Initiate Influxdata with test account
1. Add data to the backend database (only needed when inspecting the Application.  Data can be added as a support command in Cypress.)
1. Run the tests 

## Simplest Getting Started 

1) Setup the application

`$ scripts/setup.sh create`

2) When preparing tests and inspecting the applications, add test data

`$ cd data/ && ./DataGen.ts; cd -`

3) Run tests

`$ cd tests`

`$ yarn cy:all`

Test reports are in the directory `tests/site`.

4) Clean up test reports (in the directory `tests`)

`$ yarn rep:clean`

5) Shutdown app (in the project base directory)

`$ scripts/setup.sh shutdown`

6) Cleanup app workspace by removing Giraffe (in the project base directory)

`$ scripts/setup.sh clean`

## The App

The application is intended to be rudimentary.  It is written in React with the Nextjs framework.  Nextjs is fairly lightweight and it offers a mapping from the directory structure under the  `app/pages` directory to server contexts.  This simplifies adding new pages dedicated to rendering and then testing specific Giraffe feature sets.   

One requirement was to test the full stack as closely as possible.  For this reason test data is written to an Influxdata OSS server on the backend.  The data is then retrieved by the application and provided to Giraffe. Note, there is a backlog item to leverage Influxdata clients directly in the Giraffe library.  This may need to be added in future.  

The application can be configured and started using the `setup.sh` script in the `scripts` directory.  This script can add Giraffe to the application in one of two ways, checkout from github or downloading a release.  It can also start the Nodejs application in `dev` (default) or `production` modes.

The `setup.sh` script accepts six commands. 

   * `create` - creates and launches the Nextjs application
   * `clean` - Removes Giraffe from the application
   * `shutdown` - Shuts down the application
   * `data` - Builds and links in the data module.  Useful during development. 
   * `influx` - Reinstalls the Influx docker backend database. 
   * `reporting` - Sets up linked directories for Cypress reporting.  Used mainly in test scripts.
   * `help` - (default) shows the usage message

**Start**

In dev mode (for adding elements) 

`$ scripts/setup.sh create`

In production mode (for testing)

`$ scripts/setup.sh create -m prod`

**Giraffe Config**

The script installs Giraffe either from the release of from a local build checked out from github. 

To link in the latest release

`scripts/setup.sh create -d release` 

Specific release (`-r, --release`), tag (`-t, --tag`) and version (`-v, --version`) can also be specified. 

To build Giraffe locally from the github project, use the default. 

`scripts/setup.sh create` 

Or to be more verbose use the flag(`-d`, `--dist`): 

`scripts/setup.sh create --dist local`

A specific git url can also be specified using the flag (`-u, --url`).  Specific branches can also be declared (`-b`, `--branch`); 

**Shutdown**

To shutdown the app and stop the influxdb docker container. 

`$ scripts/setup.sh shutdown`

**Clean**

To clean up the installation by removing Giraffe and cleaning up the local Influxdata directory. 

`$ scripts/setup.sh clean`

## The Data Module 

In order to share data sources and data related utilities between the application and the test suite all data related artefacts are stored in the data module.  This module is then built and linked into the app workspace as part of the `create` command in the setup.sh script.  The `data` command in the setup.sh script rebuilds the module and links it into both `app` and `test` modules.

When developing tests it can be useful to add data to the database.  This can be done with the `DataGen.ts` script. 

`$ data/DataGen.ts`

## Tests

Tests in the tests directory are Cypress based.  Two types of reports are generated; Mochawesome and Junit. When using the _workspace_ idiom Cypress cannot find the reporting modules located in the parent module.  In order to work around this issue, the reporting modules need to be soft-linked into the `tests/node_modules` directory.  This is handled by the `setup.sh` script through the `reporting` command.  This is also wrapped in the yarn/npm scripts in the `tests` module.

Test related commands can be executed in the `tests` directory. 

**Start Cypress dev**

`$ yarn cy:open`

This opens the Cypress electron development environment. 

**Run all tests**

`$ yarn cy:run`

Currently tests against Electron.  (TODO configure target browser choice).

**Generate reports**

`$ yarn cy:reports`

Generates JUnit and HTML reports to the directory `tests/sites`.  Note that screenshots and screencasts can be found in the directories `tests/cypress/screenshots` and `tests/cypress/videos` respectively. 

**Test and Report**

`$ yarn cy:all`

**Clean reports**

`$ yarn rep:clean`

  

