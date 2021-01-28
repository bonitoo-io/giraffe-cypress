import * as React from "react";

import {Plot,
    newTable,
    Table,
    fromFlux,
    fromRows,
    Config,
    LineLayerConfig,
    GeoLayerConfig} from '@influxdata/giraffe'

import memoizeOne from "memoize-one";
import GiraffeGeoTracksBasic from "../GiraffeGeoTracksBasic";

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

const tileServerConfiguration = {
    tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}

function RouteTracker({data}){

   // console.log("DEBUG GeoTest data " + JSON.stringify(data));

    const config: Config = {
        table: fromRows(data.values),
        showAxes: false,
        layers: [
            {
                type: 'geo',
                lat: data.lat,
                lon: data.lon,
                zoom: 2,
                allowPanAndZoom: true,
                detectCoordinateFields: true,
                layers: [
                    {
                        type: 'trackMap',
                        speed: 1000,
                        trackWidth: 4,
                        randomColors: false,
                        endStopMarkers: true,
                        endStopMarkerRadius: 4,
                        colors: [
                            {type: 'min', hex: '#0000FF'},
                            {type: 'max', hex: '#AAAA00'}
                        ]
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

export default RouteTracker;
