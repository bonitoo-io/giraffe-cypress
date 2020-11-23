
before(() => {
        cy.resetDB();
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
        for(let i = 0; i < 8; i++){
            cy.get('.marker-cluster-custom').eq(i).trigger('mouseover')
            cy.get(' g > path').should('be.visible')
            cy.get('.marker-cluster-custom').eq(i).trigger('mouseout')
            cy.get(' g > path').should('not.be.visible')
        }
    })

    it('shows cluster marker count at level 8', () => {
        let expectedCounts = [9,10,5,13,3,10,4,5]
        for(let i = 0; i < 8; i++){
            cy.get('div.marker-cluster-custom > div > div').eq(i).contains(expectedCounts[i]);
        }
    })

    it('shows cluster group colors at level 8', () => {
        let expectedColors = ['rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)']
        for(let i = 0; i < 8; i++){
            cy.get('.marker-cluster-custom > div').eq(i).should('have.css','background-color', expectedColors[i])
        }

    })

    //See Giraffe issue 387
    it.skip('shows tooltips for unclustered markers', () => {
       // cy.get('.svg-icon').eq(0).trigger('mouseover');
    })

    it.only('breaks down clusters on basic zoom in', () => {
        //do zoom in once
        let expectedCounts = [[2,2,2,8,3,2,2,2]]
        let expectedColors = [['rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(219, 0, 0)'
        ]]
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load

        // Check cluster markers
        cy.get('.marker-cluster-custom').then(markers => {
            let visibleCt = 0;
            for(let i = 0; i < 17; i++){
                //cy.log(`${i} is visible: ${markers.eq(i).is(':visible')}`)
                if(markers.eq(i).is(':visible')){
                    cy.get('.marker-cluster-custom > div')
                        .eq(i)
                        .should('have.css','background-color', expectedColors[0][visibleCt])
                    expect(parseInt(markers.eq(i).text()))
                        .to.equal(expectedCounts[0][visibleCt++]);
                }
            }
            expect(visibleCt).to.equal(8)
        })

        //check individual markers
        cy.get('.leaflet-marker-icon > svg').then(markers => {
            cy.log('DEBUG svg markers.length ' + markers.length);
            let visibleCt = 0;
            let expectedMarkerColors = ['#FFD300',
                '#db0000']
            for(let i = 0; i < 8; i++){
                if(markers.eq(i).is(':visible')){
                    expect(markers.eq(i).find('path').attr('fill'))
                        .to
                        .equal(expectedMarkerColors[visibleCt++]);
                }
            }
            expect(visibleCt).to.equal(2);
        })
        // Zoom Again
     /*   cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
        cy.get('.marker-cluster-custom').then(markers => {
            let visibleCt = 0;
            cy.log('DEBUG markers.length ' + markers.length)
        }) */

    })

    it.skip('aggregates clusters on zoom out', () => {

    })
})
