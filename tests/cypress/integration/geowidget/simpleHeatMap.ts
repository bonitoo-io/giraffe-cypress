
before(() => {
    cy.resetDB();
})

describe('GeoWidget - Basic - HeatMap', () => {

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/futuroscope02.lp')
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

    it(`zooms in - Chrome`,{browser: '!firefox'}, () => {

        //do zoom twice - to level 10
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
            .click()
            .wait(1000);

        //cy.saveCanvasToPNG('cypress/fixtures/images/simpleHeatMapZoomInChrome.png')

        cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapZoomInChrome.png');

    })

    it(`zooms in - Firefox`,{browser: 'firefox'}, () => {

        //do zoom twice - to level 10
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
            .click()
            .wait(1000);

        //cy.saveCanvasToPNG('cypress/fixtures/images/simpleHeatMapZoomInFFox.png')

        cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapZoomInFFox.png');

    })

    it(`zooms out - Chrome`,{browser: '!firefox'}, () => {

        //do zoom twice - to level 10
        cy.get('[title=\'Zoom out\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
            .click()
            .wait(1000);

        //cy.saveCanvasToPNG('cypress/fixtures/images/simpleHeatMapZoomOutChrome.png')

        cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapZoomOutChrome.png');

    })

    it(`zooms out - Firefox`,{browser: 'firefox'}, () => {

        //do zoom twice - to level 10
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
            .click()
            .wait(1000);

        //cy.saveCanvasToPNG('cypress/fixtures/images/simpleHeatMapZoomOutFFox.png')

        cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapZoomOutFFox.png');

    })


    it(`pans horizontally - Chrome`,{browser: '!firefox'}, () => {

        let dims: {height: number,
            width: number,
            left: number,
            top: number} = {height: 0, width: 0, left: 0, top: 0}

        cy.get('div.giraffe-plot').then(container => {
            cy.log('DEBUG typeof container.height() ' + typeof(container.height()));
            dims.height = container.height() as number;
            dims.width = container.width() as number;
            let offset: JQuery.Coordinates | undefined = container.offset();
            dims.top = offset === undefined ? 0 : offset.top;
            dims.left = offset === undefined ? 0 : offset.left;
        }).wait(1000)
            .then(() => {
                // pan away
                cy.pan('.giraffe-plot', {x: dims.width / 2, y: dims.height / 2}, {
                    x: dims.width - 2,
                    y: dims.height / 2
                }).wait(500)

                //cy.saveCanvasToPNG('cypress/fixtures/images/simpleHeatMapPanHorChrome.png')

                cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapPanHorChrome.png');

                //pan back
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:2,y:dims.height/2})
                    .wait(500)

                cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapSuccessfullyLoadsChrome.png');

            })

    })

    it(`pans horizontally - Firefox`,{browser: 'firefox'}, () => {

        let dims: {height: number,
            width: number,
            left: number,
            top: number} = {height: 0, width: 0, left: 0, top: 0}

        cy.get('div.giraffe-plot').then(container => {
            cy.log('DEBUG typeof container.height() ' + typeof(container.height()));
            dims.height = container.height() as number;
            dims.width = container.width() as number;
            let offset: JQuery.Coordinates | undefined = container.offset();
            dims.top = offset === undefined ? 0 : offset.top;
            dims.left = offset === undefined ? 0 : offset.left;
        }).wait(1000)
            .then(() => {
                // pan away
                cy.pan('.giraffe-plot', {x: dims.width / 2, y: dims.height / 2}, {
                    x: dims.width - 2,
                    y: dims.height / 2
                }).wait(500)

                //cy.saveCanvasToPNG('cypress/fixtures/images/simpleHeatMapPanHorFFox.png')

                cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapPanHorFFox.png');

                //pan back
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:2,y:dims.height/2})
                    .wait(500)

                cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapSuccessfullyLoadsFFox.png');

            })

    })

    it(`pans vertically - Chrome`,{browser: '!firefox'}, () => {

        let dims: {height: number,
            width: number,
            left: number,
            top: number} = {height: 0, width: 0, left: 0, top: 0}

        cy.get('div.giraffe-plot').then(container => {
            cy.log('DEBUG typeof container.height() ' + typeof(container.height()));
            dims.height = container.height() as number;
            dims.width = container.width() as number;
            let offset: JQuery.Coordinates | undefined = container.offset();
            dims.top = offset === undefined ? 0 : offset.top;
            dims.left = offset === undefined ? 0 : offset.left;
        }).wait(1000)
            .then(() => {
                // pan away
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:dims.width/2,y:dims.height - 2})
                    .wait(500)

                //uncomment to update base image
                //cy.saveCanvasToPNG('cypress/fixtures/images/simpleHeatMapPanVerChrome.png')

                cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapPanVerChrome.png');

                //pan back
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:dims.width/2,y:2})
                    .wait(500)

                cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapSuccessfullyLoadsChrome.png');

            })

    })

    it(`pans vertically - Firefox`,{browser: 'firefox'}, () => {

        let dims: {height: number,
            width: number,
            left: number,
            top: number} = {height: 0, width: 0, left: 0, top: 0}

        cy.get('div.giraffe-plot').then(container => {
            cy.log('DEBUG typeof container.height() ' + typeof(container.height()));
            dims.height = container.height() as number;
            dims.width = container.width() as number;
            let offset: JQuery.Coordinates | undefined = container.offset();
            dims.top = offset === undefined ? 0 : offset.top;
            dims.left = offset === undefined ? 0 : offset.left;
        }).wait(1000)
            .then(() => {
                // pan away
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:dims.width/2,y:dims.height - 2})
                    .wait(500)

                //Uncomment to update base image
                //cy.saveCanvasToPNG('cypress/fixtures/images/simpleHeatMapPanVerFFox.png')

                cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapPanVerFFox.png');

                //pan back
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:dims.width/2,y:2})
                    .wait(500)

                cy.compareCanvasElementToFile('cypress/fixtures/images/simpleHeatMapSuccessfullyLoadsFFox.png');

            })

    })



})
