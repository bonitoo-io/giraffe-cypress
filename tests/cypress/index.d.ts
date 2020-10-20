
import {
    addTimestampToRecs,
    datagenFromLPFixture,
    echoValue,
    parseLeafletTileSrc,
    parseSVGPathD
} from './support/commands'

declare global {
    namespace Cypress {
        interface Chainable {
            addTimestampToRecs: typeof addTimestampToRecs
            datagenFromLPFixture: typeof datagenFromLPFixture
            echoValue: typeof echoValue
            parseLeafletTileSrc: typeof parseLeafletTileSrc
            parseSVGPathD: typeof parseSVGPathD
        }
    }
}
