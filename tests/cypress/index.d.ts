
import {
    addTimestampToRecs,
    datagenFromLPFixture,
    echoValue,
    parseLeafletTileSrc,
    parseSVGPathD,
    calcSVGPointDistance,
    pan
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
        }
    }
}
