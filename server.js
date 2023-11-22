/********************************************************************************
 *  WEB322 – Assignment 05
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Samaneh Hajigholam Student ID: 119751220 Date: Nov 22, 2023
 *
 *  Published URL:
 * https://brainy-shawl-crow.cyclic.app/
 ********************************************************************************/

//this file involves returning the data. (creating a "simple web server" that makes our data available)

//This will ensure that the functions in legoSets.js will be available on the legoData object
const legoData = require("./modules/legoSets"); //import

const express = require("express"); // "require" the Express module
const app = express(); // obtain the "app" object
const HTTP_PORT = process.env.PORT || 8080; // assign a port
//we must ensure that the "sets" array has been successfully built within our "legoSets" module,
//so before the server starts (ie: the app.listen() function is invoked),

app.use(express.static("public")); //to mark the "public" folder as "static"
app.use(express.urlencoded({ extended: true })); // Middleware to handle form data
//This will tell our server that any file with the ".ejs" extension will use the EJS "engine" (template engine).
app.set('view engine', 'ejs');

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
  res.render("home");
});
app.get("/about", (req, res) => {
  res.render("about");
});
// Handle /lego/sets route
app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;
  if (theme) {
    legoData
      .getSetsByTheme(theme)
      .then((sets) => {
        if (sets.length === 0) {
          res.status(404).render("404", { message: "No sets found for the specified theme" });
        } else {
          // console.log("Sets by Theme:", sets);
          res.render("sets", { sets: sets });
        }
      })
      .catch((error) => {
        res.status(404).render("404", { message: "No sets found for the specified theme" });
      });
  } else {
    legoData
      .getAllSets()
      .then((sets) => {
        // console.log("Sets:", sets);\
        res.render("sets", { sets: sets });
      })
      .catch((error) => {
        res.status(404).render("404", { message: "No sets found for the specified theme" });
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
        res.render("set", { set: set });
      } else {
        res.status(404).render("404", { message: "No set found for the specified set number" });
      }
    })
    .catch((error) => {
      res.status(404).render("404", { message: "No set found for the specified set number" });
    });
});

// GET /lego/addSet route
app.get("/lego/addSet", (req, res) => {
  legoData.getAllThemes()
    .then((themes) => {
      res.render("addSet", { themes: themes });
    })
    .catch((error) => {
      res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    });
});

// POST /lego/addSet route
app.post("/lego/addSet", (req, res) => {
  const setData = req.body;
  legoData.addSet(setData)
    .then(() => {
      res.redirect("/lego/sets");
    })
    .catch((error) => {
      res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    });
});
// GET "/lego/editSet/:num"
app.get("/lego/editSet/:num", (req, res) => {
  const setNum = req.params.num;

  Promise.all([legoData.getSetByNum(setNum), legoData.getAllThemes()])
    .then(([set, themes]) => {
      res.render("editSet", { themes: themes, set: set });
    })
    .catch((err) => {
      res.status(404).render("404", { message: err });
    });
});

// POST "/lego/editSet"
app.post("/lego/editSet", (req, res) => {
  const setNum = req.body.set_num;
  const setData = {
    name: req.body.name,
    year: parseInt(req.body.year),
    num_parts: parseInt(req.body.num_parts),
    theme_id: parseInt(req.body.theme_id),
    img_url: req.body.img_url,
  };

  legoData
    .editSet(setNum, setData)
    .then(() => {
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

// GET "/lego/deleteSet/:num"
app.get("/lego/deleteSet/:num", (req, res) => {
  const setNum = req.params.num;

  legoData
    .deleteSet(setNum)
    .then(() => {
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

// Serve the 404 page
app.get("*", (req, res) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});
/*
test:
http://localhost:8080/
http://localhost:8080/lego/sets
http://localhost:8080/lego/sets/num-demo
http://localhost:8080/lego/sets/theme-demo
*/
