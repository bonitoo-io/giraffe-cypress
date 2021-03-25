before(() => {
    cy.resetDB();
})

describe('GeoWidget - S2 - Map with Circles', () => {

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ied = Cypress.config("imageExpectedDir");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const iad = Cypress.config("imageActualDir");
    const defaultWait = 1000;
    const screenshotCompareDir = `./cypress/screenshots/geowidget/s2/s2Circles.ts/${iad}`


    before('Load Data', () => {
        cy.task('cleanDir', screenshotCompareDir);
        cy.datagenFromLPFixture('influx/futuroscope01.lp')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () => {
        cy.visit('/geowidget/hash/s2Circles')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('loads the map', () => {
        //cy.wait(defaultWait * 3) //wait for .leaflet-animated fade ins to complete and first load
        cy.waitForLeaflet()
        cy.wait(1000) // wait an extra second - can be slow
        cy.get('[data-testid=geowidget-hash-cirlces]').should('be.visible');
        cy.get('div.geo > div').screenshot(iad +'/s2CircleLoad00');
        cy.comparePNGFiles(`${ied}/s2/s2Circles/s2CircleLoad00.png`,
            `${screenshotCompareDir}/s2CircleLoad00.png`)

    })

    it('can retrieve S2 style datapoints', () => {

        cy.log('switch to S2')
        cy.get('[data-testid=select-mode]').select('S2 - Geometry');
        cy.get('[data-testid=s2_1]').scrollIntoView().should('have.text','47f934d2a3cb');
        cy.get('[data-testid=s2_3]').scrollIntoView().should('have.text', '4807303260c9');
        cy.get('[data-testid=s2_5]').scrollIntoView().should('have.text','47fda9e43c2b');
        cy.get('[data-testid=select-ints]').select('5');

        cy.waitForLeaflet()
        cy.get('div.geo > div').screenshot(iad +'/s2Circle01');
        cy.comparePNGFiles(`${ied}/s2/s2Circles/s2Circle01.png`,
            `${screenshotCompareDir}/s2Circle01.png`)

        cy.get('[data-testid=s2_1]').should('have.text', '47fc');
        cy.get('[data-testid=s2_3]').should('have.text', '4804');
        cy.get('[data-testid=s2_5]').should('have.text', '47fc');

        cy.get('[data-testid=select-ints]').select('10');

        cy.waitForLeaflet()
        cy.get('div.geo > div').screenshot(iad +'/s2Circle02');
        cy.comparePNGFiles(`${ied}/s2/s2Circles/s2Circle02.png`,
            `${screenshotCompareDir}/s2Circle02.png`)

        cy.get('[data-testid=s2_1]').should('have.text', '47f935');
        cy.get('[data-testid=s2_3]').should('have.text', '480731');
        cy.get('[data-testid=s2_5]').should('have.text', '47fda9');

        cy.get('[data-testid=select-ints]').select('22');

        cy.waitForLeaflet()
        cy.get('div.geo > div').screenshot(iad +'/s2Circle03');
        cy.comparePNGFiles(`${ied}/s2/s2Circles/s2Circle03.png`,
            `${screenshotCompareDir}/s2Circle03.png`)

        cy.get('[data-testid=s2_1]').scrollIntoView().should('have.text','47f934d2a3cb');
        cy.get('[data-testid=s2_3]').scrollIntoView().should('have.text', '4807303260c9');
        cy.get('[data-testid=s2_5]').scrollIntoView().should('have.text','47fda9e43c2b');

    })
})
