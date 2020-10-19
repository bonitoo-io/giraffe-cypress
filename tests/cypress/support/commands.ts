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

