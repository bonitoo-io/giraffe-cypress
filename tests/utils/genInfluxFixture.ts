#!./node_modules/.bin/ts-node
const fs = require('fs')

//copy data source files to fixtures - to avoid hacking cypress to reach data dirs outside tests module

let files = fs.readdirSync(`${__dirname}/../../data/sources`).filter(fn => fn.endsWith('.lp'))
console.log('------ Copying to fixtures line protocol files: ' + files);

files.forEach(file => {
    try {
        fs.copyFileSync(`${__dirname}/../../data/sources/${file}`,
            `${__dirname}/../cypress/fixtures/${file}`)
    }catch(e){
        console.error(`------ FAILED to copy file ${file}: ${e}`)
    }
})
console.log('------ Line protocol file copy SUCCESS');

console.log('------ Copying influx_env.sh values to fixtures/influxEnv.json');
//copy over env vars into fixture file
let fixtureFile = `${__dirname}/../cypress/fixtures/influxEnv.json`

const data = fs.readFileSync(`${__dirname}/../../scripts/influx_env.sh`, 'utf-8')
const lines = data.split('\n');
let fixture = {};

lines.forEach((line) => {
    if (line.trim().startsWith('export')) {
        let keyVal = line.trim().split(' ')[1].split('=');
        fixture[[keyVal[0].split('_')[1].toLowerCase()] as unknown as string] = keyVal[1];
    }
});

let fixtureOut = JSON.stringify(fixture, null, 2);

fs.writeFile(fixtureFile, fixtureOut, err => {
    if(err){
        console.error(`------ FAILED to write to ${fixtureFile}: ${err}`)
        return
    }else{
        console.log(`------ Fixture file ${fixtureFile} write SUCCESS`)
    }
})
