#!/bin/bash

PRJ_ROOT="$( cd "$( dirname "${BASH_SOURCE[1]}" )" >/dev/null 2>&1 && pwd )"
INFLUX_DIR=influxdata
INFLUX_DIR_ABS="$PRJ_ROOT/$INFLUX_DIR"
GIRAFFE_GITHUB_URL="https://github.com/influxdata/giraffe.git"
GIRAFFE_GITHUB_BRANCH="master"
GIRAFFE_DIST="@influxdata/giraffe"
GIRAFFE_VERSION=""
GIRAFFE_TAG=""
ACTION="usage"
# TYPE can be "build" - e.g. from local build or "release" - e.g. official distribution
DIST="local"
# APP_BUILD can be "dev" or "prod" e.g. production
APP_BUILD="dev"
APP_LOG_FILE="${PRJ_ROOT}/app/next.log"

INFLUX_DOCKER_IMAGE="quay.io/influxdb/influx:nightly"
INFLUX_DOCKER_LOCAL_IMAGE="influx2_debug"
INFLUX_INSTANCE_NAME="influx2_solo"
INFLUX_HOME="${HOME}/.influxdbv2"
INFLUX_LOG_DIR=${PRJ_ROOT}/scripts/log
INFLUX_LOG_FILE=${INFLUX_LOG_DIR}/docker.log

check_env(){
  echo "==== Checking Environment ===="
  DOCKER_REQVER="19.3.3"
  DOCKER_VER=$(docker --version | awk '{print $3}')
  YARN_VER=$(yarn --version)
  YARN_REQVER="1.18.0"

  echo "Detected docker version ${DOCKER_VER}"

  if [ "$(printf '%s\n' "$DOCKER_REQVER" "$DOCKER_VER" | sort -V | head -n1)" = "$DOCKER_REQVER" ]; then
        echo "Docker version ${DOCKER_VER} OK"
  else
      if [ "$USER" != "root" ]; then
            echo "This script requires docker."
            echo "When using a version earlier than ${DOCKER_REQVER} is must be run using sudo or as root."
            echo "Aborting."
            exit 1;
      else
            echo "Detected docker is earlier than ${DOCKER_REQVER}"
            echo "Continuing as ${USER}..."
      fi
  fi

 echo YARN_VER ${YARN_VER}
 # Ran into yarn issue 7807 - downgrade yarn
 if [ "${YARN_VER}" != "${YARN_REQVER}" ]; then
   echo "Resetting yarn version to ${YARN_REQVER}"
   yarn policies set-version ${YARN_REQVER}
 fi

}

make_influx_dir(){

   echo "======== Making Influx Dir ===="
   if [[ -d $INFLUX_DIR_ABS ]]; then
      echo "$INFLUX_DIR_ABS" already exists. Not recreating.
   else
     mkdir $INFLUX_DIR_ABS
     echo created $INFLUX_DIR_ABS
   fi

}

clean_influx_dir(){

   echo "======== Deleting Influxdata Dir ===="
   cd $PRJ_ROOT || echo "Failed to cd to ${PRJ_ROOT}"
   rm -rdf $INFLUX_DIR
   echo "Removed $INFLUX_DIR"
}

clone_giraffe(){

  echo "======== Cloning Giraffe ===="
  echo "source repository $GIRAFFE_GITHUB_URL"
  if [[ -d $INFLUX_DIR_ABS/giraffe/giraffe ]]; then
     echo $INFLUX_DIR_ABS/giraffe/giraffe already exists.  Using existing directory.
     echo To regenerate run \$ setup.sh clean and rerun \$ setup.sh create
  else
     git clone ${GIRAFFE_GITHUB_URL} ${INFLUX_DIR_ABS}/giraffe
     exit_status=$?
     if [ $exit_status -eq 0 ]; then
        echo "Giraffe clone SUCCESS"
     else
        echo "Giraffe clone FAILED"
        exit 1
     fi
  fi
}

