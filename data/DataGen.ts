#!./node_modules/.bin/ts-node

/*
N.B. This script was intended for troubleshooting purposes.

For actual tests use the exported modules

* */

//import {hostname} from 'os';

import {InfluxDB, Point, HttpError} from '@influxdata/influxdb-client'

import {addTimestampToRecsFromFile} from './Utils';
import {query, writeLP, InfluxParams} from './Client'
import * as fs from "fs";

interface Dico {
    [key: string]: string
}

const iVars: Dico = getInfluxEnvars();

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

    /*
    await writeRecords(lines).then(async () => {
        console.log("DEBUG query " + query({url: iVars['INFLUX_URL'],
              token: iVars['INFLUX_TOKEN'],
              org: iVars['INFLUX_ORG']}, "from(bucket: \"qa\")\n" +
            "  |> range(start: -1h)\n" +
            "  |> filter(fn: (r) => r[\"_measurement\"] == \"myGis\")\n" +
            "  |> last()", ["_time", "lon", "lat", "nom"]))
    }); */
    console.log("DEBUG: WROTE RECORDS")
});

