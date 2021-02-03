import Head from 'next/head'

import dynamic from "next/dynamic";

const GaugeMiniBullet = dynamic(() => {return import('../../../../components/miniGauge/GaugeMiniBullet')},{ssr: false});

const fluxQuery = `from(bucket:"qa") |> range(start: -3h) |> filter(fn: (r) => r["_measurement"] == "weather")`
const selectedColumns = '_value,_field,location'

export async function getServerSideProps(){

    const res = await fetch(`http://localhost:3000/api/influx/query2?fluxq=${fluxQuery}&selectc=${selectedColumns}`);

    const data = await res.json();

    return {props: {data} }
}

export default function Home({ data }){
    console.log('DEBUG Home data ' + JSON.stringify(data))
    return(
        <div>
            <Head>
                <title>Hello Minigauge</title>
            </Head>
                <section style={{height:"608px", width: "608px" }}>
                    <p>Minigauge</p>
                    <div style={{height: "600px", width: "600px", position: "absolute", top: 0, left: 0}}>
                        <GaugeMiniBullet data={data}/>
                    </div>

                </section>
        </div>
    );
}
