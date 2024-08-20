describe("New Question Test", () => {
    beforeEach(() => {
        cy.exec("node ../server/populate_db.js mongodb://127.0.0.1:27017/stack_db");
        cy.visit("http://localhost:3000");
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
        cy.get('#askQuestion').click();
    });
    afterEach(() => {
        cy.exec("node ../server/remove_db.js mongodb://127.0.0.1:27017/stack_db");
    });

    it("1.1 Error if question title is empty", () => {
        cy.get('#formTextInput').type("Text for new question");
        cy.get('#formTagInput').type("react javascript");
        cy.get('#questionSubmit').click();
        cy.contains("Title cannot be empty");
    })

    it("1.2 Error if question text is empty", () => {
        cy.get('#formTitleInput').type("Title for new question")
        cy.get('#formTagInput').type("react javascript");
        cy.get('#questionSubmit').click();
        cy.contains("Question text cannot be empty");
    })

    it("1.3 Error if question tags field is empty", () => {
        cy.get('#formTitleInput').type("Title for new question")
        cy.get('#formTextInput').type("Text for new question");
        cy.get('#questionSubmit').click();
        cy.contains("Should have at least 1 tag");
    })

    it("1.4 Error if title is more than 100 characters", () => {
        cy.get('#formTitleInput').type("Title for new question. Title for new question.Title for new question.Title for new question.Title for new question.Title for new question.")
        cy.get('#formTextInput').type("Text for new question");
        cy.get('#formTagInput').type("react javascript");
        cy.get('#questionSubmit').click();
        cy.contains("Title cannot be more than 100 characters");
    })

    it("1.5 Succesfully adding a new Question", () => {
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
    })

    it("1.6 Succesfully adding multiple Questions with some old and some new tags", () => {
        cy.get('#formTitleInput').type("What is better React.js or Angular.js for web development?")
        cy.get('#formTextInput').type("There is always a debate regaring the popularity of frameworks like React and Angular. If I am a new learner what should I learn?");
        cy.get('#formTagInput').type("react javascript");
        cy.get('#questionSubmit').click();
        cy.contains("Question added!")
        cy.get('#askQuestion').click();
        cy.get('#formTitleInput').type("MVVM vs MVC in Android")
        cy.get('#formTextInput').type("Which design pattern is good for Android Development in Kotlin?");
        cy.get('#formTagInput').type("android kotlin");
        cy.get('#questionSubmit').click();
        cy.contains("Question added!");
        cy.get('#mypost').click();
        cy.contains("Approval Pending Questions");
        const qTitles = ["What is better React.js or Angular.js for web development?",
            "MVVM vs MVC in Android"
        ];

        const viewCount = ["0", "0"];
        const upVotes = ["0", "0"];
        const authors = ["Aditya Deshpande", "Aditya Deshpande"];

        cy.get(".postTitle").each(($el, index, $list) => {
            cy.wrap($el).should("contain", qTitles[index]);
        });

        cy.get(".statAnswer").each(($el, index, $list) => {
            cy.wrap($el).should("contain", "0 answers");
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
        cy.get("#sideTags").click();
        cy.contains("android");
        cy.contains("kotlin");
    })

    it("1.7 Succesfully add new Question, Approve it, Check if it is displayed at top", () => {
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

    it("1.8 Succesfully add new Question, Reject it, Check if it not displayed on questions page", () => {
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

    it("1.9 Succesfully add new Question, Delete it from my posts", () => {
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
        cy.get(".deletebtn-unapproved-question").each(($el, index, $list) => {
            if(index === 0) {
                cy.wrap($el).click();
            }
        });

        cy.contains("No questions pending approval.");
        
    })
})