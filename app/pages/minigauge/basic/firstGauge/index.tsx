import Head from 'next/head'

import dynamic from "next/dynamic";
import {API_GET_PARAM_TEST_TYPE_VALUES, fetchQuery} from "../../../api/influx/query";

const GaugeMini = dynamic(() => {return import('../../../../components/GaugeMini')},{ssr: false});

let data = [];

export async function getServerSideProps(){

    const res = await fetchQuery(API_GET_PARAM_TEST_TYPE_VALUES.gauge_mini)

    console.log("DEBUG GeoTest res XXX " + res);

    //const data = {}
    const data = await res.json();

    console.log("DEBUG GeoTest getServerSideProps Data XXX: " + JSON.stringify(data));
    return {props: {data} }
}

export default function Home({ data }){
    return(
        <div>
            <Head>
                <title>Hello Minigauge</title>
            </Head>
                <section style={{height:"608px", width: "608px" }}>
                    <p>Minigauge</p>
                    <div style={{height: "600px", width: "600px", position: "absolute", top: 0, left: 0}}>
                        <GaugeMini data={data}/>
                    </div>

                </section>
        </div>
    );
}