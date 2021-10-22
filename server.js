// Collect required modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require("util");
const { v4: uuidv4 } = require('uuid');

// Set up Port
const app = express();
const PORT = process.env.PORT || 3001;

// Static and data parsing middlewares
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));

// html routes
app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/index.html"))
});

app.get("/notes", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/notes.html"))    
});

// Set up async read/write functions to avoid sync error
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// API route to feed note data to front end
app.get("/api/notes", (req, res)=>{
    console.info(`${req.method} request received to get notes`)
    readFileAsync('db/db.json')
    .then(data=>{
        res.json(JSON.parse(data))
    });
    
});

// API route to collect user input from front end
app.post("/api/notes", (req, res)=>{
    console.info(`${req.method} request received to add a new note`)
    let newNote;
    console.info(req.body)
    readFileAsync('db/db.json')
    .then(data=>{
        const dbNotes = JSON.parse(data)
        newNote = {
            id: uuidv4(),
            title: req.body.title,
            text: req.body.text,
        };
        dbNotes.push(newNote)
        console.info(dbNotes)
        return dbNotes
    })
    .then(data=>{
        writeFileAsync('db/db.json', JSON.stringify(data))
        res.json(data)
    })   
    
});

// API route to delete data from server and reflect back to front end
app.delete("/api/notes/:id", (req, res)=>{
    console.info(`${req.method} request received to delete note ${req.params.id}`)
    readFileAsync('db/db.json')
    .then(data=>{
        let dbNotes = JSON.parse(data)
        console.info(dbNotes)
        let newdbNotes = dbNotes.filter(note=>{return (note.id!=req.params.id)})
        console.info(newdbNotes)
        return newdbNotes
    })
    .then(data=>{
        writeFileAsync('db/db.json', JSON.stringify(data))
        res.json(data)
    })   
    
});

// Error checking lead back to homepage
app.get("*", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/index.html"))    
});

// Listen for PORT
app.listen(PORT, ()=>{
    console.log(`App listening at http://localhost:${PORT}`)
})