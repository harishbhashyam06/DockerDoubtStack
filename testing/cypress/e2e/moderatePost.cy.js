describe("Tests for checking the privilages of the moderator", () => {
    beforeEach(() => {
        cy.exec("node ../server/populate_db.js mongodb://127.0.0.1:27017/stack_db");
        cy.visit("http://localhost:3000");
    });
    afterEach(() => {
        cy.exec("node ../server/remove_db.js mongodb://127.0.0.1:27017/stack_db");
    });

    it("1.1 Adding answer to the question then approve it from admin and check if it is visible on answer page", () => {
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
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

    it("1.2 Adding answer to the question then reject it from admin and check if it is not visible on mypost page and answer page", () => {
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
        cy.get('#sideBarQuestions').click();
        cy.get(".postTitle").first().click();
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
    
    it("1.3 Succesfully add new Question, Approve it by admin, Check if it is displayed at top", () => {
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
        cy.get('#askQuestion').click();
        cy.get('#formTitleInput').type("What is better React.js or Angular.js for web development?")
        cy.get('#formTextInput').type("There is always a debate regaring the popularity of frameworks like React and Angular. If I am a new learner what should I learn?");
        cy.get('#formTagInput').type("react javascript");
        cy.get('#questionSubmit').click();
        cy.contains("Question added!")
        cy.get('#mypost').click();
        cy.contains("Approval Pending Questions");
        cy.contains("What is better React.js or Angular.js for web development?");
        cy.contains("0 views");
        cy.contains("0 answers");
        cy.contains("0 upvotes");
        cy.contains("Aditya Deshpande");
        cy.contains("Approve").click();
        cy.contains("What is better React.js or Angular.js for web development?");
        cy.contains("0 views");
        cy.contains("0 answers");
        cy.contains("0 upvotes");
        cy.contains("Aditya Deshpande");
        cy.get('#mypost').click();
        cy.get('#sideApprove').click();
        cy.get(".approvebtn-question").each(($el, index, $list) => {
            if (index === 0) {
                cy.wrap($el).click();
            }
        });
        cy.get('#sideBarQuestions').click();
        cy.contains("All Questions");
        cy.contains("30+ questions");
        const qTitles = ["What is better React.js or Angular.js for web development?",
            "Using TypeScript with Express.js for backend development",
            "Optimizing MongoDB queries for performance",
            "GraphQL vs. REST: Choosing the right API for your project",
            "Implementing serverless architecture with AWS Lambda",
            "Handling asynchronous operations in JavaScript",
            "Best practices for error handling in Node.js APIs",
            "Handling responsive design with CSS Grid and Flexbox",
            "Deploying React apps on AWS S3 and CloudFront",
            "Data fetching strategies in React applications"
        ];

        const viewCount = ["0", "50", "42", "46", "45", "37", "48", "43", "41", "36"];
        const upVotes = ["0", "66", "52", "61", "65", "58", "62", "54", "55", "53"];
        const authors = ["Aditya Deshpande", "Lauren Taylor", "Emma Baker", "Michael Brown", "Olivia Adams", "Olivia Adams", "Amanda White", "Sarah Johnson", "Matthew Roberts", "Michael Brown"];
        const answers = ["0", "2", "2", "2", "2", "2", "2", "2", "2", "2"];    
        cy.get(".postTitle").each(($el, index, $list) => {
            cy.wrap($el).should("contain", qTitles[index]);
        });

        cy.get(".statAnswer").each(($el, index, $list) => {
            cy.wrap($el).should("contain", `${answers[index]} answers`);
        });

        cy.get(".statViews").each(($el, index, $list) => {
            cy.wrap($el).should("contain", `${viewCount[index]} views`);
        });

        cy.get(".statVotes").each(($el, index, $list) => {
            cy.wrap($el).should("contain", `${upVotes[index]} upvotes`);
        });

        cy.get(".name-button").each(($el, index, $list) => {
            cy.wrap($el).should("contain", authors[index]);
        });
    })

    it("1.4 Succesfully add new Question, Reject it by admin, Check if it not displayed on questions page", () => {
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
        cy.get('#askQuestion').click();
        cy.get('#formTitleInput').type("What is better React.js or Angular.js for web development?")
        cy.get('#formTextInput').type("There is always a debate regaring the popularity of frameworks like React and Angular. If I am a new learner what should I learn?");
        cy.get('#formTagInput').type("react javascript");
        cy.get('#questionSubmit').click();
        cy.contains("Question added!")
        cy.get('#mypost').click();
        cy.contains("Approval Pending Questions");
        cy.contains("What is better React.js or Angular.js for web development?");
        cy.contains("0 views");
        cy.contains("0 answers");
        cy.contains("0 upvotes");
        cy.contains("Aditya Deshpande");
        cy.contains("Approve").click();
        cy.contains("What is better React.js or Angular.js for web development?");
        cy.contains("0 views");
        cy.contains("0 answers");
        cy.contains("0 upvotes");
        cy.contains("Aditya Deshpande");
        cy.get('#mypost').click();
        cy.get('#sideApprove').click();
        cy.get(".rejectbtn-question").each(($el, index, $list) => {
            if (index === 0) {
                cy.wrap($el).click();
            }
        });
        cy.get('#sideBarQuestions').click();
        cy.contains("All Questions");
        cy.contains("20+ questions");
        const qTitles = [
            "Using TypeScript with Express.js for backend development",
            "Optimizing MongoDB queries for performance",
            "GraphQL vs. REST: Choosing the right API for your project",
            "Implementing serverless architecture with AWS Lambda",
            "Handling asynchronous operations in JavaScript",
            "Best practices for error handling in Node.js APIs",
            "Handling responsive design with CSS Grid and Flexbox",
            "Deploying React apps on AWS S3 and CloudFront",
            "Data fetching strategies in React applications",
            "How to handle state management in Vue.js applications?"
        ];

        const viewCount = ["50", "42", "46", "45", "37", "48", "43", "41", "36", "34"];
        const upVotes = ["66", "52", "61", "65", "58", "62", "54", "55", "53", "49"];
        const authors = ["Lauren Taylor", "Emma Baker", "Michael Brown", "Olivia Adams", "Olivia Adams", "Amanda White", "Sarah Johnson", "Matthew Roberts", "Michael Brown", "Sophia Clark"];
        const answers = ["2", "2", "2", "2", "2", "2", "2", "2", "2", "2"];    
        cy.get(".postTitle").each(($el, index, $list) => {
            cy.wrap($el).should("contain", qTitles[index]);
        });

        cy.get(".statAnswer").each(($el, index, $list) => {
            cy.wrap($el).should("contain", `${answers[index]} answers`);
        });

        cy.get(".statViews").each(($el, index, $list) => {
            cy.wrap($el).should("contain", `${viewCount[index]} views`);
        });

        cy.get(".statVotes").each(($el, index, $list) => {
            cy.wrap($el).should("contain", `${upVotes[index]} upvotes`);
        });

        cy.get(".name-button").each(($el, index, $list) => {
            cy.wrap($el).should("contain", authors[index]);
        });
    })

    it("Login as normal user, add a question, logout, login as admin, approve it, logout, login as user again and check if the question is displayed on questions page", () => {
        cy.get('#email-id').type("mbende3@quantcast.com");
        cy.get('#login-password').type("@myPass4");
        cy.get('#sign-in').click();
        cy.get('#askQuestion').click();
        cy.get('#formTitleInput').type("What is better React.js or Angular.js for web development?")
        cy.get('#formTextInput').type("There is always a debate regaring the popularity of frameworks like React and Angular. If I am a new learner what should I learn?");
        cy.get('#formTagInput').type("react javascript");
        cy.get('#questionSubmit').click();
        cy.contains("Question added!");
        cy.get("#profileIcon").click();
        cy.contains("Logout").click();
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
        cy.get('#sideApprove').click();
        cy.get(".approvebtn-question").each(($el, index, $list) => {
            if (index === 0) {
                cy.wrap($el).click();
            }
        });
        cy.get("#profileIcon").click();
        cy.contains("Logout").click();
        cy.get('#email-id').type("mbende3@quantcast.com");
        cy.get('#login-password').type("@myPass4");
        cy.get('#sign-in').click();
        cy.get('#sideBarQuestions').click();
        cy.contains("All Questions");
        cy.contains("30+ questions");
        const qTitles = ["What is better React.js or Angular.js for web development?",
            "Using TypeScript with Express.js for backend development",
            "Optimizing MongoDB queries for performance",
            "GraphQL vs. REST: Choosing the right API for your project",
            "Implementing serverless architecture with AWS Lambda",
            "Handling asynchronous operations in JavaScript",
            "Best practices for error handling in Node.js APIs",
            "Handling responsive design with CSS Grid and Flexbox",
            "Deploying React apps on AWS S3 and CloudFront",
            "Data fetching strategies in React applications"
        ];

        const viewCount = ["0", "50", "42", "46", "45", "37", "48", "43", "41", "36"];
        const upVotes = ["0", "66", "52", "61", "65", "58", "62", "54", "55", "53"];
        const authors = ["Sam Bende", "Lauren Taylor", "Emma Baker", "Michael Brown", "Olivia Adams", "Olivia Adams", "Amanda White", "Sarah Johnson", "Matthew Roberts", "Michael Brown"];
        const answers = ["0", "2", "2", "2", "2", "2", "2", "2", "2", "2"];    
        cy.get(".postTitle").each(($el, index, $list) => {
            cy.wrap($el).should("contain", qTitles[index]);
        });

        cy.get(".statAnswer").each(($el, index, $list) => {
            cy.wrap($el).should("contain", `${answers[index]} answers`);
        });

        cy.get(".statViews").each(($el, index, $list) => {
            cy.wrap($el).should("contain", `${viewCount[index]} views`);
        });

        cy.get(".statVotes").each(($el, index, $list) => {
            cy.wrap($el).should("contain", `${upVotes[index]} upvotes`);
        });

        cy.get(".name-button").each(($el, index, $list) => {
            cy.wrap($el).should("contain", authors[index]);
        });
    })
})