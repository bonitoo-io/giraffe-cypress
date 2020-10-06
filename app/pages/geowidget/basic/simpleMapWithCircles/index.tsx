import Head from 'next/head'

import dynamic from 'next/dynamic'

const GiraffeGeoTest = dynamic(() => {return import('../../../../components/GiraffeGeoTest')},{ssr: false});

export default function Home(){

    return(
        <div>
            <Head>
                <title>Simple Map With Circles</title>
            </Head>
            <section>
                <p>Preparing to test Simple Map With Circles</p>
                <div style={{height: "600px", width: "600px", position: "absolute", top: 0, left: "601px"}}>
                    <GiraffeGeoTest />
                </div>

            </section>
        </div>
    );
}
