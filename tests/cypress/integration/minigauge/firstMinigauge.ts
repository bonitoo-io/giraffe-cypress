before(() => {
    cy.resetDB();
})

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
//const imageExpectedDir = "./cypress/fixtures/images/minigauge"

describe('First Minigauge', () => {

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ied = Cypress.config("imageExpectedDir");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const iad = Cypress.config("imageActualDir");

    before('Load Data', () => {
        cy.datagenFromLPFixture('influx/gaugeMini.lp')
        cy.wait(1000) //wait for backend to process data
        cy.task('cleanDir', `cypress/screenshots/minigauge/firstMinigauge.ts/${iad}`);
    })

    beforeEach('load Page', () => {
        cy.visit('/minigauge/basic/firstGauge')
    })

    afterEach('Screenshot', () => {
        cy.screenshot();
    })

    it('loads minigauge graph', () => {

        cy.get('.giraffe-plot').should('be.visible')
        cy.get('#subcontainer .giraffe-layers').should('have.length', 3)
        cy.get('#subcontainer:nth-of-type(1) .giraffe-layers').should('exist')
        cy.get('#subcontainer:nth-of-type(1) .giraffe-layers svg').screenshot(iad + '/miniGaugeCZ')
        cy.get('#subcontainer:nth-of-type(2) .giraffe-layers svg').screenshot(iad + '/miniGaugeSK')
        cy.get('#subcontainer:nth-of-type(3) .giraffe-layers svg').screenshot(iad + '/miniGaugeDE')

        //cy.task('log', 'HELLO')
        //cy.task('fsCheck', './cypress/fixtures/images/minigauge')
        cy.comparePNGFiles(`${ied}/miniGaugeCZ.png`, `./cypress/screenshots/minigauge/firstMinigauge.ts/${iad}/miniGaugeCZ.png`)
/*        cy.task('compareImageFiles', {
            file1: imageExpectedDir + '/miniGaugeCZ.png',
            file2: './cypress/screenshots/minigauge/firstMinigauge.ts/miniGaugeCZ.png'})
            .then((result) => {
                console.log(`DEBUG compare Result ${JSON.stringify(result)}`)
                if(result){
                    assert.equal(result.pct, 0, 'Match PNG files by percentage')
                    assert.equal(result.pixelDif, 0, 'Natch PNG file by pixels')
                }else{
                    throw 'compareImageFiles result undefined'
                }
            })
*/

        cy.comparePNGFiles(`${ied}/miniGaugeSK.png`, `./cypress/screenshots/minigauge/firstMinigauge.ts/${iad}/miniGaugeSK.png`)
/*        cy.task('compareImageFiles', {
            file1: imageExpectedDir + '/miniGaugeSK.png',
            file2: './cypress/screenshots/minigauge/firstMinigauge.ts/miniGaugeSK.png'})
            .then((result) => {
                console.log(`DEBUG compare Result ${JSON.stringify(result)}`)
                if(result){
                    assert.equal(result.pct, 0, 'Match PNG files by percentage')
                    assert.equal(result.pixelDif, 0, 'Match PNG file by pixels')
                }else{
                    throw 'compareImageFiles result undefined'
                }
            })
 */

        cy.comparePNGFiles(`${ied}/miniGaugeDE.png`, `./cypress/screenshots/minigauge/firstMinigauge.ts/${iad}/miniGaugeDE.png`)
/*        cy.task('compareImageFiles', {
            file1: imageExpectedDir + '/miniGaugeDE.png',
            file2: './cypress/screenshots/minigauge/firstMinigauge.ts/miniGaugeDE.png'})
            .then((result) => {
                console.log(`DEBUG compare Result ${JSON.stringify(result)}`)
                if(result){
                    assert.equal(result.pct, 0, 'Match PNG files by percentage')
                    assert.equal(result.pixelDif, 0, 'Match PNG file by pixels')
                }else{
                    throw 'compareImageFiles result undefined'
                }
            })

 */
    })

})
