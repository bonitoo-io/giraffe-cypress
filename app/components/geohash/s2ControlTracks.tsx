import React, {useState, useEffect} from "react";

import {makeInfluxReq} from '../utils/Utils'
import DataTable from '../utils/DataTable'
import SelectGridSystem from '../utils/SelectGridSystem'
import SelectIntegers from '../utils/SelectIntegers'

import S2Tracks from './s2Tracks'
import styles from "../styles/giraffeCypress.module.css";

// TODO resume after #480 is fixed

/*
*
* import "experimental/geo"
from(bucket: "qa")
  |> range(start: -2h)
  |> filter(fn: (r) => r["_measurement"] == "voieGis")
  |> geo.shapeData(latField: "latitude", lonField: "longitude", level: 10)
  |> geo.asTracks(groupBy: ["ligne"], orderBy: ["_time"])
*
* N.B. depends on data generated in data/sources/sncf02.lp
*
* */

let firstLoad = true;

function S2ControlTracks(){

    const [data, setData] = useState([{}])
    const [grid, setGrid] = useState('latlon')
    const [depth, setDepth] = useState(22)
    const [staySane, setStaySane] = useState(false)

    const fetchData = (depth, gridMode) => {
        makeInfluxReq('GET',
            `http://localhost:3000/api/influx/query2?fluxq=import "experimental/geo" from(bucket: "qa")  |> range(start: -2h)  |> filter(fn: (r) => r["_measurement"] == "voieGis")  |> geo.shapeData(latField: "latitude", lonField: "longitude", level: ${depth})  |> geo.asTracks(groupBy: ["ligne"], orderBy: ["_time"])&selectc=ligne,st,cl,nom,dur,mag,${gridMode},table`)
            .then((resolve) => {
                let newData = JSON.parse(resolve as string)
                console.log('DEBUG data: ' + new Date() + " " + resolve)
                console.log("DEBUG data JSON.parse " + JSON.parse(resolve as string))
                console.log("DEBUG newData " + newData);
                setData(newData)
                //setData([{}]);

            }).catch(error => {
            console.error(`ERROR fetching data: [${error.status}] ${error.statusText}`)
            setData([{}])
        })
    }


    console.log('DEBUG gen data ' + JSON.stringify(data))

    const handleCoordClick = (ev) => {
        alert('TBD')
    }

    const handleGridChange = (ev) => {
        setGrid(ev.target.value)
        const gridMode = ev.target.value === 'latlon' ? ['lat','lon'] : ['s2_cell_id'];

        fetchData(depth, gridMode);
    }

    const handleDepth = (ev) => {
        setDepth(ev.target.value)
        //console.log('DEBUG grid ' + grid)
        const gridMode = grid === 'latlon' ? ['lat','lon'] : ['s2_cell_id'];

        fetchData(ev.target.value, gridMode);
    }

    const handleSanity = (ev) => {
        console.log('DEBUG sanity ' + ev.target.checked);
        setStaySane(ev.target.checked);
    }

    if(firstLoad){
        const gridMode = ['lat','lon']
//        const gridMode = ['s2_cell_id']
        fetchData(depth, gridMode);
        firstLoad = false;
    }

    console.log('DEBUG grid ' + grid)

    return(
        <div>
            <h3>Tracks from S2</h3>
            <div>
                <SelectGridSystem value={grid} handleSelect={handleGridChange}/>
                <label className={styles.gircyp}>S2 depth</label>
                <span style={{fontFamily: "monospace", fontSize: "12px"}}>
                <SelectIntegers start={4} end={24} value={depth} handleSelect={handleDepth}/>
                </span>
                <input type="checkbox" id="staySane"
                       onChange={handleSanity} name="staySane" />
                <label>Stay Sane (Catch S2 values before they cause exception)</label>
            </div>
        <div >
            {data[0] && data[0]['s2_cell_id'] && staySane ? <p>USING S2</p> : <div style={{height: 600, width: 600}}>
                {data[0] && data[0]['_time'] ? <S2Tracks data={data}/> : <p><strong>NO DATA</strong></p>}
            </div>
            }
        </div>
            <div style={{position: "absolute", width: 700, top: 40, left: 700}}>
                { data[0] ?
                            <DataTable data={data} handleCoordClick={handleCoordClick}/> :
                            <p><strong>No Data</strong></p>
                    } </div>
        </div>
    )
}

export default S2ControlTracks
