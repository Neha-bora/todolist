

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


app.set('view engine' , 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect('mongodb://localhost:27017/todolistDB',{useNewUrlParser:true });

const itemsSchema = new mongoose.Schema({
  name : String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
name: "morning walk"   

});
 
 const item2= new Item({
name: "take a bath"   

});

 const item3 = new Item({
name: "breakfast"   

});


 const defaultItems = [ item1,item2,item3];

 const listSchema = {
  name:String,
  items: [itemsSchema]
 };

 const List = mongoose.model("List", listSchema);


app.get("/", function(req , res){

   Item.find({}, function(err,foundItem){
    if(foundItem.length === 0){
          Item.insertMany(defaultItems , function(err){
           if(err){
            console.log(error);
             }else{
      
            console.log("sucessfully Inseted");

     }
 });
       res.redirect("/");
      }else{
        res.render("list" ,{listTitle:"Today" , newListitems :foundItem });
      }
    
   });
     
   
});


app.get("/:customListItem" , function(req ,res){
  const customListItem=  _.capitalize(req.params.customListItem);
  List.findOne({name:customListItem },function(err, foundList){
   if(!err){
     if(!foundList){
      //show Doesn't exist item

      const list =new List({
      name:customListItem,
      items:defaultItems

      });
      list.save();
      res.redirect("/"+ customListItem);

     }else{
      //show exist item
      res.render("list", {listTitle:foundList.name , newListitems :foundList.items });
     }
   }
  });


});




  app.post("/", function(req , res){
  const itemName = req.body.NewItem;
  const listName = req.body.list;


  const item = new Item({
    name:itemName
  });
   if(listName === "Today"){
      item.save();
      res.redirect("/");
   }else{
      List.findOne({name:listName}, function( err ,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);

    });
   }

 });


 app.post("/delete", function(req , res){
     
    const checkItemId = req.body.checkBox;
   const listName = req.body.listName;

   if ( listName === "Today"){

         Item.findByIdAndRemove(checkItemId , function(err){
          if(!err){
          console.log("sucessfully deleted ");
          res.redirect("/");
          }
          });
   }else{
    List.findOneAndUpdate({name:listName },{$pull: {items: { _id:checkItemId} } }, function(err,foundList ){
       if(!err){
        res.redirect("/"+ listName);
       }
     });

   }
   
  
 });


app.listen(3000, function(){
  console.log("server started on port 3000");
});

