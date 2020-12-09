import * as React from "react";

import {Config, fromRows, Plot, newTable, Table} from '@influxdata/giraffe'



import memoizeOne from "memoize-one";
import GiraffeGeoTracksBasic from "./GiraffeGeoTracksBasic";
const now = Date.now();

const latitude = 46.6671;
const longitude = 0.3700;

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
        //VALUE1_COL.push(getRandomNumber(10, 10))
        VALUE1_COL.push(1)
        VALUE2_COL.push(getRandomNumber(50, 30))
        LAT_COL.push(latitude + (0.17 * i))
        //LAT_COL.push(getRandomNumber(latitude, 0.33))
        LON_COL.push(longitude + (0.33 * i))
        //LON_COL.push(getRandomNumber(longitude, 0.33))
        TIME_COL.push(now + i * 1000 * 60)
    }
    return {TIME_COL, VALUE1_COL, VALUE2_COL, LAT_COL, LON_COL}
}

export const geoTable = memoizeOne(
    (numberOfRecords = 200): Table => {
        const columns = createDataColumns(numberOfRecords)
        return newTable(numberOfRecords)
            .addColumn('_time', 'unsignedLong', 'time', columns.TIME_COL)
            .addColumn('mag', 'double', 'number', columns.VALUE1_COL)
            .addColumn('dur', 'double', 'number', columns.VALUE2_COL)
            .addColumn('lat', 'double', 'number', columns.LAT_COL)
            .addColumn('lon', 'double','number', columns.LON_COL)
    }
)



const tileServerConfiguration = {
    tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//    tileServerUrl: 'https://tile.openstreetmap.org/7/63/42.png',
    // bingKey:
    //   'AtqWbnKXzGMWSAsgWknAw2cgBKuGIm9XmSbaS4fSebC5U6BdDTUF3I__u5NAp_Zi',
}

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
)

function GiraffeGeoHeatMap({data}){

    //console.log("DEBUG data " + JSON.stringify(data))

    const config: Config = {
        table: fromRows(data),
        //table: geoTable(10),
        showAxes: false,
        layers: [
            {
                type: 'geo',
                lat: latitude,
                lon: longitude,
                zoom: 8,
                allowPanAndZoom: true,
                detectCoordinateFields: false,
                layers: [
                    {
                        type: 'heatmap',
                        radius: 20,
                        blur: 10,
                        intensityDimension: {label: 'Magnitude'},
                        intensityField: 'mag',
                    },
                ],
                tileServerConfiguration: tileServerConfiguration,
            },
        ],
    }
    return (
        <PlotContainer>
            <Plot config={config} />
        </PlotContainer>
    )


}

export default GiraffeGeoHeatMap;
