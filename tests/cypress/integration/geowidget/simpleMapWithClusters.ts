
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

    it('breaks down clusters on basic zoom in', () => {
        let expectedCounts = [[2,2,2,8,3,2,2,2],[2,5]]
        let expectedColors = [['rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(219, 0, 0)'],
            ['rgb(255, 211, 0)','rgb(255, 79, 0)']
        ]
        //do zoom in once
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
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load

        // check clustered markers
        cy.get('.marker-cluster-custom').then(markers => {
            let visibleCt = 0;
            cy.log('DEBUG markers.length ' + markers.length)
            for(let i = 0; i < 12; i++){
                //cy.log(`${i} is visible: ${markers.eq(i).is(':visible')}`)
                if(markers.eq(i).is(':visible')){
                    cy.get('.marker-cluster-custom > div')
                        .eq(i)
                        .should('have.css','background-color', expectedColors[1][visibleCt])
                    expect(parseInt(markers.eq(i).text()))
                        .to.equal(expectedCounts[1][visibleCt++]);
                }
            }
            expect(visibleCt).to.equal(2)
        })

        //check individual markers
        cy.get('.leaflet-marker-icon > svg').then(markers => {
            cy.log('DEBUG svg markers.length ' + markers.length);
            let visibleCt = 0;
            let expectedMarkerColors = ['#db0000']
            for(let i = 0; i < 16; i++){
                if(markers.eq(i).is(':visible')){
                    expect(markers.eq(i).find('path').attr('fill'))
                        .to
                        .equal(expectedMarkerColors[visibleCt++]);
                }
            }
            expect(visibleCt).to.equal(1);
        })


    })

    it('aggregates clusters on basic zoom out', () => {
        let expectedCounts = [[9,10,5,13,3,10,4,5],[9,29,13,9],[60]]
        let expectedColors = [['rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)'
            ],
            ['rgb(255, 79, 0)',
                'rgb(255, 79, 0)',
                'rgb(255, 211, 0)',
                'rgb(255, 79, 0)',
            ],
            ['rgb(255, 79, 0)']
        ]

        //check baseline
        cy.get('.marker-cluster-custom').then(markers => {
            let visibleCt = 0;
            for(let i = 0; i < 8; i++){
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

        cy.get('.leaflet-marker-icon > svg').then(markers => {
            cy.log('DEBUG svg markers.length ' + markers.length);
            let visibleCt = 0;
            let expectedMarkerColors = ['#FFD300']
            for(let i = 0; i < 8; i++){
                if(markers.eq(i).is(':visible')){
                    expect(markers.eq(i).find('path').attr('fill'))
                        .to
                        .equal(expectedMarkerColors[visibleCt++]);
                }
            }
            expect(visibleCt).to.equal(1);
        })
        //zoom out once
        cy.get('[title=\'Zoom out\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load

        //Check clustered markers
        cy.get('.marker-cluster-custom').then(markers => {
            let visibleCt = 0;
            for(let i = 0; i < 4; i++){
                //cy.log(`${i} is visible: ${markers.eq(i).is(':visible')}`)
                if(markers.eq(i).is(':visible')){
                    cy.get('.marker-cluster-custom > div')
                        .eq(i)
                        .should('have.css','background-color', expectedColors[1][visibleCt])
                    expect(parseInt(markers.eq(i).text()))
                        .to.equal(expectedCounts[1][visibleCt++]);
                }
            }
            expect(visibleCt).to.equal(4)
        })

        cy.get('.leaflet-marker-icon > svg').should('have.lengthOf', 0)

        //zoom out again
        cy.get('[title=\'Zoom out\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load

        //Check clustered markers
        cy.get('.marker-cluster-custom').then(markers => {
            let visibleCt = 0;
            for(let i = 0; i < 1; i++){
                //cy.log(`${i} is visible: ${markers.eq(i).is(':visible')}`)
                if(markers.eq(i).is(':visible')){
                    cy.get('.marker-cluster-custom > div')
                        .eq(i)
                        .should('have.css','background-color', expectedColors[2][visibleCt])
                    expect(parseInt(markers.eq(i).text()))
                        .to.equal(expectedCounts[2][visibleCt++]);
                }
            }
            expect(visibleCt).to.equal(1)
        })

        cy.get('.leaflet-marker-icon > svg').should('have.lengthOf', 0)

    })

    it('expands and zooms clustered markers on click', () => {

        let expectedCounts = [[2,8,3,2],[2,5],[4]]
        let expectedColors = [['rgb(255, 211, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)',
            'rgb(255, 79, 0)'],
            ['rgb(255, 211, 0)',
             'rgb(255, 79, 0)'],
            ['rgb(255, 79, 0)']
        ]

        //TODO - Better wait
        //zoom in on largest cluster
        cy.get('.marker-cluster-custom').eq(3).click().wait(3000) // level 9 - visible 4 clustered 2 markers
        //check level
        cy.get('.leaflet-tile-container > img').eq(0).invoke('attr','src').then(url => {
            cy.parseLeafletTileSrc(url as string).should(src => {
                expect(src.layer).to.equal(9);
            })
        })

        //TODO - refactor following into generalized method
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
            expect(visibleCt).to.equal(4)
        })

        //TODO - refactor following into generalized method
        //check individual markers
        cy.get('.leaflet-marker-icon > svg').then(markers => {
            cy.log('DEBUG svg markers.length ' + markers.length);
            let visibleCt = 0;
            let expectedMarkerColors = ['#db0000',
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

        //TODO - better wait
        //zoom in on largest cluster of result
        cy.get('.marker-cluster-custom').eq(7).click().wait(3000) // level 11 - visible 1 cluster 4 markers
        cy.get('.leaflet-tile-container > img').eq(0).invoke('attr','src').then(url => {
            cy.parseLeafletTileSrc(url as string).should(src => {
                expect(src.layer).to.equal(11);
            })
        })

        // Check cluster markers
        cy.get('.marker-cluster-custom').then(markers => {
            let visibleCt = 0;
            for(let i = 0; i < 2; i++){
                //cy.log(`${i} is visible: ${markers.eq(i).is(':visible')}`)
                if(markers.eq(i).is(':visible')){
                    cy.get('.marker-cluster-custom > div')
                        .eq(i)
                        .should('have.css','background-color', expectedColors[2][visibleCt])
                    expect(parseInt(markers.eq(i).text()))
                        .to.equal(expectedCounts[2][visibleCt++]);
                }
            }
            expect(visibleCt).to.equal(1)
        })

        //check individual markers
        cy.get('.leaflet-marker-icon > svg').then(markers => {
            cy.log('DEBUG svg markers.length ' + markers.length);
            let visibleCt = 0;
            let expectedMarkerColors = ['#db0000',
                '#FF4F00',
                '#006d6f',
                '#006d6f']
            for(let i = 0; i < 6; i++){
                if(markers.eq(i).is(':visible')){
                    expect(markers.eq(i).find('path').attr('fill'))
                        .to
                        .equal(expectedMarkerColors[visibleCt++]);
                }
            }
            expect(visibleCt).to.equal(4);
        })

        //TODO better wait
          //zoom in on only cluster remaining
        cy.get('.marker-cluster-custom').eq(0).click().wait(3000) // level 13 - visible 0 cluster 4 markers
        cy.get('.leaflet-tile-container > img').eq(0).invoke('attr','src').then(url => {
            cy.parseLeafletTileSrc(url as string).should(src => {
                expect(src.layer).to.equal(13);
            })
        })

        cy.get('.marker-cluster-custom').should('have.lengthOf', 0)

        //check individual markers
        cy.get('.leaflet-marker-icon > svg').then(markers => {
            cy.log('DEBUG svg markers.length ' + markers.length);
            let visibleCt = 0;
            let expectedMarkerColors = ['#FF4F00',
                '#FF4F00',
                '#FF4F00',
                '#db0000']
            for(let i = 0; i < 5; i++){
                if(markers.eq(i).is(':visible')){
                    expect(markers.eq(i).find('path').attr('fill'))
                        .to
                        .equal(expectedMarkerColors[visibleCt++]);
                }
            }
            expect(visibleCt).to.equal(4);
        })


    })
})
