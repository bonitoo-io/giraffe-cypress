#!./node_modules/.bin/ts-node

/*
N.B. This script was intended for troubleshooting purposes.

For actual tests use the exported modules

* */

//import {hostname} from 'os';

import {InfluxDB, Point, HttpError} from '@influxdata/influxdb-client'

import {addTimestampToRecs, addStaggerTimestampToRecs} from './Utils';
import {query, writeLP, InfluxParams} from './Client'
import * as fs from "fs";

interface Dico {
    [key: string]: string
}

const iVars: Dico = getInfluxEnvars();
let sourceFile = 'sources/futuroscope01.lp'
let interval = "";
let timeDif = "-0s";
let argv = process.argv;
argv.shift();
argv.shift()
if(argv.length === 0){
    usage();
    process.exit(0)
}
while(argv.length > 0){
    switch(argv[0]){
        case '-s':
        case '--source':
            argv.shift();
            sourceFile = argv[0];
            break;
        case '-i':
        case '--interval':
            argv.shift();
            interval = argv[0]
            break;
        case '-t':
        case '--timedif':
            argv.shift();
            timeDif = argv[0]
            break;
        default:
            console.error(`Unknown argument ${argv[0]}\n`);
            usage();
            process.exit(1);
    }
    argv.shift()
}

function usage(){
    console.log('\nDataGen.ts -s [sourcefile] --timeDif [TimeDifference] --interval [TimeInterval]')
    console.log('')
    console.log('The purpose of DataGen.ts is to add the timestamps and write the data from a sourcefile to an influxdb bucket')
    console.log('Influxdb connect properties are read from ../scripts/influx_env.sh')
    console.log('\nparameters:\n')
    console.log('  -s|--source     - source file containing preliminary line protocol data')
    console.log('  -t|--timedif    - time difference from now from when to start writing data e.g. -1440m')
    console.log('  -i|--interval   - time interval between data points, e.g. 40m')
    console.log('')
    console.log('Preliminary line protocol data is line protocol data missing final timestamps.')
}

export function getIVar(key: string){
    return iVars[key];
}

console.log("DEBUG iVars " + JSON.stringify(iVars));

/*
* get Influx variables from the same source as the setup script
 */
function getInfluxEnvars() {

    const data = fs.readFileSync(`${__dirname}/../scripts/influx_env.sh`, 'utf-8')
    const lines = data.split('\n');
    let result: Dico = {};

    let count = 0;
    lines.forEach((line) => {
        if (line.trim().startsWith('export')) {
            let keyVal = line.trim().split(' ')[1].split('=');
            result[keyVal[0]] = keyVal[1];

        }
    });

    return result;

}

const dbParams: InfluxParams = {
    url: iVars['INFLUX_URL'],
    token: iVars['INFLUX_TOKEN'],
    org: iVars['INFLUX_ORG'],
    bucket: iVars['INFLUX_BUCKET']
}

async function writeRecords(recs: string[]){
    console.log('*** WRITE RECORDS ***')
    console.log('DEBUG process.cwd() ' + process.cwd())
    const writeApi = new InfluxDB({url: iVars['INFLUX_URL'], token: iVars.INFLUX_TOKEN})
        .getWriteApi(iVars.INFLUX_ORG, iVars.INFLUX_BUCKET, 'ms')

    writeApi.writeRecords(recs);

    await writeApi
        .close()
        .then(()=> {
            console.log('Wrote recs:\n' + recs);
        })
        .catch((e) => {
            console.error(e)
            console.log('\nFinished ERROR')
        })
}

const data = fs.readFileSync(`${__dirname}/${sourceFile}`, 'utf-8');
const lines = data.split('\n');

if(interval.length !== 0){

    if(timeDif === '-0s'){timeDif = '-1800s'}
    addStaggerTimestampToRecs(lines, timeDif, interval).then(async (lines) =>{

        lines.forEach((line) => {
            console.log("DEBUG line: " + line);
        });

        await writeLP(dbParams, "ms", lines).then(async () => {
            console.log("DEBUG query " + JSON.stringify(await query({url: iVars['INFLUX_URL'],
                token: iVars['INFLUX_TOKEN'],
                org: iVars['INFLUX_ORG']}, "from(bucket: \"qa\")\n" +
                "  |> range(start: -1h)\n" +
                "  |> filter(fn: (r) => r[\"_measurement\"] == \"myGis\")\n" +
                "  |> last()", ["_time", "lon", "lat", "nom"])))
        }).catch(err => {
            console.error("CAUGHT ERROR: " + err)
        });

    });
}else{

    if(timeDif === '-0s'){timeDif = '-30m'}
    addTimestampToRecs(lines, timeDif).then(async (lines) =>{

        lines.forEach((line) => {
            console.log("DEBUG line: " + line);
        });

        await writeLP(dbParams, "ms", lines).then(async () => {
            console.log("DEBUG query " + JSON.stringify(await query({url: iVars['INFLUX_URL'],
                token: iVars['INFLUX_TOKEN'],
                org: iVars['INFLUX_ORG']}, "from(bucket: \"qa\")\n" +
                "  |> range(start: -1h)\n" +
                "  |> filter(fn: (r) => r[\"_measurement\"] == \"myGis\")\n" +
                "  |> last()", ["_time", "lon", "lat", "nom"])))
        }).catch(err => {
            console.error("CAUGHT ERROR: " + err)
        });

    });

}


/*
addTimestampToRecsFromFile(`${__dirname}/sources/futuroscope01.lp`, '-30m')
    .then(async (lines) => {
    lines.forEach((line) => {
        console.log("DEBUG line: " + line);
    });

    await writeLP(dbParams, "ms", lines).then(async () => {
        console.log("DEBUG query " + JSON.stringify(await query({url: iVars['INFLUX_URL'],
            token: iVars['INFLUX_TOKEN'],
            org: iVars['INFLUX_ORG']}, "from(bucket: \"qa\")\n" +
            "  |> range(start: -1h)\n" +
            "  |> filter(fn: (r) => r[\"_measurement\"] == \"myGis\")\n" +
            "  |> last()", ["_time", "lon", "lat", "nom"])))
    }).catch(err => {
        console.error("CAUGHT ERROR: " + err)
    });

    *//*
    await writeRecords(lines).then(async () => {
        console.log("DEBUG query " + query({url: iVars['INFLUX_URL'],
              token: iVars['INFLUX_TOKEN'],
              org: iVars['INFLUX_ORG']}, "from(bucket: \"qa\")\n" +
            "  |> range(start: -1h)\n" +
            "  |> filter(fn: (r) => r[\"_measurement\"] == \"myGis\")\n" +
            "  |> last()", ["_time", "lon", "lat", "nom"]))
    }); *//*
    console.log("DEBUG: WROTE RECORDS")
});

*/
