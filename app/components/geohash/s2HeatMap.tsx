import * as React from "react";

import {Config, fromRows, Plot, newTable, Table} from '@influxdata/giraffe'



import memoizeOne from "memoize-one";
const now = Date.now();

const latitude = 46.6671;
const longitude = 0.3700;
const s2Default = '47fdbccd2b1';

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

function S2HeatMap({data}){

    //console.log("DEBUG data " + JSON.stringify(data))
    const config: Config = {
        table: fromRows(data),

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
                        intensityDimension: {label: "Magnitude"},
                        intensityField: "mag",
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

export default S2HeatMap;
