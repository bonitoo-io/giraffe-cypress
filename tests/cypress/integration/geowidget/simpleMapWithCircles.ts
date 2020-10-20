
describe('GeoWidget - Basic - Map with Circles', () => {

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/futuroscope01.lp')
        cy.wait(1000) //wait for backend to process data
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('successfully loads', () => {
        cy.visit('/geowidget/basic/simpleMapWithCircles') // change URL to match your dev URL
        cy.get('[data-testid=geowidget-circles]').should('be.visible');

        //verify circle count
        cy.get('g > path').should('have.length', 7).each(path => {
            cy.parseSVGPathD(path.attr('d') as string)
                .should(($def) => {
                    //verify each circle is a circle
                    expect($def.moves.length).to.equal(1)
                    expect($def.arcs.length).to.equal(2)
                })
        });
        //verify leaflet tile count
        cy.get('div.leaflet-tile-container > img').should('have.length', 9).each(img => {

            //cy.task('log', `DEBUG imgs ${JSON.stringify(img)}`);
            cy.parseLeafletTileSrc(img.attr('src') as string)
                .should(($src) => {
                    expect($src.layer).to.equal(8);
                })
        })

    })
})
