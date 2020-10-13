describe('GeoWidget - Basic - Map with Circles', () => {
    it('successfully loads', () => {
        cy.visit('/geowidget/basic/simpleMapWithCircles') // change URL to match your dev URL
        cy.wait(3000);
        cy.screenshot();
    })
})
