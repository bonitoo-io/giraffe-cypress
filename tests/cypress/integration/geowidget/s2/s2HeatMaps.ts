before(() => {
    cy.resetDB();
})

describe('GeoWidget - S2 - Heat Map', () => {

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ied = Cypress.config("imageExpectedDir");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const iad = Cypress.config("imageActualDir");

    const screenshotCompareDir = `./cypress/screenshots/geowidget/s2/s2HeatMaps.ts/${iad}`

    before('Load Data', () => {
        cy.task('cleanDir', screenshotCompareDir);
        cy.datagenFromLPFixture('influx/futuroscope02.lp')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () => {
        cy.visit('/geowidget/hash/s2HeatMap')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('loads the map', () => {
        cy.log('load map test')

        cy.waitForLeaflet()
        cy.wait(1000) // wait an extra second - can be slow
        cy.get('[data-testid=geowidget-hash-heatMap]').should('be.visible');
        cy.get('div.geo > div').screenshot(iad +'/s2HeatMapLoad00');
        cy.comparePNGFiles(`${ied}/s2/heatMap/s2HeatMapLoad00.png`,
            `${screenshotCompareDir}/s2HeatMapLoad00.png`)
    })

    it('can retrieve S2 style datapoints', () => {

        cy.log('switch to S2')
        cy.get('[data-testid=select-mode]').select('S2 - Geometry');
        cy.get('[data-testid=s2_1]').scrollIntoView().should('have.text','47fe3279ecdd');
        cy.get('[data-testid=s2_7]').scrollIntoView().should('have.text', '480140585561');
        cy.get('[data-testid=s2_19]').scrollIntoView().should('have.text','4806ac29d4c9');
        cy.get('[data-testid=select-ints]').select('5');

        cy.waitForLeaflet()
        cy.get('div.geo > div').screenshot(iad +'/s2HeatMap01');
        cy.comparePNGFiles(`${ied}/s2/heatMap/s2HeatMap01.png`,
            `${screenshotCompareDir}/s2HeatMap01.png`)

        cy.get('[data-testid=s2_1]').should('have.text', '47fc');
        cy.get('[data-testid=s2_7]').should('have.text', '4804');
        cy.get('[data-testid=s2_19]').should('have.text', '4804');

        cy.get('[data-testid=select-ints]').select('10');

        cy.waitForLeaflet()
        cy.get('div.geo > div').screenshot(iad +'/s2HeatMap02');
        cy.comparePNGFiles(`${ied}/s2/heatMap/s2HeatMap02.png`,
            `${screenshotCompareDir}/s2HeatMap02.png`)

        cy.get('[data-testid=s2_1]').should('have.text', '47fe33');
        cy.get('[data-testid=s2_7]').should('have.text', '480141');
        cy.get('[data-testid=s2_19]').should('have.text', '4806ad');

        cy.get('[data-testid=select-ints]').select('22');

        cy.waitForLeaflet()
        cy.get('div.geo > div').screenshot(iad +'/s2HeatMap03');
        cy.comparePNGFiles(`${ied}/s2/heatMap/s2HeatMap03.png`,
            `${screenshotCompareDir}/s2HeatMap03.png`)

        cy.get('[data-testid=s2_1]').scrollIntoView().should('have.text','47fe3279ecdd');
        cy.get('[data-testid=s2_7]').scrollIntoView().should('have.text', '480140585561');
        cy.get('[data-testid=s2_19]').scrollIntoView().should('have.text','4806ac29d4c9');

    })

})
