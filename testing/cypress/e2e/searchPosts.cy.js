describe("Tests for search feature", () => {
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
    it('1.4 Search - No questions found', () => {
        cy.get('#sideBarQuestions').click();
        cy.contains("All Questions");
        const searchText = "Wrong search";
        cy.get('#searchBar').type(`${searchText}{enter}`);
        cy.contains("Search Results");
        cy.contains("0 questions");
        cy.contains("No Questions Found.");
    })
    it('1.5 Search - Search one tag', () => {
        cy.get('#sideBarQuestions').click();
        cy.contains("All Questions");
        const searchText = "[jwt]";
        cy.get('#searchBar').type(`${searchText}{enter}`);
        cy.contains("Search Results");
        cy.contains("3 questions");

        const qTitles = ["Using TypeScript with Express.js for backend development",
            "Deploying React apps on AWS S3 and CloudFront",
            "Monitoring and logging in distributed Node.js applications"
        ];

        const viewCount = ["50", "41", "40"];
        const upVotes = ["66", "55", "64"];
        const answers = ["2", "2", "2"];
        const authors = ["Lauren Taylor", "Matthew Roberts", "Fiona Ramirez"];

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

    it('1.6 Search - Search multiple tags', () => {
        cy.get('#sideBarQuestions').click();
        cy.contains("All Questions");
        const searchText = "[jwt][serverless]";
        cy.get('#searchBar').type(`${searchText}{enter}`);
        cy.contains("Search Results");
        cy.contains("5 questions");

        const qTitles = ["Using TypeScript with Express.js for backend development",
            "Optimizing MongoDB queries for performance",
            "Deploying React apps on AWS S3 and CloudFront",
            "Monitoring and logging in distributed Node.js applications",
            "Implementing OAuth 2.0 authentication with React applications"
        ];

        const viewCount = ["50", "42", "41", "40", "49"];
        const upVotes = ["66", "52", "55", "64", "68"];
        const answers = ["2", "2", "2", "2", "2"];
        const authors = ["Lauren Taylor", "Emma Baker", "Matthew Roberts", "Fiona Ramirez", "Matthew Roberts"];

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

    it('1.7 Search - Search Non-tags', () => {
        cy.get('#sideBarQuestions').click();
        cy.contains("All Questions");
        const searchText = "asynchronous";
        cy.get('#searchBar').type(`${searchText}{enter}`);
        cy.contains("Search Results");
        cy.contains("2 questions");

        const qTitles = ["Handling asynchronous operations in JavaScript",
        "Data fetching strategies in React applications"
        ];

        const viewCount = ["37", "36"];
        const upVotes = ["58", "53"];
        const answers = ["2", "2"];
        const authors = ["Olivia Adams", "Michael Brown"];

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

    it('1.8 Search - Search one tag one non tag', () => {
        cy.get('#sideBarQuestions').click();
        cy.contains("All Questions");
        const searchText = "[jwt] asynchronous";
        cy.get('#searchBar').type(`${searchText}{enter}`);
        cy.contains("Search Results");
        cy.contains("5 questions");

        const qTitles = ["Using TypeScript with Express.js for backend development",
        "Deploying React apps on AWS S3 and CloudFront",
        "Monitoring and logging in distributed Node.js applications",
        "Handling asynchronous operations in JavaScript",
        "Data fetching strategies in React applications"
        ];

        const viewCount = ["50", "41", "40", "37", "36"];
        const upVotes = ["66", "55", "64", "58", "53"];
        const answers = ["2", "2", "2", "2", "2"];
        const authors = ["Lauren Taylor", "Matthew Roberts", "Fiona Ramirez", "Olivia Adams", "Michael Brown"];

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