#!./node_modules/.bin/ts-node

import {InfluxDB, FluxTableMetaData, Point, HttpError} from '@influxdata/influxdb-client';

import * as fs from 'fs';

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

interface Dico {
    [key: string]: string
}

const iVars: Dico = getInfluxEnvars();

export function getIVars() {
    return iVars;
}

export function getIVar(key: string){
    return iVars[key];
}

console.log("DEBUG iVars " + JSON.stringify(iVars));

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

export async function addTimestampToRecsFromFile(filePath: string, timeDif: string) {
    const data = fs.readFileSync(filePath, 'utf-8');
    const lines = data.split('\n');
    const now = new Date().getTime();

    let timeStamp = now - (30 * minute);
    let result: string[] = [];

    lines.forEach((line) => {
        if (line.trim().length > 0) {
            result.push(line + " " + timeStamp);
        }
    })

    return result;
}





