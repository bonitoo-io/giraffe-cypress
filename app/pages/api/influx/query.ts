import * as DataUtil from 'giraffe-cypress-data'
import {fromRows, Table} from '@influxdata/giraffe'

export default async function handler(req, res) {

    console.log("DEBUG Called handler")

    const oldQuery = "from(bucket: \"qa\")\n" +
        "  |> range(start: -1h)\n" +
        "  |> filter(fn: (r) => r[\"_measurement\"] == \"myGis\")\n" +
        "  |> last()"

    const testQuery = "from(bucket: \"qa\")\n" +
        "  |> range(start: -2h)\n" +
        "  |> filter(fn: (r) => r[\"_measurement\"] == \"myGis\")\n" +
        "  |> filter(fn: (r) => r[\"_field\"] == \"dur\" or r[\"_field\"] == \"mag\")  \n" +
        "  |> last()\n" +
        "  |> group(columns: [\"lat\", \"lon\", \"nom\"], mode:\"by\")\n" +
        "  |> pivot(rowKey:[\"_time\"], columnKey: [\"_field\"], valueColumn: \"_value\")"

    let result = await DataUtil.Client.query({url: process.env.INFLUX_URL,
            token: process.env.INFLUX_TOKEN,
            org: process.env.INFLUX_ORG},testQuery,["_time","lon","lat","nom","mag","dur"])
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

    //console.log("DEBUG result " + result);
    //let testTable : Table = fromRows(result)


    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    /*
    res.end(JSON.stringify({
        name: process.env.INFLUX_USERNAME,
        token: process.env.INFLUX_TOKEN,
        url: process.env.INFLUX_URL,
        result: result}))*/
    res.end(JSON.stringify(result));

    //res.end({});
}
