
describe('reset', () => {
    it('resets the database', () => {
        cy.resetDB();
    })
})

describe('GeoWidget - Basic - Marker Clusters', () => {

    before('Reset Data', () => {
        cy.datagenFromLPFixture('influx/futuroscope02.lp')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () => {
        cy.visit('/geowidget/basic/simpleMapWithClusters')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })


    it('first test', () => {
        cy.log('first test')
    })
})
