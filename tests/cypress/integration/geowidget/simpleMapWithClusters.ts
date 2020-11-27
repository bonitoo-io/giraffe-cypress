
before(() => {
        cy.resetDB();
})

function verifyClusterVisibleCounts(selector: string, expected: number[]){
    cy.get(selector).then(elems => {
        let visibleCt = 0;

        for(let i = 0; i < elems.length; i++){
            if(elems.eq(i).is(':visible')){
                expect(parseInt(elems.eq(i).text()))
                    .to.equal(expected[visibleCt++]);
            }
        }
        expect(visibleCt).to.equal(expected.length)
    })
}

function verifyClusterVisibleColors(selector: string, expected: string[]){
    cy.get(selector).then(elems => {
        let visibleCt = 0;
        for(let i = 0; i < elems.length; i++){
            if(elems.eq(i).is(':visible')){
                expect(elems[i]).to.have.css('background-color', expected[visibleCt++])
            }
        }
    })
}

function verifyMarkerVisibleColors(selector: string, expected: string[]){
    cy.get(selector).then(markers => {
        let visibleCt = 0;
        for(let i = 0; i < markers.length; i++){
            if(markers.eq(i).is(':visible')){
                expect(markers.eq(i).find('path').attr('fill'))
                    .to
                    .equal(expected[visibleCt++]);
            }
        }
    })
}

function verifyMarkerVisibleCount(selector: string, expected: number){
    cy.get(selector).then(markers => {
        let visibleCt = 0;
        for(let i = 0; i < markers.length; i++){
            if(markers.eq(i).is(':visible')) {
                visibleCt++;
            }
        }
        expect(visibleCt).to.equal(expected);
    })
}

function verifyMapLevel(level: number){
    cy.get('.leaflet-tile-container > img').eq(0).invoke('attr','src').then(url => {
        cy.parseLeafletTileSrc(url as string).should(src => {
            expect(src.layer).to.equal(level);
        })
    })
}

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

    it('breaks down clusters on basic zoom in', () => {

        //do zoom in once
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(3000) //wait for zoom to load

        // Check cluster markers
        verifyClusterVisibleCounts('.marker-cluster-custom',[2,2,2,8,3,2,2,2]);
        verifyClusterVisibleColors('.marker-cluster-custom > div', ['rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(219, 0, 0)']);

        //check individual markers
        verifyMarkerVisibleColors('.leaflet-marker-icon > svg', ['#FFD300', '#db0000'])
        verifyMarkerVisibleCount('.leaflet-marker-icon > svg', 2)
        // Zoom Again

        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load

        // check clustered markers
        verifyClusterVisibleCounts('.marker-cluster-custom',[2,5]);
        verifyClusterVisibleColors('.marker-cluster-custom > div', ['rgb(255, 211, 0)','rgb(255, 79, 0)']);

        //check individual markers
        verifyMarkerVisibleColors('.leaflet-marker-icon > svg', ['#db0000']);
        verifyMarkerVisibleCount('.leaflet-marker-icon > svg', 1);

    })

    it('aggregates clusters on basic zoom out', () => {

        //check baseline
        verifyClusterVisibleCounts('.marker-cluster-custom',[9,10,5,13,3,10,4,5]);
        verifyClusterVisibleColors('.marker-cluster-custom > div', ['rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)'
        ]);

        verifyMarkerVisibleColors('.leaflet-marker-icon > svg', ['#FFD300']);
        verifyMarkerVisibleCount('.leaflet-marker-icon > svg', 1);

        //zoom out once
        cy.get('[title=\'Zoom out\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load

        //Check clustered markers
        verifyClusterVisibleCounts('.marker-cluster-custom',[9,29,13,9]);
        verifyClusterVisibleColors('.marker-cluster-custom > div', ['rgb(255, 79, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
        ]);

        //All markers should be clustered
        cy.get('.leaflet-marker-icon > svg').should('have.lengthOf', 0)

        //zoom out again
        cy.get('[title=\'Zoom out\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load

        //Check clustered markers
        verifyClusterVisibleCounts('.marker-cluster-custom',[60]);
        verifyClusterVisibleColors('.marker-cluster-custom > div', ['rgb(255, 79, 0)']);

        //All markers should be clustered
        cy.get('.leaflet-marker-icon > svg').should('have.lengthOf', 0)

    })

    it('expands and zooms clustered markers on click', () => {

        //TODO - Better wait
        //zoom in on largest cluster
        cy.get('.marker-cluster-custom').eq(3).click().wait(2000) // level 9 - visible 4 clustered 2 markers
        //cy.get('.marker-cluster-custom').eq(3).click().should('not.exist'); //i.e. wait for marker to detach
        //check level
        verifyMapLevel(9)

        // Check cluster markers
        verifyClusterVisibleCounts('.marker-cluster-custom',[2,8,3,2]);
        verifyClusterVisibleColors('.marker-cluster-custom > div', ['rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)']);

        //check individual markers
        verifyMarkerVisibleColors('.leaflet-marker-icon > svg', ['#db0000', '#db0000']);
        verifyMarkerVisibleCount('.leaflet-marker-icon > svg',  2);

        //TODO - better wait
        //zoom in on largest cluster of result
        cy.get('.marker-cluster-custom').eq(7).click().wait(2000) // level 11 - visible 1 cluster 4 markers
        //cy.get('.marker-cluster-custom').eq(7).click().should('not.exist') // e,g wait for marker to detach

        //verify new map level
        verifyMapLevel(11)

        // Check cluster markers
        verifyClusterVisibleCounts('.marker-cluster-custom',[4]);
        verifyClusterVisibleColors('.marker-cluster-custom > div', ['rgb(255, 79, 0)']);

        //check individual markers
        verifyMarkerVisibleColors('.leaflet-marker-icon > svg', ['#db0000',
            '#FF4F00',
            '#006d6f',
            '#006d6f']);
        verifyMarkerVisibleCount('.leaflet-marker-icon > svg',  4);

        //TODO better wait
          //zoom in on only cluster remaining
        cy.get('.marker-cluster-custom').eq(0).click().wait(2000) // level 13 - visible 0 cluster 4 markers
        //cy.get('.marker-cluster-custom').eq(0).click().should('not.exist') // e,g wait for marker to detach

        //verify new map level
        verifyMapLevel(13)

        //should be no clusters
        cy.get('.marker-cluster-custom').should('have.lengthOf', 0)

        //check individual markers
        verifyMarkerVisibleColors('.leaflet-marker-icon > svg', ['#FF4F00',
            '#FF4F00',
            '#FF4F00',
            '#db0000']);
        verifyMarkerVisibleCount('.leaflet-marker-icon > svg',  4);

    })
})
