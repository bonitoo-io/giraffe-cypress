import * as React from "react";

import {Config, fromRows, Plot, newTable, Table} from '@influxdata/giraffe'



import memoizeOne from "memoize-one";

const now = Date.now()
const numberOfRecords = 20
const recordsPerLine = 20

let TIME_COL: Array<number>
let VALUE_COL: Array<number>
let FIELD_COL: Array<string>

function getRandomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min
}
const createColumns = (minValue: number, maxValue: number, fields: number) => {
    TIME_COL = []
    VALUE_COL = []
    FIELD_COL = []
    for (let i = 0; i < numberOfRecords * fields; i += 1) {
        VALUE_COL.push(getRandomNumber(minValue, maxValue))
        TIME_COL.push(now + ((i % recordsPerLine) % fields) * 1000 * 60)
        FIELD_COL.push(gaugeMiniTableGetField(Math.floor(i / numberOfRecords)))
    }
}

/** return field name for given index */
export const gaugeMiniTableGetField = (i: number) => `_field_${i}`

export const gaugeMiniTable = memoizeOne(
    (minValue: number, maxValue: number, fields: number): Table => {
        createColumns(minValue, maxValue, fields)
        return newTable(numberOfRecords * fields)
            .addColumn('_time', 'dateTime:RFC3339', 'time', TIME_COL)
            .addColumn('_value', 'system', 'number', VALUE_COL)
            .addColumn('_field', 'string', 'string', FIELD_COL)
    }
)

// @ts-ignore
export const PlotContainer = ({children}) => (
    <div
        style={{
            width: '100%',
            height: '100%',
            margin: '50px',
            padding: '10px',
            paddingLeft: '5px',
            paddingTop: '5px',
            border: 'grey 3px solid',
        }}
    >
        {children}
    </div>
)

// @ts-check

function GaugeMini({data}) {

    const numberOfBars = 5

    const layer = {
        barsDefinitions: {
            groupByColumns: {_field: true},
        },
        type: 'gauge mini',
    }

    const config: Config = {
        //table: fromRows(data),
        table: gaugeMiniTable(0, 100, numberOfBars),
        layers: [layer as any],
    }

    return (
        <PlotContainer>
            <Plot config={config}/>
        </PlotContainer>
    )

/*
    return (
        <div></div>
    )


 */
}

export default GaugeMini;
