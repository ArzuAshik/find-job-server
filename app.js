const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectID = require("mongodb").ObjectID;
const app = express();
const MongoClient = require("mongodb").MongoClient;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Root API
app.get("/", (req, res) => {
    res.send("Welcome to Job Finding Website");
  });


// MongoDB Connect
const uri = `mongodb+srv://arzu:AR12345678@cluster0.f4nia.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect(e => {
    console.log("mondodb status =>", e || "Connected");
    // All collections
    const users = client
    .db("findJobDB")
    .collection("users");
    const jobs = client
    .db("findJobDB")
    .collection("jobs");
    const applications = client
    .db("findJobDB")
    .collection("applications");
  
    //   collections end
    // ------------------------------------------------  
   
    //==================== All API =========================
    app.get("/all-jobs", (req, res) => {
        jobs.find({})
        .toArray((err, allJobs) => res.send(allJobs));
    });
    app.post("/my-jobs", (req, res) => {
        const {userID} = req.body;
        jobs.find({ userID })
        .toArray((err, myJobs) => res.send(myJobs));
    });
    app.get("/pending-jobs", (req, res) => {
        jobs.find({status: 0})
        .toArray((err, pendingJobs) => res.send(pendingJobs));
    });
    app.post("/post-job", (req, res) => {
        const {userID, tag, companyName, price, description} = req.body;
        if(userID && tag && companyName && price && description){
            jobs.insertOne({userID, tag, company_name: companyName, price, description, status: 0})
            .then(() => {
              res.send("Success");
            });
        }else{
            res.send("failed");
        }
    });
    app.post("/apply-for-job", (req, res) => {
        const {name, jobID, userID} = req.body;
        if(userID && name && jobID){
            applications.insertOne({name, jobID, userID})
            .then((e) => {
              res.send("Success");
            });
        }else{
            res.send("failed");
        }
    });
    app.post("/application-for-single-job", (req, res) => {
        const {jobID} = req.body;
        applications.find({jobID})
        .toArray((err, app) => res.send(app));
    });

    app.post("/sign-up", (req, res) => {
        const {name, accountType, email, password} = req.body;
        if(accountType && name && email && password){
            users.insertOne({name, accountType, email, password, accountBalance: 0})
            .then(() => {
              res.send("Success");
            });
        }else{
            res.send("failed");
        }
    });
    app.post("/payment-success", (req, res) => {
        const {userID, amount: accountBalance = 0} = req.body;
        users.updateOne({ _id: ObjectID(userID) }, {$set: {accountBalance}})
        .then(result => {
            if(result.modifiedCount > 0){
                res.send("Payment Successful.");
            }else{
                res.send("Payment Failed!");
            }
          });
    });
    app.post("/update-job-status", (req, res) => {
        const {jobID} = req.body;
        jobs.updateOne({ _id: ObjectID(jobID) }, {$set: {status: 1}})
        .then(result => {
            if(result.modifiedCount > 0){
                res.send("Update Successful.");
            }else{
                res.send("Update Failed!");
            }
          });
    });
    
    app.post("/log-in", (req, res) => {
        const {email, password} = req.body;
        users.findOne({ email, password })
        .then(user => {
            const {_id: userID, name, accountType, email, accountBalance} = user;
            res.send({userID, name, accountType, email, accountBalance});
        });
    });    
  
});
// API End
  
    // Listening Request
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });