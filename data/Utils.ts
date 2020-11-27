import * as fs from 'fs';

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

interface TimeExpr {
    measure: number,
    unit: "s" | "ms" | "us" | "ns" | "m" | "h" | "d"
}

function parseTime(timeString: string){
    let result: TimeExpr = {measure: 0, unit: 's'};
    let range: string[] = timeString.match(/[-]?[0-9]*/)
    result.measure = parseInt(range.toString());
    let domain = timeString.match(/[mnus].*/).toString()
    // @ts-ignore
    result.unit = domain;
    return result;
}

/*assume number in ms*/
function calcTimeStamp(unit: string, prec: string, base: number){
    let msBase: number = 0;
    let now = new Date().getTime();

    switch(unit){
        case "s":
            msBase = base * second;
            break
        case "m":
            msBase = base * minute
            break
        case "h":
            msBase = base * hour;
            break;
        case "d":
            msBase = base * day;
            break;
        default:
            throw `Unhandled time unit ${unit}`
    }

    switch(prec){
        case "s":
            return (now / 1000) + (msBase / 1000);
        case "ms":
            return now + msBase;
        case "us":
            return (now * 1000) + (msBase * 1000);
        case "ns":
            return (now * 1000 * 1000 ) + (msBase * 1000 * 1000);
        default:
            throw `unhandled time precision definition ${prec}`
    }
}

export async function addTimestampToRecsFromFile(filePath: string, timeDif: string) {
    const data = fs.readFileSync(filePath, 'utf-8');
    const lines = data.split('\n');
    const now = new Date().getTime();
    let timeFrame: TimeExpr = parseTime(timeDif);

    //Todo use calcTime above
    let timeStamp = calcTimeStamp(timeFrame.unit, "ms", timeFrame.measure);
    let result: string[] = [];

    lines.forEach((line) => {
        if (line.trim().length > 0) {
            result.push(line + " " + timeStamp);
        }
    })

    return result;
}

// noinspection DuplicatedCode
export async function addTimestampToRecs(recs: string[], timeDif: string){

    let timeFrame: TimeExpr = parseTime(timeDif);
    let timeStamp = calcTimeStamp(timeFrame.unit, "ms", timeFrame.measure);
    let result: string[] = [];

    recs.forEach((line) => {
        if (line.trim().length > 0) {
            result.push(line + " " + timeStamp);
        }
    })

    return result;

}

export async function addStaggerTimestampToRecs(recs: string[], timeDif: string, stagger: string){

    let result: string[] = []

    for(let i = 0; i < recs.length; i++){
        let timeFrame: TimeExpr = parseTime(timeDif);
        let staggerFrame: TimeExpr = parseTime(stagger);
        if(timeFrame.unit !== staggerFrame.unit){
            throw (`Time units do not match: ${timeFrame.unit} !== ${staggerFrame.unit}`)
        }
        if(recs[i].match(/.* .*/)){
            let timeStamp = calcTimeStamp(timeFrame.unit, "ms", timeFrame.measure + (staggerFrame.measure * i))
            result.push(recs[i] + " " + timeStamp);
        }
    }
    return result;
}







