import * as React from "react";

import {Config, ColumnType, InfluxColors, fromRows, Plot, newTable, Table, GaugeMiniLayerConfig} from '@influxdata/giraffe'

import memoizeOne from "memoize-one";
//import {gaugeMiniTable} from "./GaugeMiniBullet";

const now = Date.now()
const start = now - (10 * 60 * 1000)
const numberOfRecords = 3
const recordsPerLine = 3

let TIME_COL: Array<string>
let VALUE_COL: Array<number>
let FIELD_COL: Array<string>

let droids: Array<string> = ['R2D2', 'C3PO', 'HAL1']

function getRandomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min
}

let steps = 5
let cutoff = 0;

const createColumns = () => {
    TIME_COL = []
    VALUE_COL = []
    FIELD_COL = []
    for (let i = 0; i < steps - cutoff; i += 1) {
        VALUE_COL.push((i + 1) * (99 / steps))
        TIME_COL.push(new Date(start + (i * (10/steps) * 60 * 1000)).toISOString())
        //FIELD_COL.push(gaugeMiniTableGetField(Math.floor(i / numberOfRecords)))
        FIELD_COL.push('charge')
    }

    console.log(`DEBUG TIME_COL ${JSON.stringify(TIME_COL)}`)
}

const gaugeMiniTable = memoizeOne(
    (): Table => {
        createColumns()
        return newTable(steps - cutoff)
            .addColumn('_time', 'string', 'time', TIME_COL)
            .addColumn('_value', 'system', 'number', VALUE_COL)
            .addColumn('_field', 'string', 'string', FIELD_COL)
    }
)


export const PlotContainer = ({children}) => (
    <div
        style={{
            width: '70%',
            height: '100%',
            margin: '50px',
            padding: '10px',
            paddingLeft: '5px',
            paddingTop: '5px',
            border: 'grey 3px solid',
            position: 'relative'
        }}
    >
        {children}
    </div>
)

export const PlotSubContainer = ({children}) => (
    <div id='subcontainer'
         style={{
             width: '95%',
             height: '33%',
             margin: '5px',
             position: 'relative'
         }}
    >
        {children}
    </div>
)


function getDataSubSetByFieldVal(data, field, val){

    let result = [];
    for(let i = 0; i < data.length; i++){
        if(data[i][field] === val){
            result.push(data[i]);
        }
    }

    return result;

}

function GaugeMiniProgress({data, count}) {

    const layer = {
        mode: 'progress',
        barsDefinitions: {
            groupByColumns: {_field: true},
        },
        labelBarsEnabled: true,
        type: 'gauge mini',
    }

    //let table = gaugeMiniTable();
    let table = fromRows(getDataSubSetByFieldVal(data, 'droid', 'C3PO').slice(0,1),
        { _time: 'time', _value: 'number', _field: 'string'})


    const config: Config = {
        //table: fromRows(data),
        table: table,
        layers: [layer as GaugeMiniLayerConfig ],
    }

    const configR2D2: Config = {
        table: fromRows(getDataSubSetByFieldVal(data, 'droid', 'R2D2').slice(0,count + 1),
            { _time: 'time', _value: 'number', _field: 'string'}),
        layers: [{
        mode: 'progress',
        barsDefinitions: {
            groupByColumns: {_field: true},
        },
        labelBarsEnabled: true,
        labelMain: 'R2D2',
        labelMainFontColor: '#000000',
        labelMainFontSize: 32,
        type: 'gauge mini',
        } as GaugeMiniLayerConfig ],
    }

    const configC3PO: Config = {
        table: fromRows(getDataSubSetByFieldVal(data, 'droid', 'C3PO').slice(0,count + 1),
            { _time: 'time', _value: 'number', _field: 'string'}),
        layers: [{
            mode: 'progress',
            barsDefinitions: {
                groupByColumns: {_field: true},
            },
            labelBarsEnabled: true,
            labelMain: 'C3PO',
            labelMainFontColor: '#000000',
            labelMainFontSize: 32,
            type: 'gauge mini',
        } as GaugeMiniLayerConfig ],
    }

    const configHAL9000: Config = {
        table: fromRows(getDataSubSetByFieldVal(data, 'droid', 'HAL9000').slice(0,count + 1),
            { _time: 'time', _value: 'number', _field: 'string'}),
        layers: [{
            mode: 'progress',
            barsDefinitions: {
                groupByColumns: {_field: true},
            },
            labelBarsEnabled: true,
            labelMain: 'HAL9000',
            labelMainFontColor: '#000000',
            labelMainFontSize: 32,
            type: 'gauge mini',
        } as GaugeMiniLayerConfig ],
    }


    return(
        <PlotContainer>
            <PlotSubContainer>
                <Plot config={configR2D2}/>
            </PlotSubContainer>
            <PlotSubContainer>
                <Plot config={configC3PO}/>
            </PlotSubContainer>
            <PlotSubContainer>
                <Plot config={configHAL9000}/>
            </PlotSubContainer>
        </PlotContainer>
    )

}

export default GaugeMiniProgress;
