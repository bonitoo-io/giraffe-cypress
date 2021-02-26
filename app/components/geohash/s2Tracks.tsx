import * as React from 'react';

import {PlotContainer} from '../utils/PlotContainer'

import {Plot,
    newTable,
    Table,
    fromFlux,
    fromRows,
    Config,
    LineLayerConfig,
    GeoLayerConfig} from '@influxdata/giraffe'

// TODO resume after #480 is fixed

const latitude = 46.6671;
const longitude = 0.3700;
const s2Default = '47fdbccd2b1';
const GEO_HASH_COLUMN = 's2_cell_id'

const tileServerConfiguration = {
    tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//    tileServerUrl: 'https://tile.openstreetmap.org/7/63/42.png',
    // bingKey:
    //   'AtqWbnKXzGMWSAsgWknAw2cgBKuGIm9XmSbaS4fSebC5U6BdDTUF3I__u5NAp_Zi',
}

function S2Tracks({data}){

    console.log('DEBUG S2Tracks data ' + JSON.stringify(data))

    const config: Config = {
        //table: geoTracks(latitude, longitude, 2),
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
                        type: 'trackMap',
                        speed: 1000,
                        trackWidth: 4,
                        randomColors: true,
                        endStopMarkers: true,
                        endStopMarkerRadius: 4,
                        colors: undefined,
                    },
                ],
                tileServerConfiguration,
            } as GeoLayerConfig,
        ],
    }

    return(
        <PlotContainer>
            <Plot config={config}/>
        </PlotContainer>
    )

}

export default S2Tracks
