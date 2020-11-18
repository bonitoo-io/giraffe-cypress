import * as React from "react";

import {ClusterAggregation, Config, fromRows, Plot} from '@influxdata/giraffe'

const now = Date.now();

const latitude = 46.6671;
const longitude = 0.3700;

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

function GiraffeGeoMarkerCluster({data}){

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
                        type: 'pointMap',
                        colorDimension: {label: 'Mag'},
                        colorField: 'mag',
                        colors: [
                            {type: 'min', hex: '#006d6f'},
                            {value: 3, hex: '#FFD300'},
                            {value: 6, hex: '#FF4F00'},
                            {value: 9, hex: '#db0000'},
                            {type: 'max', hex: '#db0000'},
                        ],
                        isClustered: true,
                        areClustersColored: true,
                        clusterAggregationFunction: ClusterAggregation.mean,
                        maxClusterRadius: 120,
                    },
                ],
                tileServerConfiguration: tileServerConfiguration,

            }
        ]
    }

    return(
        <PlotContainer>
            <Plot config={config} />
        </PlotContainer>
    )
}

export default GiraffeGeoMarkerCluster;


