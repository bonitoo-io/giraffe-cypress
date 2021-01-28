import Head from 'next/head'

import dynamic from 'next/dynamic'

const RouteSelect  = dynamic(() => {return import('../../../../components/flightTrack/routeSelect')},{ssr: false});

//let data = [];

/*
//TODO - get data from API
// N.B. this is a service method from NextJS

export async function getServerSideProps() {
    const res = await fetch(`http://localhost:3000/api/influx/query2?m=gcCourse&s=-24h&filterf=bearing,lat,lon&filtert=id:VAP2SHA`)

    console.log("DEBUG Query2 res " + JSON.stringify(res));

    const data = await res.json();

    console.log("DEBUG GeoTest getTrackRecords Data: " + JSON.stringify(data));

    return { props: {data} }
}
*/

export default function Home(){

    return(
        <div>
            <Head>
                <title>Flight Tracker</title>
            </Head>

            <section style={{height:"608px", width: "608px" }}>
                <p>Flight tracker</p>

                <div style={{height: "600px", width: "1020px", position: "absolute", top: 50, left: 10}}
                     data-testid='geowidget-track-and-marker'>
                    <br/>
                    <RouteSelect />
                </div>

            </section>
        </div>
    );
}
