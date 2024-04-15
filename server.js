const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

mongoose
  .connect("mongodb+srv://adi213:73yaNe1nC2doGPrK@helloworld.echvwnw.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
  });

const craftSchema = new mongoose.Schema({
  name: String,
  description:String,
  supplies:[String],
  image: String
});

const Craft = mongoose.model("Craft", craftSchema);


//show our index file when they go to the root of our website
app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/index.html");
});

app.get("/api/crafts", async (req, res)=>{
    const crafts = await Craft.find();
    res.send(crafts);
});

app.get("/api/crafts/:id", async (req, res) => {
    const id = req.params.id;
    const craft = await Craft.findOne({_id:id});
    res.send(craft);
});

app.post("/api/crafts", upload.single("img"), async (req, res) => {
  const result = validateCraft(req.body);

  if(result.error){
    res.status(400).send(result.error.details[0].message);
  }

    const craft = new Craft({
      name: req.body.name,
      description:req.body.description,
      supplies:req.body.supplies.split(",")
    });

    if(req.file){
      craft.image = req.file.filename;
    }
    
    createCraft(res, craft);
});

const createCraft = async (res, craft) => {
    const saveResult = await craft.save();
    res.send(craft);
}

app.put("/api/crafts/:id", upload.single("img"), async (req, res) => {
    const result = validateCraft(req.body);

    if(result.error){
      res.status(400).send(result.error.details[0].message);
      return;
    }
  
    let fieldsToUpdate = {
      name:req.body.name,
      description:req.body.description,
      supplies:req.body.supplies.split(",")
    };
  
    if(req.file){
      fieldsToUpdate.image = req.file.filename;
    }
  
    const id = req.params.id;
  
    const updateResult = await Craft.updateOne({_id:id},fieldsToUpdate);
    res.send(updateResult);
});

app.delete("/api/crafts/:id", async (req, res) => {
    const craft = await Craft.findByIdAndDelete(req.params.id);
    res.send(craft);
});
  
const validateCraft = (craft) => {
  const schema = Joi.object({
    _id:Joi.allow(""),
    supplies:Joi.allow(""),
    name:Joi.string().min(3).required(),
    description:Joi.string().min(3).required()
  });

  return schema.validate(craft);
};

app.listen(3002, ()=> {
    console.log("I'm listening");
});