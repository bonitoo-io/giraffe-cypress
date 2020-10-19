describe('The Home Page', () => {
    it('successfully loads', () => {
        cy.log("DEBUG Calling datagenScript()")
        cy.task('cwd');
       /* cy.task('getEnvVal', 'USER').then(val => {
            cy.task('log', 'DEBUG getEnvVal USER ' + val)
        }); */
        cy.datagenFromLPFixture('influx/futuroscope01.lp')
        //cy.datagenScript();
        cy.visit('/') // change URL to match your dev URL
        cy.wait(3000);
        cy.screenshot();
    })
})
