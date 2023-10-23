/********************************************************************************
 *  WEB322 – Assignment 03
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Samaneh Hajigholam Student ID: 119751220 Date: Oct 22, 2023
 *
 *  Published URL:
 * https://brainy-shawl-crow.cyclic.app/
 ********************************************************************************/

//this file involves returning the data. (creating a "simple web server" that makes our data available)

//This will ensure that the functions in legoSets.js will be available on the legoData object
const legoData = require("./modules/legoSets"); //import

const express = require("express"); // "require" the Express module
const app = express(); // obtain the "app" object
const HTTP_PORT = process.env.PORT || 7272; // assign a port
//we must ensure that the "sets" array has been successfully built within our "legoSets" module,
//so before the server starts (ie: the app.listen() function is invoked),

app.use(express.static("public")); //to mark the "public" folder as "static"

legoData
  .initialize()
  .then(() => {
    // start the server on the port and output a confirmation ot the console
    app.listen(HTTP_PORT, () =>
      console.log(`server listening on: ${HTTP_PORT}`)
    );
  })
  .catch((err) => {
    console.log(err); // output the error to the console
  });
//get root route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/home.html");
});
app.get("/about", (req, res) => {
  res.sendFile(__dirname + "/views/about.html");
});
// Handle /lego/sets route
app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;
  if (theme) {
    legoData
      .getSetByTheme(theme)
      .then((sets) => {
        res.json(sets);
      })
      .catch((error) => {
        res.status(404).send(error);
      });
  } else {
    legoData
      .getAllSets()
      .then((sets) => {
        res.json(sets);
      })
      .catch((error) => {
        res.status(404).send(error);
      });
  }
});

// Handle /lego/sets/:setNum route
app.get("/lego/sets/:setNum", (req, res) => {
  const setNum = req.params.setNum;
  legoData
    .getSetByNum(setNum)
    .then((set) => {
      if (set) {
        res.json(set);
      } else {
        res.status(404).send("Lego set not found.");
      }
    })
    .catch((error) => {
      res.status(404).send(error);
    });
});

// Serve the 404 page
app.get("*", (req, res) => {
  res.status(404).sendFile(__dirname + "/views/404.html");
});

/*
test:
http://localhost:7272/
http://localhost:7272/lego/sets
http://localhost:7272/lego/sets/num-demo
http://localhost:7272/lego/sets/theme-demo
my note:
When a function returns a Promise, we can use .then() to attach a callback that will be executed when the Promise successfully resolves.
In initialize() function, for example, I've implemented it to return a Promise that resolves when the operation of filling the sets array is complete.
This allows us to use .then() to perform actions after the data is ready.
---------------------------
creating a web server using Express.js, app typically refers to an instance of the Express.js application. Express.js is a Node.js framework 
that simplifies the process of building web applications and APIs.
When you create an Express.js application, you often create it by invoking the express() function, which returns an app object.
*/
