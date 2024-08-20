describe("Tests for save question feature", () => {
    beforeEach(() => {
        cy.exec("node ../server/populate_db.js mongodb://127.0.0.1:27017/stack_db");
        cy.visit("http://localhost:3000");
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
    });
    afterEach(() => {
        cy.exec("node ../server/remove_db.js mongodb://127.0.0.1:27017/stack_db");
    });

    it("1.1 Save Question", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.get("#savebtn").click();
        cy.get('#side-saved').click();
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.contains("66 upvotes");
        cy.contains("2 answers");
        cy.contains("51 views");
        cy.contains("Lauren Taylor");
    })

    it("1.2 Save Question then Unsave", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.get("#savebtn").click();
        cy.get('#side-saved').click();
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.contains("66 upvotes");
        cy.contains("2 answers");
        cy.contains("51 views");
        cy.contains("Lauren Taylor");
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.get("#savebtn").click();
        cy.wait(1000);
        cy.get('#side-saved').click();
        cy.contains("No saved questions.");
    })

})