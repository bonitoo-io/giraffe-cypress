import * as React from 'react';

import {Plot,
    newTable,
    Table,
    fromFlux,
    fromRows,
    Config,
    LineLayerConfig,
    GeoLayerConfig} from '@influxdata/giraffe'

import memoizeOne from "memoize-one";

const now = Date.now();

const latitude = 46.6671;
const longitude = 0.3700;

const tileServerConfiguration = {
    tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//    tileServerUrl: 'https://tile.openstreetmap.org/7/63/42.png',
    // bingKey:
    //   'AtqWbnKXzGMWSAsgWknAw2cgBKuGIm9XmSbaS4fSebC5U6BdDTUF3I__u5NAp_Zi',
}

function getRandomNumber(center: number, spread: number) {
    return center + (0.5 - Math.random()) * spread * 2
}

const createDataColumns = (numberOfRecords: number) => {
    const TIME_COL = []
    const VALUE1_COL = []
    const VALUE2_COL = []
    const LAT_COL = []
    const LON_COL = []
    for (let i = 0; i < numberOfRecords; i += 1) {
        VALUE1_COL.push(getRandomNumber(3.5, 3.5))
        VALUE2_COL.push(getRandomNumber(50, 30))
        LAT_COL.push(getRandomNumber(latitude, 1))
        LON_COL.push(getRandomNumber(longitude, 1))
        TIME_COL.push(now + i * 1000 * 60)
    }

    return {TIME_COL, VALUE1_COL, VALUE2_COL, LAT_COL, LON_COL}
}

export const geoTable = memoizeOne(
    (numberOfRecords = 20): Table => {

        const columns = createDataColumns(numberOfRecords)
        console.log("DEBUG columns " + JSON.stringify(columns))
        return newTable(numberOfRecords)
            .addColumn('_time', 'time', columns.TIME_COL)
            .addColumn('magnitude', 'number', columns.VALUE1_COL)
            .addColumn('duration', 'number', columns.VALUE2_COL)
            .addColumn('lat', 'number', columns.LAT_COL)
            .addColumn('lon', 'number', columns.LON_COL)
    }
)

// @ts-ignore
export const PlotContainer = ({children}) => (
    <div
        style={{
            width: '100%',
            height: '100%',
            margin: '50px',
            border: 'grey 3px solid'
        }}
    >
        {children}
    </div>
)

function GiraffeGeoTest({data}){

    console.log("DEBUG GeoTest data " + data);
    console.log("DEBUG fromRows " + JSON.stringify(fromRows(data)))

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

export default GiraffeGeoTest;
