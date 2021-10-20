// Import required packages
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
// ************************************************************************************

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// ************************************************************************************

mongoose.connect("mongodb://localhost:27017/todolistDB")
    .then(() => console.log("Connected to To-Do List DB"))
    .catch(() => console.log("Connection to To-Do List DB failed"));

// ************************************************************************************

const itemsSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "No name specified"]
  }

});

// This collection (items) will contain documents that each pertain to a to-do list item
const Item = mongoose.model("Item", itemsSchema);

// ************************************************************************************

// These are the default items that will populate a new to-do list page
const item1 = new Item({
  name: "Welcome!"
});

const item2 = new Item({
  name: "Click the + button to add an entry and tick the checkbox to delete an entry"
});

const defaultItems = [item1, item2];

// ************************************************************************************

const listSchema = new mongoose.Schema({
  
  name: String,

  items: [itemsSchema]

});

const List = mongoose.model("List", listSchema);

// ************************************************************************************

// If the user sends a GET request to the homepage (Today page) of the to-do list app
app.get("/", (req, res) => {

  // Query the database to obtain all to-do list items pertaining to the Today page (which would
  // be situated in the Item collection)
  Item.find({}, (err, foundItems) => {

    // If there are no documents in this collection, that means this page is being loaded for the first time
    if (foundItems.length === 0) {

      Item.insertMany(defaultItems)
          .then(() => console.log("Successfully inserted items into items collection"))
          .catch(() => console.log("Failed to insert items into items collection"))

      res.redirect("/");

      // If this runs, then there are documents in the items collection, which means there
      // should be to-do list items on the Today page
    } else {

      res.render("list", {

        listTitle: "Today",
        newListItems: foundItems

      });

    }

  });

});

// ************************************************************************************

// This will run if the user sends a GET request for another to-do list page
// e.g. localhost:3000/schoolwork
app.get("/:customListName", (req, res) => {

  // First, obtain the text that the user put into the URL
  const customListName = _.capitalize(req.params.customListName);

  // Then we query the lists collection of the database to try and obtain the document pertaining
  // to that list name
  List.findOne({name: customListName}, (err, foundList) => {

    if (!err){

      // If a document pertaining to that list name does not yet exist, this will run
      if (!foundList){

        // Create a new list document if the list name inserted into the URL by the user
        // does not yet have its corresponding document in the database
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save()
            .then(() => console.log("Successfully saved items to list collection"))
            .catch(() => console.log("Failed to save items to list collection"))

        // Reload the page, which runs this handler again but executing the else
        // clause below instead
        res.redirect("/" + customListName);

        // If a document in the lists collection pertaining to this to-do list page can be found,
        // then this clause will run
      } else {

        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });

      }
    }
  });

});

// ************************************************************************************

app.post("/", (req, res) => {

  // This is the to-do item's content which the user put it into the text box
  const itemName = req.body.newItem;

  // This is from the value given to the submit button
  const listName = req.body.list;

  // Creates a new item with the user's input
  const item = new Item({

    name: itemName

  });

  // If the value of the submit button was today
  // (i.e. the to-do list item posted belongs to the Today page)
  if (listName === "Today") {

    item.save()
        .then(() => console.log("Successfully saved item"))
        .catch(() => console.log("Failed to save item"));

    res.redirect("/");

    // If the value of the submit button was not Today, that implies the to-do list item must belong
    // to another page
  } else {

    List.findOne({name: listName}, (err, foundList) => {

      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);

    });

  }

});

// ************************************************************************************

app.post("/delete", (req, res) => {

  // Each to-do list item's checkbox has the item's id bound to it
  // When the checkbox is checked, the id is sent here, to the back-end
  // With that id, the item can be deleted from the database
  const tickedItemID = req.body.checkbox;

  // This contains the listTitle bound to the hidden input in the list.ejs file
  const listName = req.body.listName;

  if (listName === "Today") {

    Item.findByIdAndRemove(tickedItemID, err => {

      if (!err) {

        console.log("Successfully deleted ticked item.");

        res.redirect("/");

      }

    });

    // If the to-do list item to delete is not from the Today page, then this block
    // will run
  } else {

    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: tickedItemID}}}, err => {

      if (!err){

        // If there was no error during the update, reload the page to see the changes
        res.redirect("/" + listName);

      }

    });

  }

});

// ************************************************************************************

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
