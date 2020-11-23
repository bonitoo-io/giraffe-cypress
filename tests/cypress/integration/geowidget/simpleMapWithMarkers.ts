before(() => {
        cy.resetDB();
})

describe('GeoWidget - Basic - Map with Markers', () => {

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/futuroscope01.lp')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () => {
        cy.visit('/geowidget/basic/simpleMapWithMarkers')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('successfully loads', () => {

        cy.get('[data-testid=geowidget-markers]').should('be.visible');
        //verify marker count
        cy.get('.svg-icon').should('have.length', 7)
        //verify leaflet tiles layer
        cy.get('div.leaflet-tile-container > img').should('have.length', 9).each(img => {

            //cy.task('log', `DEBUG imgs ${JSON.stringify(img)}`);
            cy.parseLeafletTileSrc(img.attr('src') as string)
                .should(($src) => {
                    expect($src.layer).to.equal(8);
                })
        })

    })

    it('zooms in', () => {

        //check distance before zoom
        let lvl8Dist=0
        cy.get('.svg-icon > svg').then(icons => {
            cy.calcElementDistance(icons[3],icons[4]).then(dist => {
                lvl8Dist=dist;
            })
        })

        //do zoom twice - to level 10
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
            .click()
            .wait(1000);

        //Check only 2 markers are visible
        cy.get('.leaflet-container').then(container => {
            cy.get('.svg-icon > svg').then(elems => {

                cy.calcVisibleElements(container,elems).then(count => {
                    expect(count).to.equal(2)
                })

                cy.calcHiddenElements(container,elems).then(count => {
                    expect(count).to.equal(5)
                })
            })
        })

        //Check distance is changed
        let lvl10Dist=0;
        cy.get('.svg-icon > svg').then(icons => {
            cy.calcElementDistance(icons[3],icons[4]).then(dist => {
                lvl10Dist=dist;
                expect(lvl10Dist).to.be.above(lvl8Dist)
            })
        })

        //verify leaflet tiles layer
        cy.get('div.leaflet-tile-container > img').should('have.length', 12).each(img => {

            cy.parseLeafletTileSrc(img.attr('src') as string)
                .should(($src) => {
                    expect($src.layer).to.equal(10);
                })
        })

    })

    it('zooms out', () => {

        //do zoom thrice - to level 11
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
            .click()
            .wait(1000)
            .click()
            .wait(1000);

        let lvl11Dist=0
        cy.get('.svg-icon > svg').then(icons => {
            cy.calcElementDistance(icons[3],icons[4]).then(dist => {
                lvl11Dist=dist;
            })
        })

        //Check only 1 marker is visible
        cy.get('.leaflet-container').then(container => {
            cy.get('.svg-icon > svg').then(elems => {

                cy.calcVisibleElements(container,elems).then(count => {
                    expect(count).to.equal(1)
                })
            })
        })

        //do zoom out 4x - to level 11
        cy.get('[title=\'Zoom out\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
            .click()
            .wait(1000)
            .click()
            .wait(1000)
            .click()
            .wait(1000);

        cy.get('.svg-icon > svg').then(icons => {
            cy.calcElementDistance(icons[3],icons[4]).then(dist => {
                expect(dist).to.be.below(lvl11Dist);
            })
        })

        //Check 7  markers are visible
        cy.get('.leaflet-container').then(container => {
            cy.get('.svg-icon > svg').then(elems => {

                cy.calcVisibleElements(container,elems).then(count => {
                    expect(count).to.equal(7)
                })

                cy.calcHiddenElements(container,elems).then(count => {
                    expect(count).to.equal(0)
                })
            })
        })

        //verify leaflet tiles layer
        cy.get('div.leaflet-tile-container > img').should('have.length', 12).each(img => {

            cy.parseLeafletTileSrc(img.attr('src') as string)
                .should(($src) => {
                    expect($src.layer).to.equal(7);
                })
        })


    })

    it('Pans horizontally', () => {
        let baseDist = 0;
        //check distance before pan
        cy.get('.svg-icon > svg').then(icons => {
            cy.calcElementDistance(icons[3],icons[4]).then(dist => {
                baseDist=dist;
            })
        })

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
                cy.log('DEBUG dims ' + JSON.stringify(dims));

                // pan away
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:dims.width - 2,y:dims.height/2})
                    .wait(500)

                //Check only 4 markers are visible
                cy.get('.leaflet-container').then(container => {
                    cy.get('.svg-icon > svg').then(elems => {

                        cy.calcVisibleElements(container,elems).then(count => {
                            expect(count).to.equal(4)
                        })

                        cy.calcHiddenElements(container,elems).then(count => {
                            expect(count).to.equal(3)
                        })
                    })
                })

                //Check distance unchanged

                cy.get('.svg-icon > svg').then(icons => {
                    cy.calcElementDistance(icons[3],icons[4]).then(dist => {
                        expect(dist).to.equal(baseDist);
                    })
                })

                //pan back
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:2,y:dims.height/2})
                    .wait(500)

                //Check all 7 circles are visible
                cy.get('.leaflet-container').then(container => {
                    cy.get('.svg-icon > svg').then(elems => {

                        cy.calcVisibleElements(container,elems).then(count => {
                            expect(count).to.equal(7)
                        })

                        cy.calcHiddenElements(container,elems).then(count => {
                            expect(count).to.equal(0)
                        })
                    })
                })

                //Check distance unchanged
                cy.get('.svg-icon > svg').then(icons => {
                    cy.calcElementDistance(icons[3],icons[4]).then(dist => {
                        expect(dist).to.equal(baseDist);
                    })
                })
            })
    })

    it('pans vertically', () => {

        let baseDist = 0;
        //check distance before pan
        cy.get('.svg-icon > svg').then(icons => {
            cy.calcElementDistance(icons[3],icons[4]).then(dist => {
                baseDist=dist;
            })
        })

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
                cy.log('DEBUG dims ' + JSON.stringify(dims));

                // pan away
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:dims.width/2,y:dims.height - 2})
                    .wait(500)

                //Check only 4 markers are visible
                cy.get('.leaflet-container').then(container => {
                    cy.get('.svg-icon > svg').then(elems => {

                        cy.calcVisibleElements(container,elems).then(count => {
                            expect(count).to.equal(4)
                        })

                        cy.calcHiddenElements(container,elems).then(count => {
                            expect(count).to.equal(3)
                        })
                    })
                })

                //Check distance unchanged
                cy.get('.svg-icon > svg').then(icons => {
                    cy.calcElementDistance(icons[3],icons[4]).then(dist => {
                        expect(dist).to.equal(baseDist);
                    })
                })

                //pan back
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:dims.width/2,y:2})
                    .wait(500)

                //Check all 7 markers are visible
                cy.get('.leaflet-container').then(container => {
                    cy.get('.svg-icon > svg').then(elems => {

                        cy.calcVisibleElements(container,elems).then(count => {
                            expect(count).to.equal(7)
                        })

                        cy.calcHiddenElements(container,elems).then(count => {
                            expect(count).to.equal(0)
                        })
                    })
                })

                //Check distance unchanged

                cy.get('.svg-icon > svg').then(icons => {
                    cy.calcElementDistance(icons[3],icons[4]).then(dist => {
                        expect(dist).to.equal(baseDist);
                    })
                })

            })

    })

    it('shows a tooltip on focus', () => {
            let svgloc: DOMRect;
            let containerloc: DOMRect;

        //N.B. it seems 'cy.trigger()' only fires events, it does not
        //    'emulate' the cursor.  Popups may not appear in
        //    screenshots or videos because popups follow the actual
        //    cursor.  But the DOM is (should be) changed.
        //
        //will need container rectangle to calculate mouse event locations
        cy.get('.leaflet-container').then(container => {
            containerloc = container[0].getBoundingClientRect();
            //check a handful of  markers
            for(let i = 3; i < 6; i++) {
                cy.get('.svg-icon').eq(i).then(svg => {
                    cy.log('DEBUG svg ' + JSON.stringify(svg[0].getBoundingClientRect()));
                    svgloc = svg[0].getBoundingClientRect();
                    svgloc.x = (svgloc.x + (svgloc.width / 2)) - containerloc.x;
                    svgloc.y = (svgloc.y + (svgloc.height / 2)) - containerloc.y;

                    cy.get('[data-testid=giraffe-tooltip]').should('not.exist')
                    cy.get('.leaflet-container').trigger('mouseover', svgloc.x, svgloc.y)
                    cy.get('[data-testid=giraffe-tooltip]').should('exist')
                    //check tooltip contents
                    cy.get('[data-testid=giraffe-tooltip]').find('.giraffe-tooltip-column-header')
                        .eq(0).then($header => {
                        expect($header.text()).to.equal('Time')
                    })
                    cy.get('[data-testid=giraffe-tooltip]').find('.giraffe-tooltip-column-header')
                        .eq(1).then($header => {
                        expect($header.text()).to.equal('dur')
                    })
                    cy.get('[data-testid=giraffe-tooltip]').find('.giraffe-tooltip-column-value')
                        .eq(0).then($value => {
                        expect($value.text()).to.match(/\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:[0-5]\d{1}:[0-5]\d{1} [A|P]M/)
                    })
                    cy.get('[data-testid=giraffe-tooltip]').find('.giraffe-tooltip-column-value')
                        .eq(1).then($value => {
                        expect($value.text()).to.match(/\d{1,12}/)
                    })
                    //leave the marker
                    cy.get('.leaflet-container').trigger('mouseout', svgloc.x, svgloc.y)

                })
            }
        })

    })

    it('verifies marker color', () => {
        cy.get('svg > path').eq(0).then(path => {
            expect(path.attr('fill')).to.equal('#db0000')
        })
        cy.get('svg > path').eq(1).then(path => {
            expect(path.attr('fill')).to.equal('#006d6f')
        })
        cy.get('svg > path').eq(3).then(path => {
            expect(path.attr('fill')).to.equal('#FF4F00')
        })
        cy.get('svg > path').eq(5).then(path => {
            expect(path.attr('fill')).to.equal('#FFD300')
        })


    })

})
