import Head from 'next/head'

import dynamic from 'next/dynamic'

const GiraffeGeoHeatMapBasic = dynamic(() => {return import('../../../../components/GiraffeGeoHeatMapBasic')},{ssr: false});

let data = [];

export async function getServerSideProps(){

    const res = await fetch(`http://localhost:3000/api/influx/query`)

    console.log("DEBUG GeoTest res XXX " + res);

    //const data = {}
    const data = await res.json();

    console.log("DEBUG GeoTest getServerSideProps Data XXX: " + JSON.stringify(data));
    return {props: {data} }
}

export default function Home({data}){

    return(
        <div>
            <Head>
                <title>Simple Map With Tracks</title>
            </Head>
            <section style={{height:"608px", width: "608px" }}>
                <p>Simple Map With Tracks</p>
                <div style={{height: "600px", width: "600px", position: "absolute", top: 0, left: 0}}
                     data-testid='geowidget-tracks'>
                    <GiraffeGeoHeatMapBasic data={data}/>
                </div>

            </section>
        </div>
    );
}