build_giraffe(){

  echo "======== Building Giraffe ===="
  echo "target branch $GIRAFFE_GITHUB_BRANCH"
  if [[ -d $INFLUX_DIR_ABS/giraffe/giraffe ]]; then
     cd ${INFLUX_DIR_ABS}/giraffe/giraffe || echo "failed to cd ${INFLUX_DIR_ABS}/giraffe/giraffe"
     git checkout $GIRAFFE_GITHUB_BRANCH
     if [[ -n ${COMMIT+x} ]]; then
       echo "  === Checking out commit ${COMMIT}"
       git checkout ${COMMIT}
       ckout_status=$?
       if [ $ckout_status -eq 0 ]; then
          echo "Checkout ${COMMIT} SUCCESS"
       else
          echo "Checkout ${COMMIT} FAILED - Aborting"
          exit 1
       fi
     fi
     yarn install
     yarn build
     exit_status=$?
     if [ $exit_status -eq 0 ]; then
        echo "Giraffe build SUCCESS"
     else
        echo "Giraffe build FAILED"
        exit 1
     fi
  else
     echo $INFLUX_DIR_ABS/giraffe/giraffe does not exist.
  fi
}

remove_giraffe_from_app(){

  echo "======== Removing Giraffe from Project ===="
  cd ${PRJ_ROOT}/app || echo "failed to cd ${PRJ_ROOT}/app"
  yarn remove "@influxdata/giraffe"

}

add_local_giraffe_to_app(){

  echo "======== Adding Giraffe to Project ===="
  if [[ -d $INFLUX_DIR_ABS/giraffe/giraffe/dist ]]; then
     cd ${PRJ_ROOT}/app || echo "failed to cd ${PRJ_ROOT}/app"
     yarn add file:${INFLUX_DIR_ABS}/giraffe/giraffe
  else
     echo Local giraffe $INFLUX_DIR_ABS/giraffe/giraffe/dist not found.  Not added to package.json.
  fi
}

add_giraffe_dist_to_app(){
     echo "using distribution ${GIRAFFE_DIST}"

     GIRAFFE_CHECKOUT=${GIRAFFE_DIST}

     if [[ "x${GIRAFFE_TAG}" != "x" ]]; then
         GIRAFFE_CHECKOUT="${GIRAFFE_DIST}@${GIRAFFE_TAG}"
     fi

     if [[ "x${GIRAFFE_VERSION}" != "x" ]]; then
         GIRAFFE_CHECKOUT="${GIRAFFE_DIST}@${GIRAFFE_VERSION}"
     fi

     echo "GIRAFFE CHECKOUT ${GIRAFFE_CHECKOUT}"

     cd ${PRJ_ROOT}/app || exit 1
     yarn add ${GIRAFFE_CHECKOUT}
     exit_status=$?
     if [[ ${exit_status} -eq 0 ]]; then
        echo "Giraffe install SUCCESS"
     else
        echo "Giraffe install FAILED"
        exit 1
     fi
}

create_from_local(){
   echo "======== Creating from Giraffe Local Build ===="
   make_influx_dir
   clone_giraffe
   build_giraffe
   add_local_giraffe_to_app
   build_data_module
   add_data_module_to_app
   return_home
}

create_from_dist(){
  echo "======== Creating from Giraffe Distribution ===="
  add_giraffe_dist_to_app
}

create_app(){
   if [[ "$DIST" = "local" ]]; then
       create_from_local
   elif [[ "$DIST" = "release" ]]; then
       create_from_dist
   else
       echo "Distribution type (-d | --dist) must be eight 'local' or 'release'."
       echo "Distribution type ${DIST} is unknown."
       exit 1
   fi

   run_docker_influx
   #TODO better wait
   timeout 30 sh -c 'until nc -z $0 $1; do sleep 1; done' localhost 8086
   exit_status=$?
   if [[  ${exit_status} -ne 0 ]]; then
     echo "Influx Docker FAILED to start in 30 seconds.  Default user not created."
     exit 1
   fi
   setup_docker_influx

   start_app
}

start_app(){
   echo "===== BUILDING NEXTJS APP ====="
   cd ${PRJ_ROOT}/app || exit 1

   yarn install
   yarn build

   echo "===== STARTING NEXTJS APP ====="
   if [[ "${APP_BUILD}" = "dev" ]]; then
       echo "======== Running in Dev Mode ===="
       yarn dev > ${APP_LOG_FILE} 2>&1 &
       echo $!
   elif [[  "${APP_BUILD}" = "prod" ]]; then
       echo "======== Running in Production Mode ===="
       yarn start > ${APP_LOG_FILE} 2>&1 &
       exit_status=$?
       echo "exit_status ${exit_status}"
   fi

   cd - || exit 1

}

