before(() => {
    cy.resetDB();
})

describe('GeoWidget - Center Map on Markers', () => {

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ied = Cypress.config("imageExpectedDir");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const iad = Cypress.config("imageActualDir");
    const screenshotCompareDir = `./cypress/screenshots/geowidget/simpleMapMarkerCenter.ts/${iad}`


    before('Load Data', () => {
        cy.task('cleanDir', screenshotCompareDir);
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
        cy.waitForLeaflet()
        cy.get('div.geo > div').screenshot(iad +'/CenterMapMarkersFirstLoad');
        cy.comparePNGFiles(`${ied}/simpleMapMarkerCenter/CenterMapMarkersFirstLoad.png`,
            `${screenshotCompareDir}/CenterMapMarkersFirstLoad.png`)
    })

    it('dynamically centers map on latlon datapoints', () => {
        cy.get('[data-testid=lat_1]').click()
        cy.waitForLeaflet()
        cy.wait(1000) //above can be slow 1 time in 10
        cy.get('div.geo > div').screenshot(iad +'/DynamicCenter01');
        cy.comparePNGFiles(`${ied}/simpleMapMarkerCenter/DynamicCenter01.png`,
            `${screenshotCompareDir}/DynamicCenter01.png`)

        cy.get('[data-testid=lon_3]').click()
        cy.waitForLeaflet()

        cy.get('div.geo > div').screenshot(iad +'/DynamicCenter03');
        cy.comparePNGFiles(`${ied}/simpleMapMarkerCenter/DynamicCenter03.png`,
            `${screenshotCompareDir}/DynamicCenter03.png`)

        cy.get('[data-testid=lat_5]').click()
        cy.waitForLeaflet()

        cy.get('div.geo > div').screenshot(iad +'/DynamicCenter05');
        cy.comparePNGFiles(`${ied}/simpleMapMarkerCenter/DynamicCenter05.png`,
            `${screenshotCompareDir}/DynamicCenter05.png`)

        cy.get('[data-testid=btn-recenter]').click()
        cy.waitForLeaflet()

        cy.get('div.geo > div').screenshot(iad +'/DynamicCenterRecenter');
        cy.comparePNGFiles(`${ied}/simpleMapMarkerCenter/DynamicCenterRecenter.png`,
            `${screenshotCompareDir}/DynamicCenterRecenter.png`)

    })

    it('dynamically zooms on centered latlon datapoints', () => {
        cy.waitForLeaflet()
        cy.get('div.geo > div').screenshot(iad +'/DynamicZoom00');
        cy.comparePNGFiles(`${ied}/simpleMapMarkerCenter/DynamicZoom00.png`,
            `${screenshotCompareDir}/DynamicZoom00.png`)

        cy.get('[data-testid=lat_1]').click()
        cy.waitForLeaflet()

        cy.get('[data-testid=select-ints]').select('12')
        cy.waitForLeaflet()
        cy.wait(1000) //this zoom seems slower than others

        cy.get('div.geo > div').screenshot(iad +'/DynamicZoom01');
        cy.comparePNGFiles(`${ied}/simpleMapMarkerCenter/DynamicZoom01.png`,
            `${screenshotCompareDir}/DynamicZoom01.png`)

        cy.get('[data-testid=lon_3]').click() //should still be level 12
        cy.waitForLeaflet()

        cy.get('[data-testid=select-ints]').select('16')
        cy.waitForLeaflet()
        cy.wait(1000) //this zoom seems slower than others
        cy.get('div.geo > div').screenshot(iad +'/DynamicZoom02');
        cy.comparePNGFiles(`${ied}/simpleMapMarkerCenter/DynamicZoom02.png`,
            `${screenshotCompareDir}/DynamicZoom02.png`)

        cy.get('[data-testid=lat_5]').click()
        cy.waitForLeaflet()

        cy.get('[data-testid=select-ints]').select('4') // now zoom out
        cy.waitForLeaflet()

        cy.get('div.geo > div').screenshot(iad +'/DynamicZoom03');
        cy.comparePNGFiles(`${ied}/simpleMapMarkerCenter/DynamicZoom03.png`,
            `${screenshotCompareDir}/DynamicZoom03.png`)

        cy.get('[data-testid=btn-recenter]').click()
        cy.waitForLeaflet()

        cy.get('[data-testid=select-ints]').select('8') // return to baseline
        cy.waitForLeaflet()
        cy.wait(1000)
        cy.get('div.geo > div').screenshot(iad +'/DynamicZoom04');
        cy.comparePNGFiles(`${ied}/simpleMapMarkerCenter/DynamicZoom04.png`,
            `${screenshotCompareDir}/DynamicZoom04.png`)
    })
})
