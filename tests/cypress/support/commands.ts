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

export const pan = ( selector: string,
                     start: {x: number, y: number},
                     end: {x: number, y: number},
                     gran: number = 10 )
                    : Cypress.Chainable => {

    cy.log('Called pan() ' + JSON.stringify(start) + " " + JSON.stringify(end));
    let xd = Math.abs(start.x - end.x);
    let yd = Math.abs(start.y - end.y);
    if(xd === 0 && yd === 0){
        cy.log('start and end are same point.  Not panning');
        return cy.get('selector');
    }
    let base = xd >= yd ? xd : yd;
    let xStep = base === xd ? 1 : xd/base;
    let yStep = base === yd ? 1 : yd/base;

  //  cy.log(`DEBUG pan local vars base ${base} xStep ${xStep} yStep ${yStep}`)

    cy.get(selector).trigger('mousedown', start.x, start.y, { which: 1})
    for(let i = 0; i < base; i += gran){
        let x = end.x >= start.x ? start.x - (xStep * i ) : start.x + (xStep * i);
        let y = end.y >= start.y ? start.y - (yStep * i) : start.y + (yStep * i);
   //     cy.log(`DEBUG panning ${i} x: ${x} y: ${y}`)
        cy.get(selector).trigger('mousemove', x, y)
    }

    cy.get(selector).trigger('mouseup', {force: true});

    return cy.get(selector);
}

//coord e.g M260,348
const parseSVGCoordinate = (coord: string): {x: number, y: number} => {
    let result: {x: number, y: number} = {x: 0, y: 0}
    if(coord.charAt(0) === 'M'){
        coord = coord.slice(1)
    }
    let parts = coord.split(',');
    result.x = parseFloat(parts[0]);
    result.y = parseFloat(parts[1]);

    return result;
}

export const calcSVGPointDistance = (m1: string, m2: string): Cypress.Chainable => {
    let result: number = 0;
    let pointM1 = parseSVGCoordinate(m1);
    let pointM2 = parseSVGCoordinate(m2);

    result = Math.sqrt((((pointM1.x - pointM2.x)**2) + ((pointM1.y - pointM2.y)**2)))

    return cy.wrap(result)
}

export const calcElementDistance = (e1: Element, e2: Element): Cypress.Chainable => {
    let p1: {x: number, y: number} = {x: 0, y: 0};
    let p2: {x: number, y: number} = {x: 0, y: 0};
    let p1Rect = e1.getBoundingClientRect();
    let p2Rect = e2.getBoundingClientRect();
    p1.x = p1Rect.x;
    p1.y = p1Rect.y;
    p2.x = p2Rect.x;
    p2.y = p2Rect.y;
    let result = Math.sqrt(((p1.x - p2.x)**2) + ((p1.y - p2.y)**2))
    return cy.wrap(result)
}

export const elementIsInBounds = (container: HTMLElement, elem: HTMLElement) => {
    let containerDims = container.getBoundingClientRect();
    let elemDims = elem.getBoundingClientRect();
    return ! (elemDims.x > (containerDims.x + containerDims.width) ||
        elemDims.x < containerDims.x ||
        elemDims.y > (containerDims.y + containerDims.height) ||
        elemDims.y < containerDims.y)
}

export const calcVisibleElements = (container: JQuery<HTMLElement>,
                                    elems: JQuery<HTMLElement>): Cypress.Chainable => {

    let count = 0;
    for(let i = 0; i < elems.length; i++){
        if(elementIsInBounds(container[0],elems[i])){
            count++
        }
    }
    return cy.wrap(count)
}

export const calcHiddenElements = (container: JQuery<HTMLElement>,
                                   elems: JQuery<HTMLElement>) : Cypress.Chainable => {
    let count = 0;
    for(let i = 0; i < elems.length; i++){
        if(!elementIsInBounds(container[0],elems[i])){
            count++
        }
    }
    return cy.wrap(count)
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
Cypress.Commands.add('calcSVGPointDistance', calcSVGPointDistance)
Cypress.Commands.add('pan', pan)
Cypress.Commands.add('calcElementDistance',calcElementDistance)
Cypress.Commands.add('calcVisibleElements', calcVisibleElements)
Cypress.Commands.add('calcHiddenElements',calcHiddenElements)

