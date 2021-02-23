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
import styles from './styles/giraffeCypress.module.css'

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

    console.log("DEBUG GeoTest data " + data);
    console.log("DEBUG fromRows " + JSON.stringify(fromRows(data)))

    const handleRecenter = (ev) => {
        setLocation({lat: latitude, lon: longitude})
    }

    const handleZoom = (ev) => {
        setZoom(parseInt(ev.target.value))
    }

    const handleCoordClick = (ev) => {
        const tid = ev.target.parentElement.id;
        let lat = location.lat;
        let lon = location.lon;
        let s2 = 0.0;
        if(tid.startsWith('lat')){
            lat = parseFloat(ev.target.parentElement.innerText);
            lon = parseFloat(ev.target.parentElement.nextSibling.innerText)
        }else if(tid.startsWith('lon')){
            lat = parseFloat(ev.target.parentElement.previousSibling.innerText);
            lon = parseFloat(ev.target.parentElement.innerText)
        }else if(tid.startsWith('s2')){
            s2 = parseFloat(ev.target.parentElement.innerText)
        }else{
            console.error('Unhandled element id ' + tid)
        }
        setLocation({lat: lat, lon: lon})
       // alert(lat + " : " + lon + " (s2: " + s2 + ")")
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

    //TODO - send select to reusable utilities - see select in geohashControlCircles as well
    //TODO - button to reset zoom as well
    return(
        <PlotContainer>
            <Plot config={config} />
            <div style={{zIndex: 999, position: "absolute", right: 50, top: 50}}>
                <span style={{fontSize: "16pt",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    backgroundColor: "rgba(255, 215, 0, 0.2)"}}>lat : {location.lat}, lon: {location.lon}</span>
            </div>
            <div style={{zIndex: 999, position: "absolute", right: 50, top: 100}}>
                <span style={{fontSize: "16pt",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    backgroundColor: "rgba(255, 215, 0, 0.2)"}}>zoom : {zoom}</span>
            </div>

            <div style={{position: "absolute", width: 700, top: 0, left: 640}}>
                <div><div className={styles.gircypTooltip}>
                    <span className={styles.gircypTooltipText}>Reset to initial values <br/> {latitude} : {longitude}</span>
                    <button onClick={handleRecenter} >Recenter</button></div>


                    <label>Zoom </label><select value={zoom} onChange={handleZoom}>
                        <option value={1} key={1}>1</option>
                        <option value={2} key={2}>2</option>
                        <option value={3} key={3}>3</option>
                        <option value={4} key={4}>4</option>
                        <option value={5} key={5}>5</option>
                        <option value={6} key={6}>6</option>
                        <option value={7} key={7}>7</option>
                        <option value={8} key={8}>8</option>
                        <option value={9} key={9}>9</option>
                        <option value={10} key={10}>10</option>
                        <option value={11} key={11}>11</option>
                        <option value={12} key={12}>12</option>
                        <option value={13} key={13}>13</option>
                        <option value={14} key={14}>14</option>
                        <option value={15} key={15}>15</option>
                        <option value={16} key={16}>16</option>
                        <option value={17} key={17}>17</option>
                        <option value={18} key={18}>18</option>
                    </select>
                </div>
                <DataTable data={data} handleCoordClick={handleCoordClick} />
            </div>
        </PlotContainer>

    )

}

export default GiraffeGeoMarkerCenter;
