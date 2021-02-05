import Head from 'next/head'
import dynamic from "next/dynamic";
import React from "react";

const GaugeMiniProgress = dynamic(() => {return import('../../../../components/miniGauge/GaugeMiniProgress')},{ssr: false});
const GaugeMiniProgressControl = dynamic(() => {return import('../../../../components/miniGauge/GaugeMiniProgressControl')},{ssr: false});


const fluxQuery = `from(bucket: "qa")  |> range(start: -2h)  |> filter(fn: (r) => r["_measurement"] == "battery")  |> filter(fn: (r) => r["_field"] == "charge")`
const selectedColumns = '_value,_field,droid'

export async function getServerSideProps(){

    const res = await fetch(`http://localhost:3000/api/influx/query2?fluxq=${fluxQuery}&selectc=${selectedColumns}`);

    const data = await res.json();

    return {props: {data} }
}

/*
N.B. this test app depends on data generated from data/sources/gaugeProgress.lp
the data must be loaded into influxdb backend for this App to work.
e.g.

$ ./DataGen.ts -s sources/gaugeProgress.lp -t -40m -i 1m

* */

export default function Home({ data }){

    return(
        <div>
            <Head>
                <title>Hello Minigauge Progress Bar</title>
            </Head>
            <GaugeMiniProgressControl data={data} />

        </div>
    );
}
