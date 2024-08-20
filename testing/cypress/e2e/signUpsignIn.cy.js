// Tests for the Sign Up and Sign In Page

describe("Check the Sign Up and Sign In Feature", () => {
    beforeEach(() => {
        cy.exec("node ../server/populate_db.js mongodb://127.0.0.1:27017/stack_db");
        cy.visit("http://localhost:3000");
    });
    afterEach(() => {
        cy.exec("node ../server/remove_db.js mongodb://127.0.0.1:27017/stack_db");
    });
    it('1.1 should fill out the form correctly and submit successfully', () => {
        cy.get("#signUp").click();
        cy.get('#first-name').type('Aditya');
        cy.get('#last-name').type('Deshpande');
        cy.get('#email').type('aditya@gmail.com');
        cy.get('#password').type('Aditya@Sudhanva');
        cy.get('#confirmPassword').type('Aditya@Sudhanva');
        cy.get('#about-me').type('I am a Full Stack Enginner. 1');

        cy.get('[name="interestedFields"]').each((checkbox, index) => {
            if (index === 0 || index === 2) {
                cy.wrap(checkbox).check();
            }
        });
        // const fileName = 'profile.jpg';
        // cy.fixture(fileName).then((fileContent) => {
        //     cy.get('[type="file"]').attachFile({
        //       fileContent,
        //       fileName,
        //       mimeType: 'image/jpeg'
        //     });
        //   });
        cy.get('#signUpBtn').click();

        cy.contains('Account Created Successfully').should('be.visible');
    });

    it('1.2 should display error message if passwords do not match', () => {
        cy.get("#signUp").click();
        cy.get('#first-name').type('Aditya');
        cy.get('#last-name').type('Deshpande');
        cy.get('#email').type('aditya@gmail.com');
        cy.get('#password').type('Aditya@Sudhanva');
        cy.get('#confirmPassword').type('Sudhanva@Aditya');
        cy.get('#about-me').type('I am a software developer. 1');

        cy.get('[name="interestedFields"]').first().check();

        cy.get('#signUpBtn').click();

        cy.contains('Passwords Do Not Match').should('be.visible');
    });

    it('1.3 should display error message for invalid email', () => {
        cy.get("#signUp").click();
        cy.get('#first-name').type('Aditya');
        cy.get('#last-name').type('Deshpande');
        cy.get('#email').type('invalidEmail@');
        cy.get('#password').type('Aditya@Sudhanva');
        cy.get('#confirmPassword').type('Aditya@Sudhanva');
        cy.get('#about-me').type('I am a Full Stack Enginner. 2');

        cy.get('[name="interestedFields"]').each((checkbox, index) => {
            if (index === 0 || index === 2) {
                cy.wrap(checkbox).check();
            }
        });

        cy.get('#signUpBtn').click();

        cy.contains('Please enter a valid email address').should('be.visible');
    });

    it('1.4 Sign Up button enables only after all fields are filled', () => {
        cy.get("#signUp").click();
        cy.get('#signUpBtn').should('be.disabled');

        cy.get('#first-name').type('Aditya');
        cy.get('#signUpBtn').should('be.disabled');
        cy.get('#last-name').type('Deshpande');
        cy.get('#signUpBtn').should('be.disabled');
        cy.get('#email').type('aditya@gmail.com');
        cy.get('#signUpBtn').should('be.disabled');
        cy.get('#password').type('Aditya@Sudhanva');
        cy.get('#signUpBtn').should('be.disabled');
        cy.get('#confirmPassword').type('Aditya@Sudhanva');
        cy.get('#signUpBtn').should('be.disabled');
        cy.get('#about-me').type('I am a Full Stack Enginner. 2');
        cy.get('#signUpBtn').should('be.disabled');
        cy.get('[name="interestedFields"]').each((checkbox, index) => {
            if (index === 0 || index === 2) {
                cy.wrap(checkbox).check();
            }
        });
        cy.get('#signUpBtn').should('be.enabled');
    });

    it('1.5 Sign In Page shows error in case of No Email', () => {
        cy.get('#login-password').type("wrong password");
        cy.get('#sign-in').click();
        cy.contains('Invalid Credentials').should('be.visible');
    });

    it('1.6 Sign In Page shows error in case of No Password', () => {
        cy.get('#email-id').type("aditya@gmail.com");
        cy.get('#sign-in').click();
        cy.contains('Invalid Credentials').should('be.visible');
    });

    it('1.7 Sign In Page shows error in case of invalid Email or password', () => {
        cy.get('#email-id').type("aditya@gmail.com");
        cy.get('#login-password').type("wrong password");
        cy.get('#sign-in').click();
        cy.contains('Invalid Credentials').should('be.visible');
    });

    it('1.8 Sign In Successful after successful registration', () => {
        cy.get("#signUp").click();
        cy.get('#first-name').type('Aditya');
        cy.get('#last-name').type('Deshpande');
        cy.get('#email').type('aditya@gmail.com');
        cy.get('#password').type('Aditya@Sudhanva');
        cy.get('#confirmPassword').type('Aditya@Sudhanva');
        cy.get('#about-me').type('I am a Full Stack Enginner. 1');

        cy.get('[name="interestedFields"]').each((checkbox, index) => {
            if (index === 0 || index === 2) {
                cy.wrap(checkbox).check();
            }
        });
        cy.get('#signUpBtn').click();

        cy.contains('Account Created Successfully').should('be.visible');
        cy.get("#signIn").click();
        cy.get('#email-id').type("aditya@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
        cy.contains("All Questions");
        cy.contains("10+ questions");

        const qTitles = ["Optimizing MongoDB queries for performance",
            "Handling asynchronous operations in JavaScript",
            "Best practices for error handling in Node.js APIs",
            "Handling responsive design with CSS Grid and Flexbox",
            "Best practices for securing REST APIs in Node.js",
            "React Native vs. Flutter for mobile app development",
            "Quick question about storage on android",
            "Optimizing frontend performance with Webpack",
        ];

        qTitles.forEach((q) => {
            cy.contains(q);
        })
    })

    it('1.9 Sign In Successfully', () => {
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
        cy.contains("All Questions");
        cy.contains("10+ questions");

        const qTitles = ["Optimizing MongoDB queries for performance",
            "Handling asynchronous operations in JavaScript",
            "Best practices for error handling in Node.js APIs",
            "Handling responsive design with CSS Grid and Flexbox",
            "Best practices for securing REST APIs in Node.js",
            "React Native vs. Flutter for mobile app development",
            "Quick question about storage on android",
            "Optimizing frontend performance with Webpack",
        ];
        qTitles.forEach((q) => {
            cy.contains(q);
        })
    })

    it("1.10 Log Out after signing in", () => {
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
        cy.contains("All Questions");
        cy.contains("10+ questions");

        cy.get("#profileIcon").click();
        cy.contains("Logout").click();

        cy.contains("Sign In");
        cy.contains("Hello !");
    })

    it("1.11 Check data on the profile page", () => {
        cy.get('#email-id').type("aditya1@gmail.com");
        cy.get('#login-password').type("Aditya@Sudhanva");
        cy.get('#sign-in').click();
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

    it("1.12 check image file upload on signup page", () => {
        cy.get("#signUp").click();
        cy.wait(2000);
        cy.fixture('test.png').then(fileContent => {
            cy.get('input[type="file"]').attachFile({
                fileContent: fileContent.toString(),
                fileName: 'test.png',
                mimeType: 'image/png'
            });
        });
        cy.wait(2000);
        cy.get('img').should('be.visible');
    })
});
