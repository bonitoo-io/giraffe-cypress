import React, {useState, useEffect} from "react";

import dynamic from 'next/dynamic'
import {makeInfluxReq} from '../utils/Utils'
import DataTable from '../utils/DataTable'
import styles from '../styles/giraffeCypress.module.css'

const GeoHashCircles = dynamic(() => {return import('./geohashCircles')},{ssr: false});

let firstLoad = true;

function GeoHashControlCircles(){

    const [grid, setGrid] = useState('latlon')
    const [data, setData] = useState([{}])
    const [depth, setDepth] = useState(22)

    const S2Depths: number[] = []

    for(let i = 0; i < 21; i++){
        S2Depths.push(i+4);
    }

    const fetchData = (depth, gridMode) => {
        makeInfluxReq('GET',
            `http://localhost:3000/api/influx/query2?fluxq=import "experimental/geo" from(bucket: "qa")  |> range(start: -2h)  |> filter(fn: (r) => r["_measurement"] == "myGis")  |> map(fn: (r) => ({ r with lat: float(v: r.lat)}))  |> map(fn: (r) => ({ r with lon: float(v: r.lon)}))  |> geo.shapeData(latField: "lat", lonField: "lon", level: ${depth})&selectc=dur,mag,${gridMode}`)
        .then((resolve) => {
            setData(JSON.parse(resolve as string))
        }).catch(error => {
            console.error(`ERROR fetching data: [${error.status}] ${error.statusText}`)
            setData([{}])
        })
    }

    const handleDepth = (ev) => {
        setDepth(ev.target.value)
        //console.log('DEBUG grid ' + grid)
        const gridMode = grid === 'latlon' ? ['lat','lon'] : ['s2_cell_id'];

        fetchData(ev.target.value, gridMode);
    }

    const handleChange = (ev) => {
        setGrid(ev.target.value)
        const gridMode = ev.target.value === 'latlon' ? ['lat','lon'] : ['s2_cell_id'];

        fetchData(depth, gridMode);
    }

    const handleCoordClick = (ev) => {
        alert('TBD')
    }

    function DepthItemsSelector({vals} ){

        const depthItems = vals.map((val) =>
            <option key={val.toString()} value={val} data-testid={'s2depth-' + val}>{val}</option>
        )

        return(
            <select onChange={handleDepth}
                    value={depth}
                    className={styles.gircypDepth}
                    data-testid={'select-s2depth'}
            >
                {depthItems}
            </select>
        )
    }

    if(firstLoad){
        const gridMode = ['lat','lon']
        fetchData(depth, gridMode);
        firstLoad = false;
    }

    return(
        <div>
            <div style={{height: "20px", width: "600px", position: "absolute", top: 10, left: 10}}>
                <h3>Map With Circles</h3>
                <label className={styles.gircyp}>Discrete Global Grid System</label>
                <select className={styles.gircypMode}
                onChange={handleChange}
                value={grid}
                data-testid={'select-mode'}>
                    <option value='latlon' data-testid={'mode-latlon'}>ISO 6709 (Lat/Lon) dec.</option>
                    <option value='s2' data-testid={'mode-s2'}>S2 - Geometry</option>
                </select>
                <label className={styles.gircyp}>S2 depth</label>
                <span style={{fontFamily: "monospace", fontSize: "12px"}}>
                <DepthItemsSelector vals = {S2Depths} />
                </span>
            </div>
            <div style={{height: "600px", width: "600px", position: "absolute", top: 120, left: 10}}
            data-testid={'geowidget-hash-cirlces'}>
               <GeoHashCircles data={data} />
            </div>
            <div style={{position: "absolute", width: 700, top: 120, left: 700}}>
            {data[0] ?
                <DataTable data={data} handleCoordClick={handleCoordClick}/> : <p><strong>No Data</strong></p>}
            </div>

        </div>
    )
}

export default GeoHashControlCircles;
