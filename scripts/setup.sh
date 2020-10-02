#!/bin/bash

PRJ_ROOT="$(dirname "$(dirname "$(readlink -fm "$0")")")"
INFLUX_DIR=influxdata
INFLUX_DIR_ABS="$PRJ_ROOT/$INFLUX_DIR"
GIRAFFE_GITHUB_URL="https://github.com/dubsky/giraffe.git"
GIRAFFE_GITHUB_BRANCH="feat/geo"
ACTION="create"

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

return_home(){
   cd ${PRJ_ROOT}
}

usage(){
   echo "usage $0"
   echo "Setup the Giraffe test application framework"
   echo ""
   echo "create    Create the application"
   echo "clean     Clean the application"
}

while [ "$1" != "" ]; do
   case $1 in
      create )         ACTION="create"
                       ;;
      clean )          ACTION="clean"
                       ;;
      * )              usage
                       exit 1
   esac
   shift
done

# TODO - check whether Giraffe Package is to be from Current Github w. branch e.g. file:/...
# Or whether Giraffe Package is to be the released package - once GeoWidget is released

case $ACTION in
   create )  echo "====== Creating App ======"
             make_influx_dir
             clone_giraffe
             build_giraffe
             add_local_giraffe_to_app
             return_home
             ;;
   clean )   echo "====== Cleaning App ======"
             remove_giraffe_from_app
             clean_influx_dir
             ;;
   * )       echo "Unhandled Action $ACTION"
esac
