
import {
    addTimestampToRecs,
    datagenFromLPFixture,
    echoValue,
    parseLeafletTileSrc,
    parseSVGPathD,
    calcSVGPointDistance,
    pan,
    calcElementDistance,
    calcHiddenElements,
    calcVisibleElements,
    resetDB,
    compareCanvasElementToFile,
    saveCanvasToPNG
} from './support/commands'

declare global {
    namespace Cypress {
        interface Chainable {
            addTimestampToRecs: typeof addTimestampToRecs
            datagenFromLPFixture: typeof datagenFromLPFixture
            echoValue: typeof echoValue
            parseLeafletTileSrc: typeof parseLeafletTileSrc
            parseSVGPathD: typeof parseSVGPathD
            calcSVGPointDistance: typeof calcSVGPointDistance
            pan: typeof pan
            calcElementDistance: typeof calcElementDistance
            calcHiddenElements: typeof calcHiddenElements
            calcVisibleElements: typeof calcVisibleElements
            resetDB: typeof resetDB
            compareCanvasElementToFile: typeof compareCanvasElementToFile
            saveCanvasToPNG: typeof saveCanvasToPNG
        }
    }
}
