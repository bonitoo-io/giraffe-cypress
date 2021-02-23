import React, {useState, useEffect} from "react";
import styles from "../styles/giraffeCypress.module.css";

function DataRow({row, handleCoordClick, index}){

    return(<tr style={{textAlign: 'left'}} key={index} id={'row_' + index} className={styles.gircyp}>
        <td key={index} className={styles.gircyp}>{index}</td>
        <td key={row._time} id={`timestamp_${index}`} className={styles.gircyp}>{row._time}</td>
        {row.s2_cell_id && <td key={row.s2_cell_id} id={`s2_${index}`} className={styles.gircyp} data-testid={'s2_' + index}><a className={styles.gircyp} onClick={handleCoordClick}>{row.s2_cell_id}</a></td>}
        {row.lat && <td key={row.lat} id={`lat_${index}`} className={styles.gircyp} data-testid={'lat_' + index}><a className={styles.gircyp} onClick={handleCoordClick}>{row.lat}</a></td>}
        {row.lon && <td key={row.lon} id={`lon_${index}`} className={styles.gircyp} data-testid={'lon_' + index}><a className={styles.gircyp} onClick={handleCoordClick}>{row.lon}</a></td>}
        <td key={row.mag} id={`mag_${index}`} className={styles.gircyp}>{row.mag}</td>
        <td key={row.dur} id={`dur_${index++}`} className={styles.gircyp}>{row.dur}</td>
    </tr>)
}

function DataTable({data, handleCoordClick}){

    let rowCount = 0;

    return (
        <table className={styles.gircyp} data-testid={'table-data-inspect'}>
            <thead>
            <tr>
                <th key='head' className={styles.gircyp}>Recs</th>
                <th className={styles.gircyp}>Timestamp</th>
                {data[0].s2_cell_id && <th className={styles.gircyp}>S2</th>}
                {data[0].lat && <th className={styles.gircyp}>Lat</th>}
                {data[0].lon && <th className={styles.gircyp}>Lon</th>}
                <th className={styles.gircyp}>Mag</th>
                <th className={styles.gircyp}>Dur</th>
            </tr>
            </thead>
            <tbody style={{fontFamily: "monospace"}}>
            {data.map((row) => (

                <DataRow row={row} index={rowCount + 1} handleCoordClick={handleCoordClick} key={rowCount++}/>
            ))}
            </tbody>
        </table>
    )
}

export default DataTable;

