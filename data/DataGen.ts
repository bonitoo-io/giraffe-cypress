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
let argv = process.argv;
argv.shift();
argv.shift()
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
        default:
            console.error(`Unknown argument ${argv[0]}`);
            process.exit(1);
    }
    argv.shift()
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

    addStaggerTimestampToRecs(lines, '-1800s', interval).then(async (lines) =>{

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

    addTimestampToRecs(lines, '-30m').then(async (lines) =>{

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
