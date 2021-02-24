import React, {useState} from 'react';

import {Plot,
    newTable,
    Table,
    fromFlux,
    fromRows,
    Config,
    LineLayerConfig,
    GeoLayerConfig} from '@influxdata/giraffe'

import DataTable from './utils/DataTable'
import SelectIntegers from "./utils/SelectIntegers";
import styles from './styles/giraffeCypress.module.css'

import memoizeOne from "memoize-one";

const now = Date.now();

const latitude = 46.6671;
const longitude = 0.3700;
const s2Default = '47fdbccd2b1';

const tileServerConfiguration = {
    tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
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

function GiraffeGeoMarkerCenter({data}){

    const [location, setLocation] = useState({lat: latitude, lon: longitude})
    const [zoom, setZoom] = useState(8);
    const [s2, setS2] = useState(s2Default)

    const handleRecenter = (ev) => {
        if(data[0] && data[0]['s2_cell_id']){
            setS2(s2Default)
        }else {
            setLocation({lat: latitude, lon: longitude})
        }
    }

    const handleZoom = (ev) => {
        setZoom(parseInt(ev.target.value))
    }

    const handleCoordClick = (ev) => {
        const tid = ev.target.parentElement.id;
        let lat = location.lat;
        let lon = location.lon;

        if(tid.startsWith('lat')){
            lat = parseFloat(ev.target.parentElement.innerText);
            lon = parseFloat(ev.target.parentElement.nextSibling.innerText)
            setLocation({lat: lat, lon: lon})
        }else if(tid.startsWith('lon')){
            lat = parseFloat(ev.target.parentElement.previousSibling.innerText);
            lon = parseFloat(ev.target.parentElement.innerText)
            setLocation({lat: lat, lon: lon})
        }else if(tid.startsWith('s2')){
            setS2(ev.target.parentElement.innerText)
        }else{
            console.error('Unhandled element id ' + tid)
        }

    }

    const config: Config = {
        //table: geoTable(),
        table: fromRows(data),
        showAxes: false,
        layers: [
            {
                type: 'geo',
                lat: location.lat,
                lon: location.lon,
                zoom: zoom,
                allowPanAndZoom: true,
                detectCoordinateFields: true,
                layers: [
                    {
                        type: 'pointMap',
                        colorDimension: {label: 'dur'},
                        colorField: 'dur',
                        colors: [
                            {type: 'min', hex: '#006d6f'},
                            {value: 20, hex: '#FFD300'},
                            {value: 40, hex: '#FF4F00'},
                            {value: 60, hex: '#db0000'},
                            {type: 'max', hex: '#db0000'},
                        ],
                        isClustered: false
                    },
                ],
                tileServerConfiguration,
            } as GeoLayerConfig,
        ],
    }

    return(
        <PlotContainer>
            <Plot config={config} />
            <div style={{zIndex: 999, position: "absolute", right: 50, top: 50}}>
                <span style={{fontSize: "16pt",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    backgroundColor: "rgba(255, 215, 0, 0.2)"}}>
                    {data[0] && data[0]['s2_cell_id'] ? <span>s2: {s2}</span> : <span>lat : {location.lat}, lon: {location.lon}</span>}
                </span>
            </div>
            <div style={{zIndex: 999, position: "absolute", right: 50, top: 100}}>
                <span style={{fontSize: "16pt",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    backgroundColor: "rgba(255, 215, 0, 0.2)"}}>zoom : {zoom}</span>
            </div>

            <div style={{position: "absolute", width: 700, top: 0, left: 640}}>
                <div><div className={styles.gircypTooltip}>
                    <span className={styles.gircypTooltipText}>Reset to initial value <br/>{data[0] && data[0]['s2_cell_id'] ?
                        <span>{s2}</span> :
                        <span> {latitude} : {longitude}</span>}</span>
                    <button data-testid={'btn-recenter'} onClick={handleRecenter} style={{padding: "5px", marginLeft: '5px', marginRight: '5px'}} >Recenter</button></div>
                    <label style={{marginLeft: "10px"}}>Zoom </label><SelectIntegers start={1}
                                                        end={18}
                                                        value={zoom}
                                                        handleSelect={handleZoom}/>
                </div>
                {data[0] ? <DataTable data={data} handleCoordClick={handleCoordClick} /> :
                    <p><strong>NO DATA</strong></p> }
            </div>
        </PlotContainer>

    )
}

export default GiraffeGeoMarkerCenter;
