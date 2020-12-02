import * as DataUtil from 'giraffe-cypress-data'

export default async function handler(req, res) {

    /*
    import "experimental/geo"
from(bucket: "qa")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "voieGis")
  |> geo.toRows()
  |> geo.asTracks(groupBy: ["ligne"], orderBy: ["_time"])
     */

    let columns = ["_time","ligne","st","cl","lon","lat","nom","mag","dur"];
    //let columns = ["_time","lon","lat","ligne", "st", "mag", "dur"];

    const testQuery = "import \"experimental/geo\"\n" +
        "from(bucket: \"qa\")\n" +
        "  |> range(start: -2h)\n" +
        "  |> filter(fn: (r) => r[\"_measurement\"] == \"voieGis\")\n" +
        "  |> geo.toRows()\n" +
        "  |> geo.asTracks(groupBy: [\"ligne\"], orderBy: [\"_time\"])"

    let result = await DataUtil.Client.query({url: process.env.INFLUX_URL,
        token: process.env.INFLUX_TOKEN,
        org: process.env.INFLUX_ORG},testQuery,columns)


/* */

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result));

}
