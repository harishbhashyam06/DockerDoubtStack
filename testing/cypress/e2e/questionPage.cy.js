describe("Question Page tests", () => {
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

    it('1.1 Default order Newest Question', () => {
        cy.get('#sideBarQuestions').click();
        cy.contains("All Questions");
        cy.contains("20+ questions");
        const qTitles = ["Using TypeScript with Express.js for backend development",
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

        cy.get(".postTitle").each(($el, index, $list) => {
            cy.wrap($el).should("contain", qTitles[index]);
        });

        cy.get(".statAnswer").each(($el, index, $list) => {
            cy.wrap($el).should("contain", "2 answers");
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

    it('1.2 Active Questions on Questions page', () => {
        cy.get('#sideBarQuestions').click();
        cy.contains("All Questions");
        cy.contains("20+ questions");
        cy.contains("Active").click();
        const qTitles = ["How to optimize performance in React applications?",
            "Programmatically navigate using React router",
            "android studio save string shared preference, start activity and load the saved string",
            "Using TypeScript with Express.js for backend development",
            "GraphQL vs. REST: Choosing the right API for your project",
            "Data fetching strategies in React applications",
            "How to handle state management in Vue.js applications?",
            "Scaling Node.js applications for high traffic",
            "React Native vs. Flutter for mobile app development",
            "Implementing serverless architecture with AWS Lambda",
        ];

        const viewCount = ["78", "12", "16", "50", "46", "36", "34", "55", "44", "45"];
        const upVotes = ["156", "34", "121", "66", "61", "53", "49", "71", "60", "65"];
        const answers = ["3", "2", "3", "2", "2", "2", "2", "2", "2", "2"];
        const authors = ["James Giblin", "James Giblin", "Pavan Lawleff", "Lauren Taylor", "Michael Brown", "Michael Brown", "Sophia Clark", "Emma Baker", "Jacob Hill", "Olivia Adams"];

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

    it('1.3 Unanswered Questions on Questions page', () => {
        cy.get('#sideBarQuestions').click();
        cy.contains("All Questions");
        cy.contains("Unanswered").click();
        cy.contains("2 questions");
        const qTitles = ["Quick question about storage on android",
            "login with superuser not working in django admin panel"
        ];

        const viewCount = ["67", "67"];
        const upVotes = ["103", "103"];
        const answers = ["0", "0"];
        const authors = ["Sam Bende", "Dewey Warret"];

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