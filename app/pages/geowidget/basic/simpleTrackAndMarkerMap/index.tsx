import Head from 'next/head'

import dynamic from 'next/dynamic'

const GiraffeGeoTrackAndMarker = dynamic(() => {return import('../../../../components/GiraffeGeoTrackAndMarker')},{ssr: false});

let data = [];

//TODO - get data from API
// N.B. this is a service method from NextJS
export async function getServerSideProps(){
    const res = await fetch(`http://localhost:3000/api/influx/tracks`)

    console.log("DEBUG GeoTest track res " + res);

    //const data = {}
    const data = await res.json();


    data.forEach(rec => {
        rec.table = rec.ligne;
    })

    console.log("DEBUG GeoTest getTrackRecords Data: " + JSON.stringify(data));

    return { props: {data} }
}


export default function Home({data}){

    return(
        <div>
            <Head>
                <title>Map with Track and Marker</title>
            </Head>
            <section style={{height:"608px", width: "608px" }}>
                <p>Map with Track and Marker</p>
                <div style={{height: "600px", width: "600px", position: "absolute", top: 0, left: 0}}
                     data-testid='geowidget-track-and-marker'>
                    <GiraffeGeoTrackAndMarker data={data}/>
                </div>

            </section>
        </div>
    );
}
