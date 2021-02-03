import * as DataUtil from 'giraffe-cypress-data'

export default async function handler(req, res) {

    const oldQuery = `from(bucket: "qa")
        |> range(start: -1h)
        |> filter(fn: (r) => r["_measurement"] == "myGis")
        |> last()
        `

    const testQuery = `from(bucket: "qa")
        |> range(start: -2d)
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

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')

    res.end(JSON.stringify(result));
}
