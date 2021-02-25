import React, {useState, useEffect} from "react";
import styles from "../styles/giraffeCypress.module.css";

function SelectGridSystem({ value,
   grids = [{value: 'latlon', text: 'ISO 6709 (Lat/Lon) dec.'},
                                   {value: 's2', text: 'S2 - Geometry'}] ,
                              handleSelect = (ev) => {console.error('Handel Select not Implemented')}}){


   const items = grids.map((grid) =>
       <option value={grid.value} key={grid.value} data-testid={'mode-' + grid.value}>{grid.text}</option>
   )

   return(
       <span id={'gircyp-select-grid'} className={'gircyp-select-grid'}>
       <label className={styles.gircyp}>Discrete Global Grid System</label>
       <select className={styles.gircypMode}
               onChange={handleSelect}
               value={value}
               data-testid={'select-mode'}>
           {items}
       </select>
       </span>
   )
}

export default SelectGridSystem;
