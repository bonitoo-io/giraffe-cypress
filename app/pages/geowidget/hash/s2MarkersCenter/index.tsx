import Head from 'next/head'

import dynamic from 'next/dynamic'

const GiraffeGeoMarkerCenter = dynamic(() => {return import('../../../../components/GiraffeGeoMarkerCenter')},{ssr: false});

export async function getServerSideProps(){

    const res = await fetch(`http://localhost:3000/api/influx/query2?fluxq=import "experimental/geo" from(bucket: "qa")  |> range(start: -2h)  |> filter(fn: (r) => r["_measurement"] == "myGis")  |> map(fn: (r) => ({ r with lat: float(v: r.lat)}))  |> map(fn: (r) => ({ r with lon: float(v: r.lon)}))  |> geo.shapeData(latField: "lat", lonField: "lon", level: 22)&selectc=dur,mag,s2_cell_id`)
    //const data = {}
    const data = await res.json();
    return {props: {data} }
}

export default function Home({data}){

    return(
        <div>
            <Head>
                <title>Simple Map With Markers</title>
            </Head>
            <section style={{height:"608px", width: "608px" }}>
                <p>Simple Map With Centrable Markers</p>
                <div style={{height: "600px", width: "600px", position: "absolute", top: 0, left: 0}}
                     data-testid='geowidget-markers'>
                    <GiraffeGeoMarkerCenter data={data}/>
                </div>

            </section>
        </div>
    );
}
