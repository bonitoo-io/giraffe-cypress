before(() => {
    cy.resetDB();
})

describe('GeoWidget - S2 - Map with Circles', () => {

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/futuroscope01.lp')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () => {
        cy.visit('/geowidget/hash/geoHashCircles')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('loads the map', () => {
        cy.log('map loaded')
        cy.get('[data-testid=geowidget-hash-cirlces]').should('be.visible');
        //TODO add png compare test once #440 is fixed
    })

    it('can retrieve S2 style datapoints', () => {

        cy.log('switch to S2')
        cy.get('[data-testid=select-mode]').select('S2 - Geometry');
        cy.get('[data-testid=s2_1]').scrollIntoView().should('have.text','47f934d2a3cb');
        cy.get('[data-testid=s2_3]').scrollIntoView().should('have.text', '4807303260c9');
        cy.get('[data-testid=s2_5]').scrollIntoView().should('have.text','47fda9e43c2b');
        cy.get('[data-testid=select-s2depth]').select('4');

        //TODO better wait
        cy.wait(500)

        cy.get('[data-testid=s2_1]').should('have.text', '47f');
        cy.get('[data-testid=s2_3]').should('have.text', '481');
        cy.get('[data-testid=s2_5]').should('have.text', '47f');

        cy.get('[data-testid=select-s2depth]').select('10');

        //TODO better wait
        cy.wait(500)

        cy.get('[data-testid=s2_1]').should('have.text', '47f935');
        cy.get('[data-testid=s2_3]').should('have.text', '480731');
        cy.get('[data-testid=s2_5]').should('have.text', '47fda9');

        cy.get('[data-testid=select-s2depth]').select('22');

        //TODO better wait
        cy.wait(500)

        cy.get('[data-testid=s2_1]').scrollIntoView().should('have.text','47f934d2a3cb');
        cy.get('[data-testid=s2_3]').scrollIntoView().should('have.text', '4807303260c9');
        cy.get('[data-testid=s2_5]').scrollIntoView().should('have.text','47fda9e43c2b');

    })
})
