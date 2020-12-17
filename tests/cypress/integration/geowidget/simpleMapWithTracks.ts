import { dimSVG } from './helperTypes'

before(() => {
    cy.resetDB();
})

describe('GeoWidget - Basic - Map with Tracks', () => {

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/sncf02.lp', '-60m', '1m')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () => {
        cy.visit('/geowidget/basic/simpleMapWithTracks')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('successfully loads - chrome',{browser: '!firefox'}, () => {

        cy.get('[data-testid=geowidget-tracks]').should('be.visible');
        //Verify track count
        cy.get('path.leaflet-ant-path').should('have.length', 6)
        //Verify endpoint count - N.B. some endpoints are overlaid one atop another
        //    but each track has two
        cy.get('.leaflet-pane > svg:nth-of-type(1) > g > path').should('have.length', 12)

        const expectedStrokeColors = ['SKIP',
            'rgb(0, 0, 255)',
            'rgb(255, 0, 0)',
            'rgb(0, 128, 0)',
            'rgb(165, 42, 42)',
            'rgb(0, 0, 0)',
            'rgb(255, 20, 147)']

        const expectedDims = [{height: 'SKIP', width: 'SKIP'},
            {height: '58px', width: '227px'},
            {height: '109px', width: '95px'},
            {height: '126px', width: '271px'},
            {height: '460px', width: '104px'},
            {height: '25px', width: '144px'},
            {height: '196px', width: '170px'},
        ]

        cy.get('svg > g > path:first-of-type').then(elems => {
            for(let i = 1; i < elems.length; i++){
                expect(elems[i]).to.have.css('stroke', expectedStrokeColors[i])
                //TODO - firefox renders with different dimensions -
                // perhaps just check aspect ratio
                expect(elems[i]).to.have.css('height', expectedDims[i].height);
                expect(elems[i]).to.have.css('width', expectedDims[i].width);
            }
        })

        cy.get('svg > g > path:last-of-type').then(elems => {
            for(let i = 1; i < elems.length; i++){
                expect(elems[i]).to.have.css('stroke', 'rgb(255, 255, 255)');
                expect(elems[i]).to.have.css('animation-duration', '44.75s');
            }
        })


    })

    it('successfully loads - firefox', {browser: 'firefox'}, () => {

        cy.get('[data-testid=geowidget-tracks]').should('be.visible');
        //Verify track count
        cy.get('path.leaflet-ant-path').should('have.length', 6)
        //Verify endpoint count - N.B. some endpoints are overlaid one atop another
        //    but each track has two
        cy.get('.leaflet-pane > svg:nth-of-type(1) > g > path').should('have.length', 12)

        const expectedStrokeColors = ['SKIP',
            'rgb(0, 0, 255)',
            'rgb(255, 0, 0)',
            'rgb(0, 128, 0)',
            'rgb(165, 42, 42)',
            'rgb(0, 0, 0)',
            'rgb(255, 20, 147)']

        const expectedDims = [{height: 'SKIP', width: 'SKIP'},
            {height: 64, width: 233},
            {height: 115, width: 101},
            {height: 132, width: 277},
            {height: 466, width: 110},
            {height: 31, width: 150},
            {height: 202, width: 176},
        ]

        cy.get('svg > g > path:first-of-type').then(elems => {
            for(let i = 1; i < elems.length; i++){
                expect(elems[i]).to.have.css('stroke', expectedStrokeColors[i])
                //firefox renders with different dimensions
                expect(Math.round(elems.eq(i).height() as number)).to.equal(expectedDims[i].height);
                expect(Math.round(elems.eq(i).width() as number)).to.equal(expectedDims[i].width);
            }
        })

        cy.get('svg > g > path:last-of-type').then(elems => {
            for(let i = 1; i < elems.length; i++){
                expect(elems[i]).to.have.css('stroke', 'rgb(255, 255, 255)');
                expect(elems[i]).to.have.css('animation-duration', '44.75s');
            }
        })

    })

    //TODO adjust for firefox - has max dim height||width of svg container 730.6844496.....
    it('zooms in', {browser: '!firefox'}, () => {

        const dimsBuff: dimSVG[] = [];

        //Get base dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 0; i < elems.length; i++){
                const dim = {height: 0, width: 0, d: ''}
                dim.height = elems.eq(i).height() as number;
                dim.width = elems.eq(i).width() as number;
                dim.d = elems.eq(i).attr('d') as string;
                dimsBuff.push(dim);
            }

        })

        //do zoom once
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load

        //Compare new dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 1; i < elems.length; i++){
                const dim = {height: 0, width: 0, d: ''}
                if(elems.eq(i).is(':visible') && elems.eq(i).attr('d') != 'M0 0'){
                    dim.height = elems.eq(i).height() as number;
                    dim.width = elems.eq(i).width() as number;
                    dim.d = elems.eq(i).attr('d') as string;
                    expect(dim.height).to.be.greaterThan(dimsBuff[i].height);
                    expect(dim.width).to.be.greaterThan(dimsBuff[i].width)
                    expect(dim.d).to.not.equal(dimsBuff[i].d)
                    dimsBuff[i] = dim;
                }
            }

        });

        //zoom again
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load


        //Compare new dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 1; i < elems.length; i++){
                const dim = {height: 0, width: 0, d: ''}
                /*
                cy.log('DEBUG dim ' + elems.eq(i).is(':visible')
                    + ' '
                    + elems.eq(i).attr('d') + ' [' +
                    elems.eq(i).height() + ' ' +
                    elems.eq(i).width() + ']'
                )*/
                if(elems.eq(i).is(':visible') && elems.eq(i).attr('d') != 'M0 0'){
                    dim.height = elems.eq(i).height() as number;
                    dim.width = elems.eq(i).width() as number;
                    dim.d = elems.eq(i).attr('d') as string;
                    //N.B. tracks in bottom of viewport get smaller dim height or width
                    // because some points outside of pane are dropped
                    // 725 is width and height of element containing svg so is max dim
                    if(dim.height < 725){
                        expect(dim.height).to.not.equal(dimsBuff[i].height);
                    }else{
                        expect(dim.height).to.equal(725);
                    }
                    if(dim.width < 725){ // 725 is width and height of element containing svg
                        expect(dim.width).to.not.equal(dimsBuff[i].width)
                    }else{
                        expect(dim.width).to.equal(725)
                    }
                    expect(dim.d).to.not.equal(dimsBuff[i].d)
                    dimsBuff[i] = dim;
                }
            }

        });
    })

    it('zoom out', () => {

        const dimsBuff: dimSVG[] = [];

        //Get base dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 0; i < elems.length; i++){
                const dim = {height: 0, width: 0, d: ''}
                dim.height = elems.eq(i).height() as number;
                dim.width = elems.eq(i).width() as number;
                dim.d = elems.eq(i).attr('d') as string;
                dimsBuff.push(dim);
            }

        })

        //do zoom once
        cy.get('[title=\'Zoom out\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load

        //Compare new dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 1; i < elems.length; i++){
                const dim = {height: 0, width: 0, d: ''}
                if(elems.eq(i).is(':visible') && elems.eq(i).attr('d') != 'M0 0'){
                    dim.height = elems.eq(i).height() as number;
                    dim.width = elems.eq(i).width() as number;
                    dim.d = elems.eq(i).attr('d') as string;
                    expect(dim.height).to.be.lessThan(dimsBuff[i].height);
                    expect(dim.width).to.be.lessThan(dimsBuff[i].width)
                    expect(dim.d).to.not.equal(dimsBuff[i].d)
                    dimsBuff[i] = dim;
                }
            }
        });
        //zoom again
        cy.get('[title=\'Zoom out\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load

        //Compare new dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 1; i < elems.length; i++){
                const dim = {height: 0, width: 0, d: ''}
                if(elems.eq(i).is(':visible') && elems.eq(i).attr('d') != 'M0 0'){
                    dim.height = elems.eq(i).height() as number;
                    dim.width = elems.eq(i).width() as number;
                    dim.d = elems.eq(i).attr('d') as string;
                    expect(dim.height).to.be.lessThan(dimsBuff[i].height);
                    expect(dim.width).to.be.lessThan(dimsBuff[i].width)
                    expect(dim.d).to.not.equal(dimsBuff[i].d)
                    dimsBuff[i] = dim;
                }
            }
        });
    })

    //see giraffe issue #403
    it.skip("shows tooltips on tracks", () => {
        cy.log('waiting on issue 403')
    })

    //see giraffe issue #403
    it.skip("shows tooltips on endpoints", () => {
        cy.log('waiting on issue 403')
    })

    /*
      Tracks can disappear.
      SVG
          + M vals will change
          + dims of containing rectangles will change near edges
      + Animation speeds should remain the same
      Endpoints:
         + 5 Disappear
         - Distances between endpoints remain same, but left values change
     */
    it("pans horizontally", () => {

        const dimsBuff: dimSVG[] = [];
        const unchangedTrackColors = ['brown', 'deeppink']

        const dims: {height: number,
            width: number,
            left: number,
            top: number} = {height: 0, width: 0, left: 0, top: 0}

        //Get base dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 0; i < elems.length; i++){
                const dim = {height: 0, width: 0, d: ''}
                dim.height = elems.eq(i).height() as number;
                dim.width = elems.eq(i).width() as number;
                dim.d = elems.eq(i).attr('d') as string;
                dimsBuff.push(dim);
            }
        })

        cy.get('div.giraffe-plot').then(container => {
            dims.height = container.height() as number;
            dims.width = container.width() as number;
            const offset: JQuery.Coordinates | undefined = container.offset();
            dims.top = offset === undefined ? 0 : offset.top;
            dims.left = offset === undefined ? 0 : offset.left;
        }).wait(1000)
            .then(() => {

                // pan away
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:dims.width - 2,y:dims.height/2})
                    .wait(500)



                //Check only 5 endpoints are visible
                cy.get('.leaflet-container').then(container => {
                    cy.get('svg:first-of-type > g > path').then(elems => {

                        cy.calcVisibleElements(container,elems).then(count => {
                            expect(count).to.equal(5)
                        })

                        cy.calcHiddenElements(container,elems).then(count => {
                            expect(count).to.equal(7)
                        })
                    })
                })

                //Check dim vals changed for some tracks
                cy.get('svg > g > path:first-of-type').then(elems => {

                    for(let i = 1; i < elems.length; i++){
                        const dim = {height: 0, width: 0, d: ''}
                        dim.height = elems.eq(i).height() as number;
                        dim.width = elems.eq(i).width() as number;
                        dim.d = elems.eq(i).attr('d') as string;

                        if(unchangedTrackColors.includes(elems.eq(i).attr('stroke') as string)){
                            expect(dim.d).to.equal(dimsBuff[i].d)
                            expect(dim.height).to.equal(dimsBuff[i].height);
                            expect(dim.width).to.equal(dimsBuff[i].width);
                        }else{
                            expect(dim.d).to.not.equal(dimsBuff[i].d)
                            expect(dim.height).to.not.equal(dimsBuff[i].height);
                            expect(dim.width).to.not.equal(dimsBuff[i].width);
                        }
                        dimsBuff[i] = dim;
                    }
                });

                cy.get('.leaflet-overlay-pane > svg > g > path:nth-of-type(2)').then(elems => {
                    for(let i = 1; i < elems.length; i++){
                        expect(elems[i]).to.have.css('animation-duration', '44.75s');
                    }
                });

                //pan back
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:2,y:dims.height/2})
                    .wait(500)

                //Check all 12 endpoints are visible
                cy.get('.leaflet-container').then(container => {
                    cy.get('svg:first-of-type > g > path').then(elems => {

                        cy.calcVisibleElements(container,elems).then(count => {
                            expect(count).to.equal(12)
                        })

                        cy.calcHiddenElements(container,elems).then(count => {
                            expect(count).to.equal(0)
                        })
                    })
                })

                cy.get('svg > g > path:first-of-type').then(elems => {

                    for(let i = 1; i < elems.length; i++){
                        const dim = {height: 0, width: 0, d: ''}
                        dim.height = elems.eq(i).height() as number;
                        dim.width = elems.eq(i).width() as number;
                        dim.d = elems.eq(i).attr('d') as string;

                        if(unchangedTrackColors.includes(elems.eq(i).attr('stroke') as string)){
                            expect(dim.d).to.equal(dimsBuff[i].d)
                            expect(dim.height).to.equal(dimsBuff[i].height);
                            expect(dim.width).to.equal(dimsBuff[i].width);
                        }else{
                            expect(dim.d).to.not.equal(dimsBuff[i].d)
                            expect(dim.height).to.not.equal(dimsBuff[i].height);
                            expect(dim.width).to.not.equal(dimsBuff[i].width);
                        }
                    }
                });

                cy.get('.leaflet-overlay-pane > svg > g > path:nth-of-type(2)').then(elems => {
                    for(let i = 1; i < elems.length; i++){
                        expect(elems[i]).to.have.css('animation-duration', '44.75s');
                    }
                });

            })

    })

    it('pans vertically', () => {

        const dimsBuff: dimSVG[] = [];
        const unchangedTrackColors = ['green', 'red', 'black', 'deeppink']

        //Get base dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 0; i < elems.length; i++){
                const dim = {height: 0, width: 0, d: ''}
                dim.height = elems.eq(i).height() as number;
                dim.width = elems.eq(i).width() as number;
                dim.d = elems.eq(i).attr('d') as string;
                dimsBuff.push(dim);
            }
        })


        const dims: {height: number,
            width: number,
            left: number,
            top: number} = {height: 0, width: 0, left: 0, top: 0}
        cy.get('div.giraffe-plot').then(container => {
            dims.height = container.height() as number;
            dims.width = container.width() as number;
            const offset: JQuery.Coordinates | undefined = container.offset();
            dims.top = offset === undefined ? 0 : offset.top;
            dims.left = offset === undefined ? 0 : offset.left;
        }).wait(1000)
            .then(() => {
                // pan away
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:dims.width/2,y:dims.height - 2})
                    .wait(500)

                //Check only 5 endpoints are visible
                cy.get('.leaflet-container').then(container => {
                    cy.get('svg:first-of-type > g > path').then(elems => {

                        cy.calcVisibleElements(container,elems).then(count => {
                            expect(count).to.equal(9)
                        })

                        cy.calcHiddenElements(container,elems).then(count => {
                            expect(count).to.equal(3)
                        })
                    })
                })

                //Check dim vals changed for some tracks
                cy.get('svg > g > path:first-of-type').then(elems => {

                    for(let i = 1; i < elems.length; i++){
                        const dim = {height: 0, width: 0, d: ''}
                        dim.height = elems.eq(i).height() as number;
                        dim.width = elems.eq(i).width() as number;
                        dim.d = elems.eq(i).attr('d') as string;

                        if(unchangedTrackColors.includes(elems.eq(i).attr('stroke') as string)){
                            expect(dim.d).to.equal(dimsBuff[i].d)
                            expect(dim.height).to.equal(dimsBuff[i].height);
                            expect(dim.width).to.equal(dimsBuff[i].width);
                        }else{
                            expect(dim.d).to.not.equal(dimsBuff[i].d)
                            expect(dim.height).to.not.equal(dimsBuff[i].height);
                            expect(dim.width).to.not.equal(dimsBuff[i].width);
                        }
                        dimsBuff[i] = dim;
                    }
                });

                //animation should not be affected
                cy.get('.leaflet-overlay-pane > svg > g > path:nth-of-type(2)').then(elems => {
                    for(let i = 1; i < elems.length; i++){
                        expect(elems[i]).to.have.css('animation-duration', '44.75s');
                    }
                });

                //pan back
                cy.pan('.giraffe-plot',{x:dims.width/2,y:dims.height/2},{x:dims.width/2,y:2})
                    .wait(500)

                //Check all 12 endpoints are visible
                cy.get('.leaflet-container').then(container => {
                    cy.get('svg:first-of-type > g > path').then(elems => {

                        cy.calcVisibleElements(container,elems).then(count => {
                            expect(count).to.equal(12)
                        })

                        cy.calcHiddenElements(container,elems).then(count => {
                            expect(count).to.equal(0)
                        })
                    })
                })

                cy.get('svg > g > path:first-of-type').then(elems => {

                    for(let i = 1; i < elems.length; i++){
                        const dim = {height: 0, width: 0, d: ''}
                        dim.height = elems.eq(i).height() as number;
                        dim.width = elems.eq(i).width() as number;
                        dim.d = elems.eq(i).attr('d') as string;

                        if(unchangedTrackColors.includes(elems.eq(i).attr('stroke') as string)){
                            expect(dim.d).to.equal(dimsBuff[i].d)
                            expect(dim.height).to.equal(dimsBuff[i].height);
                            expect(dim.width).to.equal(dimsBuff[i].width);
                        }else{
                            expect(dim.d).to.not.equal(dimsBuff[i].d)
                            expect(dim.height).to.not.equal(dimsBuff[i].height);
                            expect(dim.width).to.not.equal(dimsBuff[i].width);
                        }
                    }
                });

                //animation should not be affected
                cy.get('.leaflet-overlay-pane > svg > g > path:nth-of-type(2)').then(elems => {
                    for(let i = 1; i < elems.length; i++){
                        expect(elems[i]).to.have.css('animation-duration', '44.75s');
                    }
                });

            })
    })



})
