import * as DataUtil from 'giraffe-cypress-data'

// @ts-ignore
//const projRootDir = path.dirname(require.main.filename)

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

export const addTimestampToRecs = (recs: string[], timeDif: string) => {
    return cy.wrap(DataUtil.Utils.addTimestampToRecs(recs,timeDif))
}

export const parseLeafletTileSrc = (src: string): Cypress.Chainable => {
    let result: { file: string, index: number, layer: number} = {file: '', index: 0, layer: 0}
    let parts = src.split('/');
    result.file = parts[parts.length - 1];
    result.index = parseInt(parts[parts.length - 2]);
    result.layer = parseInt(parts[parts.length - 3]);

    return cy.wrap(result);
}

// TODO expand to cover other SVG declarations (e.g L, V, H) as needed
export const parseSVGPathD = (d: string): Cypress.Chainable => {
    let result: {moves: string[], arcs: string[] } = {moves: [], arcs: []}
    let parts: string[] = d.split(/([MmAa])/g);

    let moveCt = 0;
    let arcCt = 0;
    parts.shift();
    for(let i = 0; i < parts.length; i += 2){
        switch(parts[i]){
            case 'M':
            case 'm':
                result.moves[moveCt++] = parts[i+1];
                break;
            case 'A':
            case 'a':
                result.arcs[arcCt++] = parts[i+1]
        }
    }

    //cy.task('log', `DEBUG result ${JSON.stringify(result)}`)
    return cy.wrap(result)
}


function recsHaveTimeStamps(recs: string[]){
    let recWithoutStamp = false;
    recs.forEach(rec => {
        if(rec.trim() === ''){
            return;
        }
        let blocks = rec.split(' ');
        if(isNaN(parseInt(blocks[blocks.length - 1]))){
            recWithoutStamp = true;
        }
    })

    return !recWithoutStamp;
}

export const echoValue = (value: any) => {
    return value;
}

/*
*  TODO - add precision.  Currently only 'ms' used.
* */

export const datagenFromLPFixture = (lpFile: string, timeDif?: string) => {
    cy.fixture('influx/influxEnv').then(({url,username,password,org,bucket,token}) => {
       cy.fixture(lpFile).then((contents) => {
           let recs = contents.split('\n');

           if(!recsHaveTimeStamps(recs)){
               if(typeof(timeDif) === 'undefined'){ timeDif = '-30m'; }
               cy.addTimestampToRecs(recs, timeDif as string).then(rs => {
                   DataUtil.Client.writeLP({url: url, token: token, bucket: bucket, org: org},
                       "ms",
                       rs as string[])
               })
           }else{
               cy.echoValue(recs).then((rs: string[]) => {
                   DataUtil.Client.writeLP({url: url, token: token, bucket: bucket, org: org},
                       "ms",
                       rs as string[])
               })
           }
       })
    });
}

Cypress.Commands.add("addTimestampToRecs", addTimestampToRecs);
Cypress.Commands.add("datagenFromLPFixture", datagenFromLPFixture);
Cypress.Commands.add("echoValue", echoValue);
Cypress.Commands.add("parseLeafletTileSrc", parseLeafletTileSrc)
Cypress.Commands.add('parseSVGPathD',parseSVGPathD)

