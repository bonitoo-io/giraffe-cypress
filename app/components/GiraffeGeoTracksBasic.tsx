import * as React from "react";

import {Plot,
    newTable,
    Table,
    fromFlux,
    fromRows,
    Config,
    LineLayerConfig,
    GeoLayerConfig} from '@influxdata/giraffe'

const now = Date.now();

const latitude = 46.6671;
const longitude = 0.3700;

import memoizeOne from "memoize-one";

function addTrack(data, startLat: number, startLon: number){
    const tid = Math.floor(Math.random() * 1000);
    let lat = startLat;
    let lon = startLon;
    for(let i = 0; i < 10; i++){
        const time = now + i * 1000 * 60;
        lat += Math.random() * 0.3;
        lon += Math.random() * 0.3;
        data.push({time,lat,lon,tid})
    }
}

const geoTracks = memoizeOne((lat: number, lon: number, count = 1) : Table => {
    const data = [];
    for(let i = 0; i < count; i++){
        addTrack(data, lat - 1, lon - 1.5);
    }


    let result = newTable(data.length)
        .addColumn('_time', 'unsignedLong', 'time', data.map(x => x.time))
        .addColumn('lat', 'double', 'number', data.map(x => x.lat))
        .addColumn('lon', 'double', 'number', data.map(x => x.lon))
        .addColumn('table', 'double', 'number', data.map(x => x.tid))

    console.log("DEBUG newTable() " + JSON.stringify(result))

    return result;
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

function GiraffeGeoTracksBasic({data}){

    console.log("DEBUG GeoTest data " + JSON.stringify(data));
    console.log("DEBUG fromRows(data) " + JSON.stringify(fromRows(data)))
    //console.log("DEBUG fromRows " + JSON.stringify(fromRows(data)))
    //console.log("DEBUG geoTracks() " + JSON.stringify(geoTracks(latitude, longitude, 3)))

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
            <Plot config={config} />
        </PlotContainer>

    )

}

export default GiraffeGeoTracksBasic;


