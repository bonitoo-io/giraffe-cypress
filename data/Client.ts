import {InfluxDB, FluxTableMetaData, Point, HttpError} from '@influxdata/influxdb-client';

interface InfluxParams {
    url: string,
    token: string,
    org: string
}

interface Dico {
    [k:string]: string
}

export async function query(connect: InfluxParams, fluxQuery: string, cols: string[]) {

    const queryApi = new InfluxDB({
        url: connect.url,
        token: connect.token
    }).getQueryApi(connect.org)

    console.log('*** QUERY LINES ***')

    //TODO make result object array
    let result : Dico[] = [];

    /*
    cols.forEach((col) => { result += `${col} `})
    result += '\n';
    */
    return new Promise((resolve, reject) => {
        queryApi.queryRows(fluxQuery, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                let line: Dico = {}
                cols.forEach((col) => {line[col] = o[col] })
                console.log(`DEBUG QRR: ${JSON.stringify(line)}`)
                //result += `${line}\n`;
                result.push(line)
            },
            error(e) {
                console.error(e)
                console.log('Finished ERROR')
                reject(e)
            }, complete() {
                console.log('Finished SUCCESS')
                resolve(result);
            }
        })
    })
}
