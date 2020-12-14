import { dimSVG } from './helperTypes'

before(() => {
    cy.resetDB();
})

describe('GeoWidget - Basic - Tracks and Markers', () => {

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/sncf02.lp', '-60m', '1m')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () => {
        cy.visit('/geowidget/basic/simpleTrackAndMarkerMap')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('successfully loads - Chrome', { browser: '!firefox'}, () => {

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

        cy.get('[data-testid=geowidget-track-and-marker]').should('be.visible');

        //check markers
        cy.get('.svg-icon').should('have.length', 31)
        cy.get('[stroke=\'#008800\' ][class=\'svg-icon-path\']').should('have.length', 20);
        cy.get('[stroke=\'#FFD300\' ][class=\'svg-icon-path\']').should('have.length', 5)
        cy.get('[stroke=\'#FF4F00\' ][class=\'svg-icon-path\']').should('have.length', 4)
        cy.get('[stroke=\'#db0000\' ][class=\'svg-icon-path\']').should('have.length',2);

        //check tracks
        cy.get('path.leaflet-ant-path').should('have.length', 6)
        //Verify endpoint count - N.B. some endpoints are overlaid one atop another
        //    but each track has two
        cy.get('.leaflet-pane > svg:nth-of-type(1) > g > path').should('have.length', 12)

        cy.get('svg > g > path:first-of-type').then(elems => {
            for(let i = 1; i < elems.length; i++){
                cy.log('DEBUG elem dim ' + elems[i].getBoundingClientRect().width / elems[i].getBoundingClientRect().height );
                expect(elems[i]).to.have.css('stroke', expectedStrokeColors[i])
                expect(elems[i]).to.have.css('height', expectedDims[i].height);
                expect(elems[i]).to.have.css('width', expectedDims[i].width);
            }
        })

        cy.get('svg > g > path:last-of-type').then(elems => {
            for(let i = 1; i < elems.length; i++){
                expect(elems[i]).to.have.css('stroke', 'rgb(255, 255, 255)');
                expect(elems[i]).to.have.css('animation-duration', '7.25s');
            }
        })

    })

    it('successfully loads - Firefox', { browser: 'firefox'}, () => {

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

        cy.get('[data-testid=geowidget-track-and-marker]').should('be.visible');

        //check markers
        cy.get('.svg-icon').should('have.length', 31)
        cy.get('[stroke=\'#008800\' ][class=\'svg-icon-path\']').should('have.length', 20);
        cy.get('[stroke=\'#FFD300\' ][class=\'svg-icon-path\']').should('have.length', 5)
        cy.get('[stroke=\'#FF4F00\' ][class=\'svg-icon-path\']').should('have.length', 4)
        cy.get('[stroke=\'#db0000\' ][class=\'svg-icon-path\']').should('have.length',2);

        //check tracks
        cy.get('path.leaflet-ant-path').should('have.length', 6)

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
                expect(elems[i]).to.have.css('animation-duration', '7.25s');
            }
        })


    })

    it('zooms in - Chrome', { browser: '!firefox'}, () => {
        cy.log('Zoom in')
        let dimsBuff: dimSVG[] = [];

        //Get base dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 0; i < elems.length; i++){
                let dim = {height: 0, width: 0, d: ''}
                dim.height = elems.eq(i).height() as number;
                dim.width = elems.eq(i).width() as number;
                dim.d = elems.eq(i).attr('d') as string;
                dimsBuff.push(dim);
            }

        })

        //check distance before zoom
        let lvl8Dist=0
        cy.get('.svg-icon > svg').then(icons => {
            cy.calcElementDistance(icons[9],icons[28]).then(dist => {
                lvl8Dist=dist;
            })
        })


        //do zoom once
        cy.get('[title=\'Zoom in\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load

        //Compare new dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 1; i < elems.length; i++){
                let dim = {height: 0, width: 0, d: ''}
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

        //Check only 12 markers are visible
        cy.get('.leaflet-container').then(container => {
            cy.get('.svg-icon > svg').then(elems => {

                cy.calcVisibleElements(container,elems).then(count => {
                    expect(count).to.equal(12)
                })

                cy.calcHiddenElements(container,elems).then(count => {
                    expect(count).to.equal(19)
                })
            })
        })

        //Check distance is changed
        let lvl10Dist=0;
        cy.get('.svg-icon > svg').then(icons => {
            cy.calcElementDistance(icons[9],icons[28]).then(dist => {
                lvl10Dist=dist;
                expect(lvl10Dist).to.be.above(lvl8Dist)
            })
        })
    })

    it('zooms out - Chrome', {browser: '!firefox'}, () => {
        cy.log('Zoom out')
        let lvl8Dist=0
        cy.get('.svg-icon > svg').then(icons => {
            cy.calcElementDistance(icons[9],icons[28]).then(dist => {
                lvl8Dist=dist;
            })
        })

        let dimsBuff: dimSVG[] = [];

        //Get base dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 0; i < elems.length; i++){
                let dim = {height: 0, width: 0, d: ''}
                dim.height = elems.eq(i).height() as number;
                dim.width = elems.eq(i).width() as number;
                dim.d = elems.eq(i).attr('d') as string;
                dimsBuff.push(dim);
            }

        })


        //do zoom twice
        cy.get('[title=\'Zoom out\'][role=button]')
            .click()
            .wait(1000) //wait for zoom to load
            .click()
            .wait(1000) //wait for zoom to load

        //Check distance is changed
        let lvl6Dist=0;
        cy.get('.svg-icon > svg').then(icons => {
            cy.calcElementDistance(icons[9],icons[28]).then(dist => {
                lvl6Dist=dist;
                expect(lvl6Dist).to.be.below(lvl8Dist)
            })
        })

        //Compare new dims
        cy.get('svg > g > path:first-of-type').then(elems => {

            for(let i = 1; i < elems.length; i++){
                let dim = {height: 0, width: 0, d: ''}
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
})
