before(() => {
    cy.resetDB();
})

describe('GeoWidget - Center Map on Markers', () => {

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/futuroscope01.lp')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () => {
        cy.visit('/geowidget/basic/simpleMapMarkersCenter')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('loads the map', () => {
        cy.log('map loaded')
        cy.get('[data-testid=geowidget-markers]').should('be.visible');
        //TODO add png compare test once #440 is fixed
    })

    it('dynamically centers map on latlon datapoints', () => {
        //TODO check baseline PNG comparison
        cy.get('[data-testid=lat_1]').click()
        //TODO png comparison of change after #440 fix
        cy.get('[data-testid=lon_3]').click()
        //TODO png comparison of change
        cy.get('[data-testid=lat_5]').click()
        //TODO png comparison of change
        cy.get('[data-testid=btn-recenter]').click()
        //TODO png comparison of change
    })

    it('dynamically zooms on centered latlon datapoints', () => {
        //TODO check baseline PNG comparison
        cy.get('[data-testid=lat_1]').click()
        cy.get('[data-testid=select-ints]').select('12')
        cy.wait(1000) //give openstreet map time to load
        //TODO png comparison of change after #440 fix
        cy.get('[data-testid=lon_3]').click() //should still be level 12
        //TODO png comparison of change after #440 fix
        cy.get('[data-testid=select-ints]').select('16')
        cy.wait(1000) //give openstreet map time to load
        //TODO png comparison of change after #440 fix
        cy.get('[data-testid=lat_5]').click()
        //TODO png comparison of change after #440 fix
        cy.get('[data-testid=select-ints]').select('4') // now zoom out
        cy.wait(1000) //give openstreet map time to load
        //TODO png comparison of change
        cy.get('[data-testid=btn-recenter]').click()
        //TODO png comparison of change
        cy.get('[data-testid=select-ints]').select('8') // return to baseline
        cy.wait(1000) //give openstreet map time to load
        //TODO png comparison of change
    })


})
