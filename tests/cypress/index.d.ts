
import {
    addTimestampToRecs,
    datagenFromLPFixture,
    echoValue
} from './support/commands'

declare global {
    namespace Cypress {
        interface Chainable {
            addTimestampToRecs: typeof addTimestampToRecs
            datagenFromLPFixture: typeof datagenFromLPFixture
            echoValue: typeof echoValue
        }
    }
}
