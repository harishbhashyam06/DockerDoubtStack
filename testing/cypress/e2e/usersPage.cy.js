describe("Test for users page", () => {
    beforeEach(() => {
        cy.exec("node ../server/populate_db.js mongodb://127.0.0.1:27017/stack_db");
        cy.visit("http://localhost:3000");
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
        cy.get('#menu_users').click();
    });
    afterEach(() => {
        cy.exec("node ../server/remove_db.js mongodb://127.0.0.1:27017/stack_db");
    });
    it("1.1 Check if all users are displayed and the logged in user is not displayed", () => {
        const users = ["Amanda White", "Ram Sandon", "Daniel Martinez", "David Wilson", "Pavan Lawleff", "Emily Smith", "Emma Baker",
         "Jacob Hill", "Jonathan Goblin", "Lauren Taylor", "James Giblin", "Dewey Warret", "Matthew Roberts", "Sam Bende", 
         "Michael Brown", "Olivia Adams", "Ryan Campbell", "Sarah Johnson", "Sophia Clark", "Fiona Ramirez"];

         users.forEach((u) => {
            cy.contains(u);
         })
         cy.should('not.contain', "Aditya Deshpande");
    })

    it("1.2 Searching User", () => {
        cy.get("#user-search").type("Emily{enter}");
        cy.contains("Emily Smith");
        cy.contains("User since 15 Oct 2023");
    })

    it("1.3 Clicking on a user displays the user profile page of that user", () => {
        cy.contains("Olivia Adams").click();
        cy.contains("Olivia Adams");
        cy.contains("olivia.adams@example.com");
        cy.contains("September 05, 2023");
        cy.contains("I'm a digital marketer specializing in content strategy and social media management. I thrive on creating engaging content that connects brands with their audience. When I'm not crafting campaigns, I enjoy practicing yoga and exploring mindfulness.")
        cy.contains("graphql");
        cy.contains("ci-cd");
        cy.contains("serverless");
        cy.contains("cybersecurity");
    })
})