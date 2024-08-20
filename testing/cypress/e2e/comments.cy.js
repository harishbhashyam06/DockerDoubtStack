describe("Tests for comments on question and answers", () => {
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
    
    it("1.1 Check if comments are displayed correctly for question", () => {
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
        cy.contains("Using TypeScript with Express.js for backend development");
        const comments = ["For user authentication in Node.js, I prefer using Passport.js along with JSON Web Tokens (JWT). It's a versatile and secure approach. Let me know if you need more details!",
            "I'm a fan of Visual Studio Code (VS Code) for web development. It's lightweight, extensible, and has great support for various languages and frameworks.",
            "Async/await is a cleaner and more readable way to handle asynchronous operations in JavaScript compared to using raw promises. It simplifies error handling and makes code easier to understand."]
        cy.get(".comment-text").each(($el, index, $list) => {
            cy.wrap($el).contains(comments[index]);
        });
    })

    it("1.2 add Comment to question and check if it is displayed first", () => {
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get("#add-comment").click();
        cy.get("#outlined-basic").type("Adding a new comment for testing");
        cy.get("#comment-submit").click();
        cy.get(".comment-text").first().contains("Adding a new comment for testing")
    })

    it("1.3 Check comments on a particular answer", () => {
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get(".showComment-icon").first().click();
        cy.contains("I'm curious about adopting GraphQL for my next project. What are some advantages over traditional REST APIs?")
    })

    it("1.4 Adding comment on a particular answer", () => {
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get(".showComment-icon").first().click();
        cy.contains("I'm curious about adopting GraphQL for my next project. What are some advantages over traditional REST APIs?")
        cy.get("#add-answer-comment").click();
        cy.get("#outlined-basic").type("Adding a comment to first answer");
        cy.get("#postAnsComment").click();
        cy.contains("Adding a comment to first answer");
    })
})