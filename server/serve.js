const path = require("path");
const express = require("express");
const url = require("url");
const fs = require("fs");
const sqlite3 = require("sqlite3");

const createIframe = require("node-iframe").default;

const app = express();

app.use(createIframe);

const db_folder = path.join(
    process.env["LOCALAPPDATA"],
    "Microsoft\\Edge\\User Data\\Default"
);

app.use(express.static(path.join(__dirname, "public")));

// Serve the index.html
app.get("/", (req, res) => {
    console.log(title);
    console.log(req);
    console.log(process.env);
    res.render("index");
});

app.get("/iframe", (req, res) => {
    res.createIframe({
        url: req.query.target,
        // baseHref: req.query.baseHref, // optional: determine how to control link redirects,
        // config: { cors: { script: true } }, // optional: determine element cors or inlining #shape src/iframe.ts#L34
    });
});

const defaultTitle = (e) => {
    // Set title as the default value,
    // The default value is the pathname of the url.
    // ! It will change the e.title IN-PLACE
    const parse = url.parse(e.url, true);
    const { pathname } = parse;
    e.title = pathname;
};

app.get("/history", (req, RES) => {
    const { query } = url.parse(req.url, true);

    const limit = query.limit ? query.limit : 20;

    const db_file = path.join(db_folder, "history-latest.db");
    fs.copyFile(path.join(db_folder, "history"), db_file, (err) => {
        if (err) throw err;

        const db = new sqlite3.Database(db_file, (err) => {
            if (err) throw err;
        });

        const cmd = `SELECT title, last_visit_time, url FROM urls WHERE url NOT GLOB 'http://localhost*' AND url NOT GLOB 'file://*' ORDER BY last_visit_time DESC LIMIT ${limit};`;

        db.all(cmd, (err, res) => {
            if (err) {
                // throw err;
                console.error(err);
                RES.status(400).send(err);
                return;
            }
            console.log("--------");
            console.log(cmd);
            console.log(`Found ${res.length} entries`);

            res.map((e) => {
                if (!e.title) defaultTitle(e);
            });

            RES.status(200).json(res);
        });

        db.close();
    });
});

app.listen(3000, function () {
    console.log("Listening on port 3000!");
});
