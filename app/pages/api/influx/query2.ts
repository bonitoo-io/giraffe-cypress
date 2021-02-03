import * as DataUtil from 'giraffe-cypress-data'

export default async function handler(req, res) {

    console.log(`DEBUG called handler `)
    let result = Object.keys(req);
    result = req.query;
    // query fields b = bucket m = measurement s = start fluxq = full query c = columns of interest
    let bucket = req.query.b ? req.query.b : 'qa';
    let meas = req.query.m ? req.query.m : 'myGis';
    let start = req.query.s ? req.query.s : "-2h";
    let filterFields = req.query.filterf ? req.query.filterf : "dur,mag";
    let filterTags = req.query.filtert ? req.query.filtert : "";
    let groupByCols = req.query.groupcol ? req.query.groupcol : filterFields;
    let baseColumns = ['_time'];
    let selectColumns = req.query.selectc ? req.query.selectc : filterFields;
    console.log(`DEBUG selectColumns ${selectColumns}`)
    let columns = baseColumns.concat(selectColumns.split(','))

    let fluxQuery;

    let filterFieldStatement = "  |> filter(fn: (r) => "
    let fFieldArr = filterFields.split(',');

    console.log(`DEBUG fFieldArr ${JSON.stringify(fFieldArr)}`)

    for(let i = 0; i < fFieldArr.length; i++){
        console.log(`DEBUG fFieldArr[${i}] ${fFieldArr[i]}`)
        filterFieldStatement += ` r["_field"] == "${fFieldArr[i]}" `
        if(fFieldArr[i+1]){
            filterFieldStatement += ` or `
        }else{
            filterFieldStatement += `)`
        }
    }

    let filterTagStatements = []

    if(filterTags.length > 0){
        let fTagArr = filterTags.split(',')

        console.log(`fTagArr ${fTagArr}`);

        for(let i = 0; i < fTagArr.length; i++){
            let tagPair = fTagArr[i].split(':');
            filterTagStatements.push(`  |> filter(fn: (r) => r["${tagPair[0]}"] == "${tagPair[1]}")`)
            columns.push(tagPair[0]);
            groupByCols += `,${tagPair[0]}`
        }

        console.log(`DEBUG filterTagStatement\n ${filterTagStatements.join('\n')}`)
    }

    console.log(`DEBUG filterFieldStatemet ${filterFieldStatement}`)

    result['columns'] = columns

    let groupByStatement = ''

    console.log(`DEBUG groupByCols ${groupByCols}`)

    if(groupByCols.length > 0){
        let cols=groupByCols.split(',')
        groupByStatement = '  |> group(columns: ['
        for(let i = 0; i < cols.length; i++){
            groupByStatement += `"${cols[i]}"`
            if(cols[i+1]){
                groupByStatement += ", "
            }
        }
        groupByStatement += "], mode:\"by\")\n";
        console.log(`DEBUG groupByStatement ${groupByStatement}`)
    }

    /* N.B. when using fluxq in req.query be sure to add selectc
       otherwise the default _time,dur,mag will be used
       and if the data set has no dur or mag fields only timestamps
       will be returned
    * */
    if(req.query.fluxq){
        fluxQuery = req.query.fluxq
    }else{

        fluxQuery = `from(bucket: \"${bucket}\")\n` +
            `  |> range(start: ${start})\n` +
            `  |> filter(fn: (r) => r["_measurement"] == "${meas}")\n` +
            filterFieldStatement + '\n';

        if(filterTagStatements.length > 0){
            fluxQuery += filterTagStatements.join('\n')
        }

        if(groupByStatement.length > 0){
            fluxQuery += '\n' + groupByStatement;
        }

        fluxQuery += "  |> pivot(rowKey:[\"_time\"], columnKey: [\"_field\"], valueColumn: \"_value\")"
    }

    console.log(`DEBUG fluxQuery ${fluxQuery}`)


    let fluxRes = await DataUtil.Client.query({url: process.env.INFLUX_URL,
        token: process.env.INFLUX_TOKEN,
        org: process.env.INFLUX_ORG}, fluxQuery,columns)


    console.log(`DATE ${new Date()}`)
    console.log(result)
    console.log(`flux result: \n${JSON.stringify(fluxRes)}`)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(fluxRes));
}
