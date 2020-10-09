#!./node_modules/.bin/ts-node

import {hostname} from 'os';

import {InfluxDB, Point, HttpError} from '@influxdata/influxdb-client'

import {getIVars, addTimestampToRecsFromFile} from './Utils';
import {query} from './Client'

const iVars = getIVars();

async function writeRecords(recs: string[]){
    console.log('*** WRITE RECORDS ***')
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
    await writeRecords(lines).then(async () => {
        console.log("DEBUG query " + query({url: iVars['INFLUX_URL'],
              token: iVars['INFLUX_TOKEN'],
              org: iVars['INFLUX_ORG']}, "from(bucket: \"qa\")\n" +
            "  |> range(start: -1h)\n" +
            "  |> filter(fn: (r) => r[\"_measurement\"] == \"myGis\")\n" +
            "  |> last()", ["_time", "lon", "lat", "nom"]))
    });
    console.log("DEBUG: WROTE RECORDS")
});

