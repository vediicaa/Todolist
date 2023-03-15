//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash"); //capitlaizing


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

/*const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];*/ //using monogoose here

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});


//creating a new schema
const itemsSchema={
  name: String
};

//creating mongoose model
const Item=mongoose.model("Item",itemsSchema);

const Item1=new Item({
  name:"Welcome to your To Do list"
});
const Item2=new Item({
  name:"Hit the + button to delete an item"
});
const Item3=new Item({
  name:"<-- hit this to delete an item"
});

const defaultItems=[Item1,Item2,Item3];

//listschema
const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({}).then(function(foundItems,err){
if(foundItems.length===0)
{
  Item.insertMany(defaultItems).then(function(err){
    if(err)
    {
      console.log(err);
    }
    else
    {
      console.log("success!");
    }
  });
  res.redirect("/");
}
else
  {res.render("list", {listTitle: "Today", newListItems: foundItems});}
});
});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);
List.findOne({name: customListName}).then(function(foundList,err){
  if(!err)
  {
    if(!foundList)
    {
      //creating the list
      const list=new List({
        name:customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }
    else{
      //this is where we show the existing list
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
  }
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });

if(listName==="Today"){
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name:listName}).then(function(foundList,err){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+ listName);
  })
}
});
console.log("here");
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemId).then(function(err){
      if(err)
      console.log(err);
      else
      console.log("Succesfully removed the item");
      res.redirect("/");

  });
  }
   else
   {
     List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}}).then(function(foundList,err){
       if(!err)
       {
         res.redirect("/"+ listName);
       }
     });
   }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
