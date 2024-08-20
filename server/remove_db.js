// databaseUtils.js

const mongoose = require('mongoose');
const clearDatabase = async (mongoDBUrl) => {
    try {
        await mongoose.connect(mongoDBUrl, { useNewUrlParser: true, useUnifiedTopology: true });

        const db = mongoose.connection;
        await db.dropDatabase();

        console.log('Database cleared successfully');
        db.close();
    } catch (error) {
        console.error('Error clearing database:', error);
        mongoose.connection.close();
    }
};

if (require.main === module) {
    const userArgs = process.argv.slice(2);
    const mongoDBUrl = userArgs[0];

    if (!mongoDBUrl) {
        console.error('MongoDB URL not provided. Usage: node databaseUtils.js <mongoDBUrl>');
        process.exit(1);
    }

    clearDatabase(mongoDBUrl)
        .then(() => {
            console.log('Database cleared successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error clearing database:', error);
            process.exit(1);
        });
}

module.exports = clearDatabase;
