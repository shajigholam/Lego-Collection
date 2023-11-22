//This code now uses Sequelize models and connects to a PostgreSQL database instead of storing data in arrays(the code has been commented).
// Access the DB_USER, DB_DATABASE, etc. values from the ".env" file
require('dotenv').config();
const Sequelize = require('sequelize');
// set up sequelize to point to our postgres database
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

// Define Theme model
const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
  },
},
  {
    timestamps: false, // Disable createdAt and updatedAt fields
  });

// Define Set model
const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  year: {
    type: Sequelize.INTEGER,
  },
  num_parts: {
    type: Sequelize.INTEGER,
  },
  theme_id: {
    type: Sequelize.INTEGER,
  },
  img_url: {
    type: Sequelize.STRING,
  },
},
  {
    timestamps: false, // Disable createdAt and updatedAt fields
  });

// Create association between Set and Theme
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Initialize function to synchronize models with the database
function initialize() {
  return sequelize.sync()
    .then(() => {
      console.log('Database synchronized successfully');
    })
    .catch((error) => {
      console.error('Unable to synchronize the database:', error);
      throw error;
    });
}

// Function to get all sets
function getAllSets() {
  return Set.findAll({ include: [Theme] });
}

// Function to get a set by its set_num
function getSetByNum(setNum) {
  return Set.findOne({
    where: { set_num: setNum },
    include: [Theme],
  }).then((set) => {
    if (!set) {
      throw new Error('Unable to find requested set');
    }
    return set;
  });
}

// Function to get sets by theme, case insensitive
function getSetsByTheme(theme) {
  return Set.findAll({
    where: {
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`,
      },
    },
    include: [Theme],
  }).then((sets) => {
    if (!sets || sets.length === 0) {
      throw new Error('Unable to find requested sets');
    }
    return sets;
  });
}
// Function to add a new set
function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create({
      set_num: setData.set_num,
      name: setData.name,
      year: setData.year,
      num_parts: setData.num_parts,
      theme_id: setData.theme_id,
      img_url: setData.img_url,
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

// Function to get all themes
function getAllThemes() {
  return Theme.findAll()
    .then((themes) => {
      return themes;
    })
    .catch((err) => {
      throw err;
    });
}

// Function to edit a set by set_num
function editSet(setNum, setData) {
  return new Promise((resolve, reject) => {
    Set.update(setData, {
      where: { set_num: setNum }
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

// Function to delete a set by its set_num
function deleteSet(setNum) {
  return Set.destroy({
    where: { set_num: setNum },
  })
    .then(() => {
      // Successfully deleted
    })
    .catch((err) => {
      throw err.errors[0].message;
    });
}

// Export the functions
module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet,
};

/* data inserted->remove this part then
// Import the required data from the JSON files
const setData = require("../data/setData");
const themeData = require("../data/themeData");
// Code Snippet to insert existing data from Set / Themes
sequelize
  .sync()
  .then(async () => {
    try {
      await Theme.bulkCreate(themeData);
      await Set.bulkCreate(setData);
      console.log("-----");
      console.log("data inserted successfully");
    } catch (err) {
      console.log("-----");
      console.log(err.message);
      // NOTE: If you receive the error...
      // insert or update on table "Sets" violates foreign key constraint "Sets_theme_id_fkey"
      // it is because you have a "set" in your collection that has a "theme_id" that does not exist in the "themeData".
      // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, fix the error in your .json files and re-run this code
    }
    process.exit();
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });
*/

/*
//***The purpose of the "legoSets.js" file is to provide easy access to the Lego data for other files within our assignment that require it.***
//This will automatically read both files and generate two arrays of objects: "setData" and "themeDat:
const setData = require("../data/setData"); //Import the required data from the JSON files
const themeData = require("../data/themeData");

// create an empty array called "sets"(This will be the completed array of Lego "set" objects, after processing the above "setData" and "themeData")
let sets = [];

function initialize() {
    return new Promise((resolve, reject) => {
        // loop through each item in setData array
        setData.forEach((set) => {
            // find the corresponding theme object in themeData
            const theme = themeData.find((themeItem) => themeItem.id === set.theme_id);
            // check if a matching theme was found
            if (theme) {
                // create a new object with the 'theme' property and push it to the 'sets' array
                const setWithTheme = {
                    ...set,
                    theme: theme.name,
                };
                sets.push(setWithTheme);
            }
        });
        if (sets.length > 0) {
            resolve();
        }
        else{
            reject("No sets found!");
        }
    });
}
// initialize();
// function to get all sets
function getAllSets() {
    return new Promise((resolve, reject) => {
        if (sets.length < 1) {
            reject("No sets available!");
        }
        else{
            resolve(sets);
        }
    });
}
// function to get a set by its set_num
function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        const foundSet = sets.find((set) => set.set_num === setNum);
        if (foundSet) {
            resolve(foundSet);
        }
        else{
            reject("Set not found!");
        }
    });
}
// function to get sets by theme and it is not case sensitive
function getSetByTheme(theme) {
    return new Promise((resolve, reject) => {
        const matchSet = sets.filter((set) => {
            return set.theme.toLowerCase().includes(theme.toLowerCase());
        });
        if (matchSet.length > 0) {
            resolve(matchSet);
        }
        else {
            reject("No matching sets found!");
        }
    });
}
//Each of the 4 functions must return a new Promise object that "resolves" either with data (if the function returns data) 
//or "rejects" with an error, if the function encounters an error


// export sets array for other files to access
//module.exports = sets;
module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetByTheme,
};
//console.log(sets);

//tests
//console.log(getAllSets());
//console.log(getSetByNum('001-1'));
//console.log(getSetByTheme('Service Packs'));
*/
