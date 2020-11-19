
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


    it('loads expected marker elements', () => {
        cy.get('div.leaflet-marker-icon').should('have.length', 9)
        cy.get('.marker-cluster-custom').should('have.length', 8)
        cy.get('.svg-icon').should('have.length', 1)
    })

    it('shows cluster polygons', () => {
        cy.get(' g > path').should('not.be.visible')
        cy.get('.marker-cluster-custom').eq(3).trigger('mouseover')
        cy.get(' g > path').should('be.visible')
        cy.get('.marker-cluster-custom').eq(3).trigger('mouseout')
        cy.get(' g > path').should('not.be.visible')
    })
})
