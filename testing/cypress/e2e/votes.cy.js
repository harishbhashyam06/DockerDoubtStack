describe("Tests for upvoting or downvoting questions, answers and comments", () => {
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

    it("1.1 Upvote question", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get("#vote-count").contains("66");
        cy.contains("Lauren Taylor");
        cy.get("#q-upvote").click();
        cy.get("#vote-count").contains("67");
    })

    it("1.2 Downvote question", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get("#vote-count").contains("66");
        cy.contains("Lauren Taylor");
        cy.get("#q-downvote").click();
        cy.get("#vote-count").contains("65");
    })

    it("1.3 Upvote question then Downvote question", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get("#vote-count").contains("66");
        cy.contains("Lauren Taylor");
        cy.get("#q-upvote").click();
        cy.get("#vote-count").contains("67");
        cy.get("#q-downvote").click();
        cy.get("#vote-count").contains("65");
    })

    it("1.4 Downvote question then Upvote question", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get("#vote-count").contains("66");
        cy.contains("Lauren Taylor");
        cy.get("#q-downvote").click();
        cy.get("#vote-count").contains("65");
        cy.get("#q-upvote").click();
        cy.get("#vote-count").contains("67");
    })
    it("1.5 upvote on Comment", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get(".comment-votes").first().contains("25")
        cy.get(".comment-upvote").first().click();
        cy.get(".comment-votes").first().contains("26")
    })

    it("1.6 downvote on Comment", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.wait(1000);
        cy.get(".comment-votes").first().contains("25")
        cy.get(".comment-downvote").first().click();
        cy.get(".comment-votes").first().contains("24")
    })

    it("1.7 upvote on comment then downvote on comment", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get(".comment-votes").first().contains("25")
        cy.get(".comment-upvote").first().click();
        cy.get(".comment-votes").first().contains("26")
        cy.wait(1000);
        cy.get(".comment-downvote").first().click();
        cy.get(".comment-votes").first().contains("24")
    })

    it("1.8 downvote on comment then upvote on comment", () => {
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get(".comment-votes").first().contains("25")
        cy.get(".comment-downvote").first().click();
        cy.get(".comment-votes").first().contains("24")
        cy.wait(1000);
        cy.get(".comment-upvote").first().click();
        cy.get(".comment-votes").first().contains("26")
    })
    it("1.9 upvote on Answer", () => {
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get(".answer-votes").first().contains("49")
        cy.get(".answer-upvote").first().click();
        cy.get(".answer-votes").first().contains("50")
    })

    it("1.10 downvote on Answer", () => {
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get(".answer-votes").first().contains("49")
        cy.get(".answer-downvote").first().click();
        cy.get(".answer-votes").first().contains("48")
    })

    it("1.11 upvote on answer then downvote on answer", () => {
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get(".answer-votes").first().contains("49")
        cy.get(".answer-upvote").first().click();
        cy.get(".answer-votes").first().contains("50")
        cy.get(".answer-downvote").first().click();
        cy.get(".answer-votes").first().contains("49")
    })
})