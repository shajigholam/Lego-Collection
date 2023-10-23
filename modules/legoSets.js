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
initialize();
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