kill_next_hard(){
   echo "====== Shutting Down Nextjs Hard ======"
# TODO find better way to manage next server shutdown
   killall -q -SIGKILL node
}

run_docker_influx(){
   echo "======== Installing Influxdbv2 Docker ===="
   echo "============ building local docker image ====="
   cd ${PRJ_ROOT}/scripts || exit
   docker pull ${INFLUX_DOCKER_IMAGE}
   docker build -t ${INFLUX_DOCKER_LOCAL_IMAGE} .

   cd - || exit
   echo "============ starting local docker container ====="
   mkdir -p ${INFLUX_LOG_DIR}
   echo "[$(date +"%d.%m.%Y %T")] starting docker instance ${INFLUX_INSTANCE_NAME}"
   docker run --name ${INFLUX_INSTANCE_NAME} --publish 8086:8086 ${INFLUX_DOCKER_LOCAL_IMAGE} > ${INFLUX_LOG_FILE} 2>&1 &
   echo "[$(date +"%d.%m.%Y %T")] started instance $INFLUX_INSTANCE_NAME listening at port 8086."
   echo "logfile at $INFLUX_LOG_FILE"
   # TODO better wait for Influx to start
   sleep 5
   tail -n32 ${INFLUX_LOG_FILE}
}

setup_docker_influx(){
  echo "======== Setting up Influxdbv2 Docker ===="
  timeout 30 bash -c 'while ! wget -q -o /dev/null -O /dev/null http://localhost:8086/api/v2/setup; do sleep 1; done;'
  exit_status=$?
  if [[  ${exit_status} -ne 0 ]]; then
     echo "Influx Docker FAILED to locate setup endpoint in 30 seconds.  Default user not created."
     exit 1
   fi
  source ${PRJ_ROOT}/scripts/influx_env.sh
  echo "INFLUX_USERNAME ${INFLUX_USERNAME}"
  echo "INFLUX_ORG ${INFLUX_ORG}"
  echo "INFLUX_BUCKET ${INFLUX_BUCKET}"
  docker exec influx2_solo influx setup -u ${INFLUX_USERNAME} -p ${INFLUX_PASSWORD} \
                               -o ${INFLUX_ORG} -b ${INFLUX_BUCKET} -t ${INFLUX_TOKEN} -f
  exit_status=$?
  echo ${exit_status}
}

stop_docker_influx(){
   echo "======== Stopping Influxdbv2 Docker ===="
   docker stop ${INFLUX_INSTANCE_NAME}
   docker rm ${INFLUX_INSTANCE_NAME}
}

build_data_module(){
  echo "======== Building Data Module ===="
  pwd
  cd ${PRJ_ROOT}/data || echo "Failed to cd to ${PRJ_ROOT}/data"
  pwd
  yarn build || echo "Failed to build data"
  return_home
}

add_data_module_to_app(){
  echo "======== Adding Data Module to App===="
  cd ${PRJ_ROOT}/app || echo "Failed to cd to ${PRJ_ROOT}/app"
  yarn remove giraffe-cypress-data
  yarn add file:${PRJ_ROOT}/data/ || echo "Failed to add data module"
  return_home
}

add_data_module_to_tests(){
  echo "======== Adding Data Module to Tests ==== "
  cd ${PRJ_ROOT}/tests || echo "Failed to cd to ${PRJ_ROOT}/tests"
  yarn remove giraffe-cypress-data
  yarn add file:${PRJ_ROOT}/data/ || echo "Failed to add data module"
  return_home
}

remove_data_module(){
  echo "======== Removing Data Module from App ===="
  cd ${PRJ_ROOT}/app || echo "Failed to cd to ${PRJ_ROOT}/app"
  yarn remove giraffe-cypress-data
  echo "======== Removing Data Module from Tests ===="
  cd ${PRJ_ROOT}/tests || echo "Failed to cd to ${PRJ_ROOT}/tests"
  yarn remove giraffe-cypress-data
}

reporting_setup(){
  echo "======== Linking Reporting Libraries to Test Module ===="
  if [[ ! -L ${PRJ_ROOT}/tests/node_modules/cypress-multi-reporters ]]; then
    echo "============ Linking Cypress Multi Reporters ===="
    ln -s ${PRJ_ROOT}/node_modules/cypress-multi-reporters ${PRJ_ROOT}/tests/node_modules/cypress-multi-reporters
  else
    echo "======== Cypress Multi Reporters Already Linked ===="
  fi
  if [[ ! -L ${PRJ_ROOT}/tests/node_modules/mochawesome ]]; then
    echo "============ Linking Mochawesome ===="
    ln -s ${PRJ_ROOT}/node_modules/mochawesome ${PRJ_ROOT}/tests/node_modules/mochawesome
  else
    echo "======== Mochawesome Already Linked ===="
  fi
}

