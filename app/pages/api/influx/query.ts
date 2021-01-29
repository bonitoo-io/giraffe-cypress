import * as DataUtil from 'giraffe-cypress-data'
import { fromRows, Table } from '@influxdata/giraffe'


export const fetchQuery = async (queryType: API_GET_PARAM_TEST_TYPE_VALUES) => {
    const res = await fetch(`http://localhost:3000/api/influx/query?${API_GET_PARAM_TEST_TYPE_KEY}=${queryType}`)
    const data = await res.json();
    return data;
}

export const API_GET_PARAM_TEST_TYPE_KEY = "test_type"

export enum API_GET_PARAM_TEST_TYPE_VALUES {
    gauge_mini = 'gauge_mini',
    simple_heat_map = 'simple_heat_map',
}

const handleAction = async (action: API_GET_PARAM_TEST_TYPE_VALUES) => {

    const oldQuery = `from(bucket: "qa")
        |> range(start: -1h)
        |> filter(fn: (r) => r["_measurement"] == "myGis")
        |> last()
        `

    const testQuery = `from(bucket: "qa")" +
        |> range(start: -2d)
        |> filter(fn: (r) => r["_measurement"] == "myGis")
        |> filter(fn: (r) => r["_field"] == "dur" or r["_field"] == "mag")
        |> last()
        |> group(columns: ["lat", "lon", "nom"], mode:"by")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        `

    const minigaugeQuery = `from(bucket: "qa")
        |> range(start: -2h)
        |> filter(fn: (r) => r["_measurement"] == "myGis")
        |> filter(fn: (r) => r["_field"] == "dur" or r["_field"] == "mag")
        |> last()
        |> group(columns: ["lat", "lon", "nom"], mode:"by")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        `

    let result = await DataUtil.Client.query({
        url: process.env.INFLUX_URL,
        token: process.env.INFLUX_TOKEN,
        org: process.env.INFLUX_ORG
    }, testQuery, ["_time", "lon", "lat", "nom", "mag", "dur"])
    /*
    .then((result) => {
    console.log("DEBUG query:  " + result)

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
        name: process.env.INFLUX_USERNAME,
        token: process.env.INFLUX_TOKEN,
        url: process.env.INFLUX_URL}))

})
*/

    console.log("DEBUG result " + result);
    //let testTable : Table = fromRows(result)

    console.log("DEBUG Called handler")


    switch (action as API_GET_PARAM_TEST_TYPE_VALUES) {
        case API_GET_PARAM_TEST_TYPE_VALUES.gauge_mini:
            return "gauge";
        case API_GET_PARAM_TEST_TYPE_VALUES.simple_heat_map:
            return result
        default:
            return "bad request"
    }

}



export default async function handler(req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    /*
    res.end(JSON.stringify({
        name: process.env.INFLUX_USERNAME,
        token: process.env.INFLUX_TOKEN,
        url: process.env.INFLUX_URL,
        result: result}))*/
    // res.end(JSON.stringify(result));

    const actionResponse = await handleAction(req.query[API_GET_PARAM_TEST_TYPE_KEY]);
    res.end(JSON.stringify(actionResponse));
}