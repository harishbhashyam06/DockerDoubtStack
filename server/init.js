const { MONGO_URL } = require("./config");
const populateDB = require("./populate_db");
const removeDB = require("./remove_db");

const init = async () => {
  console.log("removing exsisting database if any.");
  await populateDB(MONGO_URL);
  console.log("done");
};

init().catch((err) => {
  console.log("ERROR: " + err);
});

console.log("processing ...");