return_home(){
   cd ${PRJ_ROOT} || echo "Failed to cd to ${PRJ_ROOT}"
}

usage(){
   echo "usage $0 [command] [options]"
   echo "Setup the Giraffe test application framework"
   echo ""
   echo "Commands:"
   echo "   create    Create the application. Do everything."
   echo "   clean     Clean the application"
   echo "   shutdown  Shutdown the application"
   echo "   start     Start the NextJS application - but not backend"
   echo "   stop      Stop the Nextjs application - but  not backend"
   echo "   restart   Restart the NextJS application - but not backend"
   echo "   data      Rebuild data module    "
   echo "   influx    Reset influx docker backend"
   echo "   reporting Setup linked directories for cypress reporting - used in test scripts"
   echo "   help      Show this message. Default command."
   echo ""
   echo "Options:"
   echo "   -d | --dist    Giraffe distribution to use ('local', local build | 'release', node release)"
   echo "                  default ${DIST}.  "
   echo "                  Note release checks out latest by default.  Unless either -t or -v is specified. "
   echo "   -u | --url     Github URL to Giraffe project.  Default ${GIRAFFE_GITHUB_URL}"
   echo "   -b | --branch  Branch in Giraffe project to test.  Default ${GIRAFFE_GITHUB_BRANCH}"
   echo "   -c | --commit  Build specific commit"
   echo "   -r | --release If release, then which release.  Default ${GIRAFFE_DIST}"
   echo "   -t | --tag     If release, then use this tag.  Default Undefined"
   echo "   -v | --version If release, the use this version. Default Undefined"
   echo "   -m | --mode   Whether to run the framework build in 'dev' or 'prod' (producton) mode "
}

while [ "$1" != "" ]; do
   case $1 in
      create )         ACTION="create"
                       ;;
      clean )          ACTION="clean"
                       ;;
      shutdown )       ACTION="shutdown"
                       ;;
      data )           ACTION="data"
                       ;;
      influx )         ACTION="influx"
                       ;;
      reporting )      ACTION="reporting"
                       ;;
      start )          ACTION="start"
                       ;;
      stop )           ACTION="stop"
                       ;;
      restart )        ACTION="restart"
                       ;;
      help | --help | -h )  ACTION="usage"
                       ;;
      check )          ACTION="check"
                       ;;
      -d | --dist )    shift
                       DIST=$1
                       ;;
      -r | --release ) shift
                       GIRAFFE_DIST=$1
                       ;;
      -u | --url )     shift
                       GIRAFFE_GITHUB_URL=$1
                       ;;
      -b | --branch )  shift
                       GIRAFFE_GITHUB_BRANCH=$1
                       ;;
      -v | --version ) shift
                       GIRAFFE_VERSION=$1
                       ;;
      -t | --tag )     shift
                       GIRAFFE_TAG=$1
                       ;;
      -m | --mode )    shift
                       APP_BUILD=$1
                       ;;
      -c | --commit )  shift
                       COMMIT=$1
                       ;;
      * )              usage
                       exit 1
   esac
   shift
done

echo "DIST $DIST"

check_env

case $ACTION in
   create )      echo "====== Creating App ======"
                 create_app
                 ;;
   clean )       echo "====== Cleaning App ======"
                 remove_giraffe_from_app
                 clean_influx_dir
                 remove_data_module
                 ;;
   shutdown )    kill_next_hard
                 stop_docker_influx
                 ;;
   stop )        kill_next_hard
                 ;;
   start )       start_app
                 ;;
   restart )     kill_next_hard
                 start_app
                 ;;
   influx )      stop_docker_influx
                 run_docker_influx
                 setup_docker_influx
                 ;;
   reporting )   reporting_setup
                 ;;
   data)         build_data_module
                 add_data_module_to_app
                 add_data_module_to_tests
                 ;;
   usage)        usage
                 ;;
   check )       check_env
                 ;;
   * )           echo "Unhandled Action $ACTION"
esac

# TODO clean logs
