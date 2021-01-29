before(() => {
    cy.resetDB();
})

describe('GeoWidget - flightPaths', () => {
    console.log('GeoWidget - flightPaths')

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/geosyd2sfo.lp', '-1440m', '40m')
        cy.wait(1000) //wait for backend to process data
        cy.datagenFromLPFixture('influx/geovap2sha.lp', '-1440m', '40m')
        cy.wait(1000) //wait for backend to process data
        cy.datagenFromLPFixture('influx/geoush2pth.lp', '-1440m', '40m')
        cy.wait(1000) //wait for backend to process data
        cy.datagenFromLPFixture('influx/geofbk2ask.lp',  '-1440m', '40m')
        cy.wait(1000) //wait for backend to process data
        cy.datagenFromLPFixture('influx/geobua2bjn.lp',  '-1440m', '40m')
        cy.wait(1000) //wait for backend to process data
        cy.datagenFromLPFixture('influx/geospm2kgl.lp',  '-1440m', '40m')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () => {
        cy.visit('/geowidget/tracks/flightPaths')
        cy.viewport(1280, 800)
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('draws track across dateline east to west - Chrome', {browser: '!firefox'}, () => {
        //TODO set initial image for comparison
        //To update image file
        // 1. uncomment this line
        // 2. run once
        // 3. add updated image to git
//        cy.saveCanvasToPNG('cypress/fixtures/images/simpleHeatMapSuccessfullyLoadsChrome.png')
        cy.wait(2000)
        console.log('successfully draws track across dateline east to west  - Chrome - TODO')
    })

    it('draws track across dateline west to east - Chrome', {browser: '!firefox'}, () => {

        cy.get('#syd2sfo').click().then(() => {
            cy.wait(2000) // TODO better wait
            console.log('successfully draws track across dateline west to east');
        })


    })


    it('draws track across north pole  - Chrome', {browser: '!firefox'}, () => {

        cy.get('#fbk2ask').click().then(() => {
            cy.wait(2000) // TODO better wait
            console.log('successfully draws track across north pole');
        })

    })

    it('draws track across south pole  - Chrome', {browser: '!firefox'}, () => {

        cy.get('#ush2pth').click().then(() => {
            cy.wait(2000) // TODO better wait
            console.log('successfully draws track across south pole');
        })

    })

    it('draws track across prime meridian  - Chrome', {browser: '!firefox'}, () => {

        cy.get('#bua2bjn').click().then(() => {
            cy.wait(2000) // TODO better wait
            console.log('successfully draws track across prime meridian');
            //To update image file
            // 1. uncomment this line
            // 2. run once
            // 3. add updated image to git
            // TODO add saveSVGToPNG the use to compare - track is not a canvas
//            cy.saveCanvasToPNG('cypress/fixtures/images/bua2bjnChrome.png')

        })

    })

    it('draws DOMTOM test track  - Chrome', {browser: '!firefox'}, () => {

        cy.get('#spm2kgl').click().then(() => {
            cy.wait(2000) // TODO better wait
            console.log('successfully draws DOMTOM track');
        })


    })

})
