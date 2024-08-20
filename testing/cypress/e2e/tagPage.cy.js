describe("Tests for tags page", () => {
    beforeEach(() => {
        cy.exec("node ../server/populate_db.js mongodb://127.0.0.1:27017/stack_db");
        cy.visit("http://localhost:3000");
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
        cy.get('#sideTags').click();
    });
    afterEach(() => {
        cy.exec("node ../server/remove_db.js mongodb://127.0.0.1:27017/stack_db");
    });
    it("1.1 Check if all the tags are displayed", () => {
        const tags = ["react", "javascript", "java", "docker", "restapis", "html", "css", "vuejs", "cors", "jwt", "oauth", "spa", "rest", "graphql", "machine-learning", "pwa", "ci-cd", "microservices", "serverless", "cybersecurity"];
        cy.contains("20 Tags");
        cy.contains("All Tags");
        tags.forEach((t) => {
            cy.contains(t);
        })
    })

    it("1.2 Clicking on one tag should display questions belonging to that tag", () => {
        cy.contains("jwt").click();
        cy.contains("3 questions");
        cy.contains("jwt");

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
})