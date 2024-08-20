describe("Answer Page tests", () => {
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

    it("1.1 Check answers of a question", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        const answers = ["I use AWS Lambda for serverless computing, and it's been effective for handling asynchronous tasks and building scalable microservices without managing server infrastructure.",
            "I recommend using Next.js for server-side rendering and static site generation with React. It provides excellent performance optimizations and developer-friendly features."]
        const answerVotes = ["49", "40"];
        const ansBy = ["Olivia Adams", "Olivia Adams"];
        cy.get(".answerText").each(($el, index, $list) => {
            cy.wrap($el).contains(answers[index]);
        });

        cy.get(".answer-votes").each(($el, index, $list) => {
            cy.wrap($el).contains(answerVotes[index]);
        });

        cy.get(".ansByBtn").each(($el, index, $list) => {
            cy.wrap($el).contains(ansBy[index]);
        });
    })

    it("1.2 Adding answer to the question", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get("#answer-question").click();
        cy.get("#answerTextInput").type("Adding new answer to the question Using TypeScript with Express.js for backend development for testing purposes.");
        cy.get("#post-answer").click();
        cy.contains("Answer added!");
        cy.get('#mypost').click();
        cy.contains("Approval Pending Answers");
        cy.contains("Adding new answer to the question Using TypeScript with Express.js for backend development for testing purposes.");
    })

    it("1.3 Adding answer to the question then approve it from admin and check if it is visible on answer page", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get("#answer-question").click();
        cy.get("#answerTextInput").type("Adding new answer to the question Using TypeScript with Express.js for backend development for testing purposes.");
        cy.get("#post-answer").click();
        cy.contains("Answer added!");
        cy.get('#mypost').click();
        cy.contains("Approval Pending Answers");
        cy.contains("Adding new answer to the question Using TypeScript with Express.js for backend development for testing purposes.");
        cy.get('#sideApprove').click();
        cy.get(".approvebtn-answer").each(($el, index, $list) => {
            if (index === 0) {
                cy.wrap($el).click();
            }
        });
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
        cy.get(".answerText").first().contains("Adding new answer to the question Using TypeScript with Express.js for backend development for testing purposes.")
    })

    it("1.4 Adding answer to the question then reject it from admin and check if it is not visible on mypost page and answer page", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get("#answer-question").click();
        cy.get("#answerTextInput").type("Adding new answer to the question Using TypeScript with Express.js for backend development for testing purposes.");
        cy.get("#post-answer").click();
        cy.contains("Answer added!");
        cy.get('#mypost').click();
        cy.contains("Approval Pending Answers");
        cy.contains("Adding new answer to the question Using TypeScript with Express.js for backend development for testing purposes.");
        cy.get('#sideApprove').click();
        cy.get(".rejectbtn-answer").each(($el, index, $list) => {
            if (index === 0) {
                cy.wrap($el).click();
            }
        });
        cy.get('#mypost').click();
        cy.contains("No answers pending approvals.");
        cy.contains("No answers posted.")
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
        cy.get(".answerText").first().should('not.contain', "Adding new answer to the question Using TypeScript with Express.js for backend development for testing purposes.");
    })

    it("1.5 Adding answer to the question then delete it from my posts section", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get("#answer-question").click();
        cy.get("#answerTextInput").type("Adding new answer to the question Using TypeScript with Express.js for backend development for testing purposes.");
        cy.get("#post-answer").click();
        cy.contains("Answer added!");
        cy.get('#mypost').click();
        cy.contains("Approval Pending Answers");
        cy.contains("Adding new answer to the question Using TypeScript with Express.js for backend development for testing purposes.");
        cy.get(".deletebtn-unapproved-answer").first().click();
        cy.contains("No answers pending approvals.");
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
        cy.get(".answerText").first().should('not.contain', "Adding new answer to the question Using TypeScript with Express.js for backend development for testing purposes.");
    })

    it("1.6 Going to User Profile Page from the user icon mentioned in the answer", () => {
        cy.get('#sideBarQuestions').click();
        cy.wait(1000);
        cy.get(".postTitle").first().click();
        cy.wait(1000);
        cy.contains("Using TypeScript with Express.js for backend development");
        cy.get(".ansByBtn").first().click();
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