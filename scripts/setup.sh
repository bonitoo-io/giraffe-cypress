#!/bin/bash

PRJ_ROOT="$(dirname "$(dirname "$(readlink -fm "$0")")")"
INFLUX_DIR=influxdata
INFLUX_DIR_ABS="$PRJ_ROOT/$INFLUX_DIR"
GIRAFFE_GITHUB_URL="https://github.com/dubsky/giraffe.git"
GIRAFFE_GITHUB_BRANCH="feat/geo"
GIRAFFE_DIST="@influxdata/giraffe"
GIRAFFE_VERSION=""
GIRAFFE_TAG=""
ACTION="create"
# TYPE can be "build" - e.g. from local build or "release" - e.g. official distribution
DIST="local"
# TYPE can be "dev" or "prod" e.g. production
APP_BUILD="dev"

#mkdir -p "$PRJ_ROOT/$INFLUX_DIR"

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
   cd $PRJ_ROOT
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
     cd ${INFLUX_DIR_ABS}/giraffe/giraffe
     git checkout $GIRAFFE_GITHUB_BRANCH
     yarn
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
  cd ${PRJ_ROOT}/app
  yarn remove "@influxdata/giraffe"

}

add_local_giraffe_to_app(){

  echo "======== Adding Giraffe to Project ===="
  if [[ -d $INFLUX_DIR_ABS/giraffe/giraffe/dist ]]; then
     cd ${PRJ_ROOT}/app
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

     cd ${PRJ_ROOT}/app
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

   #TODO install influxdb OSS from nightly

   cd ${PRJ_ROOT}/app

   if [[ "${APP_BUILD}" = "dev" ]]; then
       echo "======== Running in Dev Mode ===="
       yarn dev 2>&1 > ${PRJ_ROOT}/app/next.log &
       echo $!
   elif [[  "${APP_BUILD}" = "prod" ]]; then
       echo "======== Running in Production Mode ===="

       yarn build
       #TODO run in background - see if hard kill works here too
       yarn start
   fi

}

kill_next_hard(){
# TODO find better way to manage next server shutdown
   sleep 3
   LINE=$(ps -x | grep node.*next)
   NEXT_PID=$(ps -x | grep node.*next | awk '{ print $1; }' | head -n 1)
   #NEXT_PID=$(ps -x | grep node.*next | awk '{ print $1; }' )
   echo NEXT_PID ${NEXT_PID}
   echo LINE ${LINE}
   sleep 27
   kill ${NEXT_PID}
}

return_home(){
   cd ${PRJ_ROOT}
}

usage(){
   echo "usage $0 [command] [options]"
   echo "Setup the Giraffe test application framework"
   echo ""
   echo "Commands:"
   echo "   create    Create the application. Default command."
   echo "   clean     Clean the application"
   echo ""
   echo "Options:"
   echo "   -d | --dist    Giraffe distribution to use ('local', local build | 'release', node release)"
   echo "                  default ${DIST}.  "
   echo "                  Note release checks out latest by default.  Unless either -t or -v is specified. "
   echo "   -u | --url     Github URL to Giraffe project.  Default ${GIRAFFE_GITHUB_URL}"
   echo "   -b | --branch  Branch in Giraffe project to test.  Default ${GIRAFFE_GITHUB_BRANCH}"
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
      * )              usage
                       exit 1
   esac
   shift
done

echo "DIST $DIST"

# TODO - check whether Giraffe Package is to be from Current Github w. branch e.g. file:/...
# Or whether Giraffe Package is to be the released package - once GeoWidget is released

case $ACTION in
   create )      echo "====== Creating App ======"
                 create_app
                 ;;
   clean )       echo "====== Cleaning App ======"
                 remove_giraffe_from_app
                 clean_influx_dir
                 ;;
   * )           echo "Unhandled Action $ACTION"
esac
