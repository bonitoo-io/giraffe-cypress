import * as React from 'react';

const latitude = 46.6671;
const longitude = 0.3700;
const GEO_HASH_COLUMN = 's2_cell_id'

import {Plot,
    newTable,
    Table,
    fromFlux,
    fromRows,
    Config,
    LineLayerConfig,
    GeoLayerConfig} from '@influxdata/giraffe'

import memoizeOne from "memoize-one";
import GiraffeGeoMarkerBasic from "../GiraffeGeoMarkerBasic";

const now = Date.now();


const baseGeoHash = '47fdbccd'

const testHashes = ['47fdbe13', '47fdbf13', '4806a901', '47fcd5b7', '47fc1385',
                    '47fcadb3', '4808785f', '47fb0b13', '47ff00a1', '48094809' ] //, '47f00009']

const tileServerConfiguration = {
    tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}

/*
temporary basic generator function - see storybook
 */

function getRandomNumber(center: number, spread: number) {
    return center + (0.5 - Math.random()) * spread * 2
}

const createDataColumns = (numberOfRecords: number) => {
    const TIME_COL = []
    const VALUE1_COL = []
    const VALUE2_COL = []
    const S2_COL = []
    for (let i = 0; i < numberOfRecords; i += 1) {
        VALUE1_COL.push((i + 1) * 10.0)
        VALUE2_COL.push(getRandomNumber(50, 30))
        S2_COL.push(testHashes[i % 10])
        console.log('Hex 2 Dec ' + parseInt(testHashes[i % 10], 16))
        TIME_COL.push(now + i * 1000 * 60)
    }
    return {TIME_COL, VALUE1_COL, VALUE2_COL, S2_COL}
}

export const geoTable = memoizeOne(
    (numberOfRecords = 10): Table => {
        const columns = createDataColumns(numberOfRecords)
        return newTable(numberOfRecords)
            .addColumn('_time', 'dateTime:RFC3339', 'time', columns.TIME_COL)
            .addColumn('mag', 'double', 'number', columns.VALUE1_COL)
            .addColumn('dur', 'double', 'number', columns.VALUE2_COL)
            .addColumn(GEO_HASH_COLUMN, 'string', 'string', columns.S2_COL)
            //.addColumn('lon', 'double', 'number', columns.LON_COL)
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
            paddingLeft: "5px",
            paddingTop: "5px",
            border: 'grey 3px solid'
        }}
    >
        {children}
    </div>
)// @ts-ignore

function GeoHashCircles({data}){

    //console.log(`DEBUG data ${JSON.stringify(data)}`)

    const config: Config = {
        //table: geoTable(),
        table: fromRows(data),
        showAxes: false,
        layers: [
            {
                type: 'geo',
                lat: latitude,
                lon: longitude,
                zoom: 8,
                allowPanAndZoom: true,
                detectCoordinateFields: true,
                layers: [
                    {
                        type: 'circleMap',
                        radiusField: 'mag',
                        radiusDimension: {label: 'Mag'},
                        colorDimension: {label: 'Dur'},
                        colorField: 'dur',
                        colors: [
                            {type: 'min', hex: '#ff8808'},
                            {value: 50, hex: '#ff0888'},
                            {type: 'max', hex: '#343aeb'},
                        ],
                    },
                ],
                tileServerConfiguration,
            } as GeoLayerConfig,
        ],
    }
    return(
        <PlotContainer>
            <Plot config={config} />
        </PlotContainer>

    )

}

export default GeoHashCircles;
