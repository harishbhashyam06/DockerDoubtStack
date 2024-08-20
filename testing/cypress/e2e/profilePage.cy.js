describe("Tests for user profile page", () => {
    beforeEach(() => {
        cy.exec("node ../server/populate_db.js mongodb://127.0.0.1:27017/stack_db");
        cy.visit("http://localhost:3000");
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
    })

    afterEach(() => {
        cy.exec("node ../server/remove_db.js mongodb://127.0.0.1:27017/stack_db");
    })

    

    it("1.1 Check Profile Page data of logged in user", () => {
        cy.contains("All Questions");
        cy.contains("10+ questions");
        cy.get("#profileIcon").click();
        cy.contains("Profile").click();
        cy.contains("Aditya Deshpande");
        cy.contains("aditya1@gmail.com");
        cy.contains("April 18, 2024");
        cy.contains("Hello, I am a full stack developer, currently a MS CS Student at Khoury College, Northeastern University.");
        cy.contains("Interested Topics:");
        cy.contains("javascript");
        cy.contains("java");
    })


    it("1.3 Going to User Profile Page from the user icon mentioned in the answer", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get(".ansByBtn").first().click();
        cy.wait(1000);
        cy.contains("Olivia Adams");
        cy.contains("olivia.adams@example.com");
        cy.contains("September 05, 2023");
        cy.contains("I'm a digital marketer specializing in content strategy and social media management. I thrive on creating engaging content that connects brands with their audience. When I'm not crafting campaigns, I enjoy practicing yoga and exploring mindfulness.")
        cy.contains("graphql");
        cy.contains("ci-cd");
        cy.contains("serverless");
        cy.contains("cybersecurity");
    })

    it("1.2 Going to User Profile Page of a user from list of questions and check content", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.contains("All Questions");
        cy.get(".name-button").first().click();
        cy.wait(1000);
        cy.contains("Lauren Taylor");
        cy.contains("lauren.taylor@example.com")
        cy.contains("December 05, 2023");
        cy.contains("Lauren is a dedicated educator with a focus on STEM education. She loves inspiring young minds through hands-on learning experiences. In her spare time, Lauren enjoys gardening and experimenting with new recipes in the kitchen.")
        cy.contains("docker");
        cy.contains("javascript");
        cy.contains("css");
        cy.contains("oauth");
    })

})