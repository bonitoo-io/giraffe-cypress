before(() => {
    cy.resetDB();
})

describe('First Minigauge', () => {

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/gaugeMini.lp')
        cy.wait(1000) //wait for backend to process data
    })

    beforeEach('load Page', () => {
        cy.visit('/minigauge/basic/firstGauge')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })


    it('loads minigauge graph', () => {
        cy.get('.giraffe-plot').should('be.visible')
        cy.get('.gauge-mini-bar').should('have.length', 3)
    })
})