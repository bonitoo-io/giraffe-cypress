
describe('GeoWidget - Basic - Map with Circles', () => {

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/futuroscope01.lp')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () =>{
        cy.visit('/geowidget/basic/simpleMapWithCircles')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('successfully loads', () => {

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
        let lvl8dist = 0;
        //check distance before zoom
        cy.get('g > path').then(paths => {
            cy.parseSVGPathD(paths[3].getAttribute('d') as string).then(def1 => {
                cy.parseSVGPathD(paths[4].getAttribute('d') as string). then(def2 => {
                    cy.calcSVGPointDistance(def1.moves[0], def2.moves[0]).then(distance => {
                        lvl8dist= distance;
                    })
                })
            })
        })

        let arcCt = 0;
        //do zoom twice - to level 10
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
            .click()
            .wait(1000);

        //Check only 3 circles are visible
        cy.get('g > path').should('have.length', 7)
            .each(path => {
               cy.parseSVGPathD(path.attr('d') as string).then(def => {
                       arcCt += def.arcs.length;
                })
            }).then(() => {
                //N.B. point on tile with Niort not visible, but pre-loaded
               expect(arcCt/2).to.equal(3);
            })

        //Check distance is changed
        cy.get('g > path').then(paths => {
            cy.parseSVGPathD(paths[3].getAttribute('d') as string).then(def1 => {
                cy.parseSVGPathD(paths[4].getAttribute('d') as string). then(def2 => {
                    cy.calcSVGPointDistance(def1.moves[0], def2.moves[0]).then(distance => {
                        expect(distance).to.be.above(lvl8dist);
                    })
                })
            })
        })

        //verify leaflet tiles layer
        cy.get('div.leaflet-tile-container > img').should('have.length', 12).each(img => {

            //cy.task('log', `DEBUG imgs ${JSON.stringify(img)}`);
            cy.parseLeafletTileSrc(img.attr('src') as string)
                .should(($src) => {
                    expect($src.layer).to.equal(10);
                })
        })

    })

    it('zooms out', () => {

        //do zoom in three times to get to an initial status - to level 11
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
            .click()
            .wait(1000)
            .click()
            .wait(1000)

        let arcCtInit = 0;
        //Check only 3 circles are visible
        cy.get('g > path').should('have.length', 7)
            .each(path => {
                cy.parseSVGPathD(path.attr('d') as string).then(def => {
                    arcCtInit += def.arcs.length;
                })
            }).then(() => {
            //N.B. point on tile with Niort not visible, but pre-loaded
            expect(arcCtInit/2).to.equal(3);
        })

        let lvl11dist = 0;
        //check distance before zoom out
        cy.get('g > path').then(paths => {
            cy.parseSVGPathD(paths[3].getAttribute('d') as string).then(def1 => {
                cy.parseSVGPathD(paths[4].getAttribute('d') as string). then(def2 => {
                    cy.calcSVGPointDistance(def1.moves[0], def2.moves[0]).then(distance => {
                        lvl11dist= distance;
                    })
                })
            })
        })
        //zoom out four times
        cy.get('[title=\'Zoom out\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
            .click()
            .wait(1000)
            .click()
            .wait(1000)
            .click()
            .wait(1000)

        let arcCt = 0;
        //Check 7 circles are now visible
        cy.get('g > path').should('have.length', 7)
            .each(path => {
                cy.parseSVGPathD(path.attr('d') as string).then(def => {
                    arcCt += def.arcs.length;
                })
            }).then(() => {
            expect(arcCt/2).to.equal(7);
        })

        //Check distance is changed
        cy.get('g > path').then(paths => {
            cy.parseSVGPathD(paths[3].getAttribute('d') as string).then(def1 => {
                cy.parseSVGPathD(paths[4].getAttribute('d') as string). then(def2 => {
                    cy.calcSVGPointDistance(def1.moves[0], def2.moves[0]).then(distance => {
                        expect(distance).to.be.below(lvl11dist);
                    })
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

    it('pans horizontally', () => {
        cy.log('TODO horizontal pan')
    })

    it('pans vertically', () => {
        cy.log('TODO vertical pan')
    })
})
