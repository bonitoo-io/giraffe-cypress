before(() => {
    cy.resetDB();
})

describe('Progress Bars', () => {

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ied = Cypress.config("imageExpectedDir");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const iad = Cypress.config("imageActualDir");


    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/gaugeProgress.lp', '-40m', '1m')
        cy.wait(1000) //wait for backend to process data
        cy.task('cleanDir', `cypress/screenshots/minigauge/progressBar.ts/${iad}`);
    })

    beforeEach('load Page', () => {
        cy.visit('/minigauge/basic/progressBar')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('Successfully loads', () => {

        cy.get('section>div>div').screenshot(`${iad}/progressBars00`)
        for(let i = 1; i < 10; i++){
            cy.get('#charger').click();
            cy.wait(500)
            cy.get('section>div>div').screenshot(`${iad}/progressBars0${i}`)
            cy.comparePNGFiles(ied + `/progressBars0${i}.png`,
                `cypress/screenshots/minigauge/progressBar.ts/${iad}/progressBars0${i}.png`)
        }

    })
})
