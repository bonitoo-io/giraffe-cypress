import React, {useState} from "react";

import dynamic from 'next/dynamic'

const GaugeMiniProgress = dynamic(() => {return import('./GaugeMiniProgress')},{ssr: false});

function GaugeMiniProgressControl ({data}) {

    const [step, setStep] = useState(0)

    return(
        <div>
            <div><form>
                <input type="button" id='charger' value="charge"
                       onClick={() => setStep((step + 1) % 10)} />
                <span>&nbsp;Step {step}</span>
            </form>
            </div>
            <section style={{height:"608px", width: "608px" }}>
                <p>Minigauge Progress Bar</p>
                <div style={{height: "600px", width: "600px", position: "absolute", top: 30, left: 0}}>
                    <GaugeMiniProgress data={data} count={step}/>
                </div>

            </section>

        </div>
    )
}

export default GaugeMiniProgressControl;
