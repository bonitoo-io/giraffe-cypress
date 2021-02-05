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
        valueFontColorOutside: "#eeee44",
        valueFontColorInside: InfluxColors.DeepPurple,
        labelBarsEnabled: true,
        labelMain: 'R2D2',
        labelMainFontColor: '#000000',
        labelMainFontSize: 32,
        axesSteps: undefined,
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
            gaugeMiniColors: [
                {value: 0, type: 'min', hex: "#ff4444"} as any,
                {value: 25, type: 'threshold', hex: "#ff6666"},
                {value: 50, type: 'threshold', hex: "#ffcc55"},
                {value: 75, type: 'threshold', hex: "#99ff66"},
                {value: 90, type: 'threshold', hex: "#44ff66"},
                {value: 100, type: 'max', hex: "#44ff88"},
            ],
            valueFontColorInside: "#0000FF",
            valueFontColorOutside: "#88ccFF",
            type: 'gauge mini',
            axesFontColor: '#FF4444',
            gaugeRounding: 10,
            valueRounding: 10
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
            gaugeMiniColors: [
                {value: 0, type: 'min', hex: "#222222"} as any,
                {value: 25, type: 'threshold', hex: "#555555"},
                {value: 50, type: 'threshold', hex: "#888888"},
                {value: 70, type: 'threshold', hex: "#aaaaaa"},
                {value: 90, type: 'threshold', hex: "#ffffff"},
                {value: 100, type: 'max', hex: "#ffffff"},
            ],
            valueFontColorInside: "#000000",
            valueFontColorOutside: "#cccccc",
            textMode: 'left',
            axesSteps: 1,
            axesFontColor: '#000000',
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
