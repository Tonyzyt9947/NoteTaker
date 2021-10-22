const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require("util");
const e = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/index.html"))
});

// app.get("*", (req, res)=>{
//     res.sendFile(path.join(__dirname, "public/index.html"))    
// });

app.get("/notes", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/notes.html"))    
});

app.get("/api/notes", (req, res)=>{
    console.info(`${req.method} request received to get notes`)
    readFileAsync('db/db.json')
    .then(data=>{
        res.json(JSON.parse(data))

    });
    
});

app.post("/api/notes", (req, res)=>{
    console.info(`${req.method} request received to add a new note`)
    let newNote;
    console.info(req.body)
    if(req.body && req.body.title && req.body.text){
        
        readFileAsync('db/db.json')
        .then(data=>{
            const dbNotes = JSON.parse(data)
            newNote = {
                id: dbNotes.length+1,
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
        
    }
    else{
        res.json(JSON.stringify(req.body)+'Please enter both note title and note text.')
    }    
    
});

app.listen(PORT, ()=>{
    console.log(`App listening at ${PORT}`)
})