import * as React from "react";

import {Config, ColumnType, InfluxColors, fromRows, Plot, newTable, Table, GaugeMiniLayerConfig} from '@influxdata/giraffe'

import memoizeOne from "memoize-one";

const now = Date.now()
const numberOfRecords = 3
const recordsPerLine = 3

let TIME_COL: Array<string>
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
        TIME_COL.push(new Date(now + ((i % recordsPerLine) % fields) * 1000 * 60).toISOString())
        //FIELD_COL.push(gaugeMiniTableGetField(Math.floor(i / numberOfRecords)))
        FIELD_COL.push('temperature')
    }
}

/** return field name for given index */
export const gaugeMiniTableGetField = (i: number) => `_field_${i}`

const gaugeMiniTable = memoizeOne(
    (minValue: number, maxValue: number, fields: number): Table => {
        createColumns(minValue, maxValue, fields)
        return newTable(numberOfRecords * fields)
            .addColumn('_time', 'string', 'time', TIME_COL)
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

// @ts-check

function getDataSubSetByFieldVal(data, field, val){

    let result = [];
    for(let i = 0; i < data.length; i++){
        if(data[i][field] === val){
            result.push(data[i]);
        }
    }

    return result;

}

function GaugeMiniBullet({data}) {

    const numberOfBars = 1

    console.log("DEBUG GaugeMini data " + JSON.stringify(data))
    console.log("DEBUG data.slice " + JSON.stringify(getDataSubSetByFieldVal(data,'location', 'de')));
    console.log("DEBUG fromRows(data) " + JSON.stringify(fromRows(data)))
    console.log("DEBUG gaugeMiniTable " + JSON.stringify(gaugeMiniTable(0, 100, numberOfBars)))

    const layer = {
        barsDefinitions: {
            groupByColumns: {_field: true},
        },
        type: 'gauge mini',
    }

    const config: Config = {
        //table: fromRows(data),
        table: gaugeMiniTable(0, 100, numberOfBars),
        layers: [layer as GaugeMiniLayerConfig ],
    }

    let thresholdColors = [
        {value: -30, type: 'min', hex: InfluxColors.Hydrogen} as any,
        {value: 0, type: 'threshold', hex: InfluxColors.Rainforest},
        {value: 40, type: 'threshold', hex: InfluxColors.Sulfur},
        {value: 90, type: 'threshold', hex: InfluxColors.Topaz},
        {value: 150, type: 'max', hex: InfluxColors.Topaz},
    ];

    const testConfigCZ: Config = {
        table: fromRows(getDataSubSetByFieldVal(data, 'location', 'cz'), { _time: 'time', _value: 'number', _field: 'string'}),
        layers: [{
            type: 'gauge mini',
            barsDefinitions: {
                groupByColumns: {_field: true},
            },
            gaugeMiniColors: thresholdColors,
            labelMain: 'cz',
            labelMainFontColor: '#000000',
            labelMainFontSize: 32,
            labelBarsEnabled: true,
            labelBarsFontSize: 14,
            labelBarsFontColor: '#880088'
        } as GaugeMiniLayerConfig]
    }

    const testConfigSK: Config = {
        table: fromRows(getDataSubSetByFieldVal(data, 'location', 'sk'), { _time: 'time', _value: 'number', _field: 'string'}),
        layers: [{
            type: 'gauge mini',
            barsDefinitions: {
                groupByColumns: {_field: true},
            },
            gaugeMiniColors: thresholdColors,
            labelMain: 'sk',
            labelMainFontColor: '#000000',
            labelMainFontSize: 32,
            labelBarsEnabled: true,
            labelBarsFontSize: 14,
            labelBarsFontColor: '#880088',
        } as GaugeMiniLayerConfig]
    }

    const testConfigDE: Config = {
        table: fromRows(getDataSubSetByFieldVal(data, 'location', 'de'), { _time: 'time', _value: 'number', _field: 'string'}),
        layers: [{
            type: 'gauge mini',
            barsDefinitions: {
                groupByColumns: {_field: true},
            },
            gaugeMiniColors: thresholdColors,
            labelMain: 'de',
            labelMainFontColor: '#000000',
            labelMainFontSize: 32,
            labelBarsEnabled: true,
            labelBarsFontSize: 14,
            labelBarsFontColor: '#880088'
        } as GaugeMiniLayerConfig]
    }


    return (
        <PlotContainer>
            <PlotSubContainer>
               <Plot config={testConfigCZ}/>
            </PlotSubContainer>
            <PlotSubContainer>
               <Plot config={testConfigSK}/>
            </PlotSubContainer>
            <PlotSubContainer>
                <Plot config={testConfigDE}/>
            </PlotSubContainer>
        </PlotContainer>
    )
}

export default GaugeMiniBullet;
