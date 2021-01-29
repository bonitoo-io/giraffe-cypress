import React, {useState, useEffect} from "react";

import dynamic from 'next/dynamic'
import Head from "next/head";

const RouteTracker = dynamic(() => {return import('./routeTracker')},{ssr: false});

let data = [];

let firstLoad = true;

export function testCBack(response){
    console.log(`DEBUG response ${response}`)
    data = JSON.parse(response);
}

export function testFetch(id){
    const httpReq = new XMLHttpRequest()
    httpReq.onreadystatechange = function() {
        if(httpReq.readyState === 4){
            testCBack(httpReq.response)
        }
    }
    httpReq.open("GET",`http://localhost:3000/api/influx/query2?m=gcCourse&s=-24h&filterf=bearing,lat,lon&filtert=id:${id}`)
    httpReq.send();
}

function makeInfluxReq(method, url){
    return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function(){
            if(this.status >= 200 && this.status <= 300){
                resolve(xhr.response)
            }else{
                reject({
                    status: this.status,
                    statusText: this.statusText
                })
            }
        }
        xhr.onerror = function(){
            reject({
                status: this.status,
                statusText: this.statusText
            })
        }
        xhr.send();
    })
}

function RouteSelect() {

    const [route, setRoute] = useState('VAP2SHA,0,180')
    const [data, setData] = useState({lat: 0.0, lon: 0.0, values: []});

    const handleChange= (e)=>{
        console.log(`DEBUG e.target.value ${e.target.value}`)
        setRoute(e.target.value)
        let params = e.target.value.split(',')
        //testFetch(route);
        makeInfluxReq('GET',
            `http://localhost:3000/api/influx/query2?m=gcCourse&s=-36h&filterf=bearing,lat,lon&filtert=id:${params[0]}`)
            .then((resolve) => {
                setData({lat: parseFloat(params[1]), lon: parseFloat(params[2]), values: JSON.parse(resolve as string)})
            })
    }

    //componentDidMount()
    if(firstLoad){
        let params = route.split(',')
        makeInfluxReq('GET',
            `http://localhost:3000/api/influx/query2?m=gcCourse&s=-36h&filterf=bearing,lat,lon&filtert=id:${params[0]}`)
            .then((resolve) => {
                setData({lat: parseFloat(params[1]), lon: parseFloat(params[2]), values:  JSON.parse(resolve as string)})
                console.log(`DEBUG makeInfluxReq data ${JSON.stringify(data)}`)
            })
        //testFetch(route);
        firstLoad = false;
    }

        return (
            <div>
               <form>
                   <input type="radio" value="VAP2SHA,0,180" id="vap2sha"
                          onChange={handleChange} name="route" defaultChecked/>
                          <label>VAP-&gt;SHA</label>
                   <input type="radio" value="SYD2SFO,0,180" id="syd2sfo"
                          onChange={handleChange} name="route"/>
                   <label>SYD-&gt;SFO</label>
                   <input type="radio" value="USH2PTH,-45,-135" id="ush2pth"
                          onChange={handleChange} name="route"/>
                   <label>USH-&gt;PTH</label>
                   <input type="radio" value="FBK2ASK,45,-45" id="fbk2ask"
                          onChange={handleChange} name="route"/>
                   <label>FBK-&gt;ASK</label>
                   <input type="radio" value="BUA2BJN,0,-60" id="bua2bjn"
                          onChange={handleChange} name="route"/>
                   <label>BUA-&gt;BJN</label>
                   <input type="radio" value="SPM2KGL,0,0" id="spm2kgl"
                          onChange={handleChange} name="route"/>
                   <label>SPM-&gt;KGL</label>
               </form>
                <p>Selected route is <em>{route}</em></p>
                <div>
                    <Head>
                        <title>Flight {route.split(',')[0]}
                         &nbsp;Centered at {route.split(',')[1]}:
                            {route.split(',')[2]}</title>
                    </Head>

                    <section style={{height:"608px", width: "608px" }}>
                        <p>Flight tracker</p>

                        <div style={{height: "600px", width: "1020px", position: "absolute", top: 100, left: 10}}
                             data-testid='geowidget-track-and-marker'>
                            <br/>
                            <RouteTracker data={data}/>
                        </div>

                    </section>
                </div>

            </div>

        )
}


export default RouteSelect;
