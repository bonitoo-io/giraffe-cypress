import Head from 'next/head'
//import * as DataUtils from 'giraffe-cypress-data';

/*
DataUtils.Utils.query("from(bucket: \"qa\")\n" +
    "  |> range(start: -1h)\n" +
    "  |> filter(fn: (r) => r[\"_measurement\"] == \"myGis\")\n" +
    "  |> last()").then((result) => {
        console.log("DEBUG query:  " + result)
})
*/

export async function getServerSideProps(){

    const res = await fetch(`http://localhost:3000/api/influx/query`)

    console.log("DEBUG res " + res);

    //const data = {}
    const data = await res.json();

    return {props: {data} }
}

export default function Home({ data }){

    return(
     <div>
      <Head>
        <title>Hello Basic</title>
      </Head>
      <section>
        <p>Hello World!</p>
          <pre># PROPS</pre>
          <pre>{JSON.stringify(data)}</pre>
      </section>
    </div>
    );
}

