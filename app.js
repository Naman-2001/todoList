//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();
const date = require(__dirname+ "/date.js");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-naman_075:Test123@todocluster-wadxb.mongodb.net/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list. "
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<--- Hit this to delete an item."
});

const defaultItems = [];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
const day= date.getDate();


app.get("/", function(req, res) {

//   Item.find({}, function(err, founditems) {
//     if (founditems.length === 0) {
//       Item.insertMany(defaultItems, function(err) {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log("Successfully updated the server");
//         }
//       });
//       res.redirect("/");
//     } else {
//       res.render("list", {
//         listTitle: "Today",
//         newListItems: founditems
//       });
//     }
//   });
// })


  Item.find({}, function(err, founditems) {

      res.render("list", {
        listTitle: "Today",
        newListItems: founditems
      });
  });
})



app.get("/about", function(req, res) {
  res.render("about");
});


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundlist) {
    if (!err) {
      if (!foundlist) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundlist.name,
          newListItems: foundlist.items
        })
      }
    }
  });

});


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  })

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    })
  }
});


app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted that checked item");
        res.redirect("/");
      }
    });
  } else {
    //very important function of mongoose with $pull method from mongodb

    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundlist) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
})



app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
