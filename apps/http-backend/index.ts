import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("hi from http-backend")
})

app.listen(6000, () => {
    console.log("listening on port 6000")
})