

before(() => {
    cy.resetDB();
})

describe('GeoWidget - Basic - HeatMap', () => {

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/futuroscope02.lp', '-60m', '1m')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () => {
        cy.visit('/geowidget/basic/simpleHeatMap')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('successfully loads - Chrome', {browser: '!firefox'}, () => {
        //To update image file
        // 1. uncomment this line
        // 2. run once
        // 3. add updated image to git
//        cy.saveCanvasToPNG('cypress/fixtures/images/simpleHeatMapSuccessfullyLoadsChrome.png')

        cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapSuccessfullyLoadsChrome.png');

    })

    it('successfully loads - Firefox', {browser: 'firefox'}, () => {
        //To update image file
        // 1. uncomment this line
        // 2. run once
        // 3. add updated image to git
//        cy.saveCanvasToPNG('cypress/fixtures/images/simpleHeatMapSuccessfullyLoadsFFox.png')

        cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapSuccessfullyLoadsFFox.png');

    })




})
