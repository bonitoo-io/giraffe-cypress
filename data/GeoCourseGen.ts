#!./node_modules/.bin/ts-node

import * as Utils from './Utils';
import * as fs from "fs";

let argv = process.argv;

let start: Utils.GeoPoint = {latDecDeg: -1000, lonDecDeg: -1000}
let dest: Utils.GeoPoint = {latDecDeg: -1000, lonDecDeg: -1000}
let ofilePath = ''
let stepDegrees = 10;
let id = 'geoQA'

argv.shift();
argv.shift()
if(argv.length === 0){
    usage()
    process.exit(0)
}
while(argv.length > 0) {
    switch (argv[0]) {
        case '-slat':
            argv.shift();
            start.latDecDeg = parseFloat(argv[0]);
            break;
        case '-slon':
            argv.shift();
            start.lonDecDeg = parseFloat(argv[0]);
            break;
        case '-dlat':
            argv.shift();
            dest.latDecDeg = parseFloat(argv[0]);
            break;
        case '-dlon':
            argv.shift();
            dest.lonDecDeg = parseFloat(argv[0]);
            break;
        case '-step':
            argv.shift();
            stepDegrees = parseFloat(argv[0]);
            break;
        case '-o':
            argv.shift();
            ofilePath = argv[0];
            break;
        case '-id':
            argv.shift();
            id = argv[0]
            break;
        default:
            console.error(`Unkown argument ${argv[0]}`)
            usage();
            process.exit(1);
    }
    argv.shift()
}

if(start.latDecDeg > 90.0 || start.latDecDeg < -90.0){
    console.log('\n-slat is invalid or was not defined.\n')
    usage();
    process.exit(1);
}

if(start.lonDecDeg > 360.0 || start.lonDecDeg < -360.0){
    console.log('\n-slon is invalid or was not defined.\n')
    usage();
    process.exit(1);
}
if(dest.latDecDeg > 90.0 || dest.latDecDeg < -90.0){
    console.log('\n-dlat is invalid or was not defined.\n')
    usage();
    process.exit(1);
}
if(dest.lonDecDeg > 360.0 || dest.lonDecDeg < -360.0){
    console.log('\n-dlon is invalid or was not defined.\n')
    usage();
    process.exit(1);
}

function usage(){
    console.log('GeoCourseGen.ts -slat [decDeg] -slon [decDeg] -dlat [decDeg] -dLon [decDeg] -o [Filename]')
    console.log('\nGenerates preliminary line protocol data points on a great circle into a file.');
    console.log('Preliminary means data points are without time stamps.');
    console.log('Time stamps can be later added with test utils or even AWK.');
    console.log('For testing purposes\n');
    console.log('   -slat  - starting latitude')
    console.log('   -slon  - starting longitude')
    console.log('   -dlat  - destination latitude')
    console.log('   -dlon  - destination longitude')
    console.log('   -step  - step in degrees longitude between waypoints (default 10)')
    console.log('   -o     - output file for line protocol data, if omitted data is written to STDOUT');
    console.log('')
}


let gcCourseLP = Utils.greatCircleCourseLineProtocol(start,dest,stepDegrees,
    [{key: 'id', vals: [id]}],
    [{key: 'mag', val: () => {return (Math.random() * 100).toFixed(2)}},
        {key: 'dur', val: () => {return (10.0 + (Math.random() * 50)).toFixed(3)}}])


let recBuf = '';
for(let i = 0; i < gcCourseLP.length; i++){
    recBuf += gcCourseLP[i];
    if(gcCourseLP[i+1]){
        recBuf += '\n';
    }
}

if(!ofilePath || ofilePath.length < 1){
    console.log(recBuf)
}else{

    try {
        fs.writeFileSync(ofilePath, recBuf)
        console.log(`Generated ${gcCourseLP.length} preliminary data points to ${ofilePath}.`)
    }catch(err){
        console.error(err)
    }
}

