import Head from 'next/head'

import dynamic from 'next/dynamic'

const S2ControlTracks = dynamic(() => {return import('../../../../components/geohash/s2ControlTracks')},{ssr: false});

export default function Home({data}){

    return(
        <div>
            <Head>
                <title>Map With Circles</title>
            </Head>
            <section style={{height:"608px", width: "608px" }}>
                <div style={{height: "600px", width: "600px", position: "absolute", top: 0, left: 0}}
                     data-testid='geowidget-s2-tracks'>
                    <S2ControlTracks />
                </div>

            </section>
        </div>
    );
}
