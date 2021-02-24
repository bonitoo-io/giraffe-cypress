import React, {useState, useEffect} from "react";
import styles from "../styles/giraffeCypress.module.css";

function SelectIntegers({start, end, value,
                        handleSelect = (ev) => {console.error('Handel Select not Implemented')}}){

    const vals: number[] = []

    for(let i = start; i < end + 1; i++){
        vals.push(i);
    }

    const items = vals.map((val) =>
        <option key={val.toString()} value={val} data-testid={'opt-' + val}>{val}</option>
    )

    return(
        <select onChange={handleSelect}
                value={value}
                className={styles.gircypDepth}
                data-testid={'select-ints'}
        >
            {items}
        </select>
    )
}

export default SelectIntegers;
