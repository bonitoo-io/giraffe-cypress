import Head from 'next/head'

import dynamic from 'next/dynamic'

//const GeoHashCircles = dynamic(() => {return import('../../../../components/geohash/geohashCircles')},{ssr: false});
const GeoHashControlCircles = dynamic(() => {return import('../../../../components/geohash/geoHashControlCircles')},{ssr: false});

/*
http://localhost:3000/api/influx/query2?fluxq=import%20%22experimental/geo%22%20from(bucket:%20%22qa%22)%20%20|%3E%20range(start:%20-2h)%20%20|%3E%20filter(fn:%20(r)%20=%3E%20r[%22_measurement%22]%20==%20%22myGis%22)%20%20|%3E%20map(fn:%20(r)%20=%3E%20({%20r%20with%20lat:%20float(v:%20r.lat)}))%20%20|%3E%20map(fn:%20(r)%20=%3E%20({%20r%20with%20lon:%20float(v:%20r.lon)}))%20%20|%3E%20geo.shapeData(latField:%20%22lat%22,%20lonField:%20%22lon%22,%20level:%2022)&selectc=dur,mag,lat,lon,s2_cell_id

import "experimental/geo" from(bucket: "qa")  |> range(start: -2h)  |> filter(fn: (r) => r["_measurement"] == "myGis")  |> map(fn: (r) => ({ r with lat: float(v: r.lat)}))  |> map(fn: (r) => ({ r with lon: float(v: r.lon)}))  |> geo.shapeData(latField: "lat", lonField: "lon", level: 22)

selectc=dur,mag,lat,lon,s2_cell_id

 */


export default function Home({data}){

    return(
        <div>
            <Head>
                <title>Map With Circles</title>
            </Head>
            <section style={{height:"608px", width: "608px" }}>
                <div style={{height: "600px", width: "600px", position: "absolute", top: 0, left: 0}}
                     data-testid='geowidget-circles'>
                    <GeoHashControlCircles />
                </div>

            </section>
        </div>
    );
}
