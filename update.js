/**
    Geoul-Backend
    2022 doyeonkim, (alias. viento)
*/

const fs = require('fs');
const dayjs = require("dayjs");
let time = dayjs().format("YYYY-MM-DD HH:mm:ss");

const DBpath = "/ssd/MIRROR/logs/status.json";
let status = process.argv[2];
let type = process.argv[3];

fs.readFile(DBpath, 'utf8', (error, jsonFile) => {
    if (error) return console.log(error);
    data = JSON.parse(jsonFile);

    try {
        if (type && status == "success") {

            dataset = data["package"][type]["status"];

            if (dataset["updated"] == null) {

                let isoTime = new Date().toISOString();

                let newData = { "timestamp": isoTime };

                let finalData = Object.assign({}, newData);
                dataset["updated"] = finalData;

            }
            if (dataset["updating"] != null) {

                dataset["updating"] = null;

            }
            if (dataset["failed"] != null) {

                dataset["failed"] = null;

            }

            let isoTime = new Date().toISOString();
            data["package"][type]["status"]["updated"]["timestamp"] = isoTime;
            console.log(type, `: sync success at ${time}`);

        } else if (type && status == "syncing") {

            let isoTime = new Date().toISOString();

            let newData = { "timestamp": isoTime };
            let finalData = Object.assign({}, newData);

            data["package"][type]["status"]["updating"] = finalData;
            console.log(type, `: sync begins at ${time}`);

        } else if (type && status == "failed") {

            dataset = data["package"][type]["status"];
            let isoTime = new Date().toISOString();

            if (dataset["updating"] != null) {

                dataset["updating"] = null;

            }
            if (dataset["failed"] != null) {

                dataset["failed"]["timestamp"] = isoTime;
                dataset["failed"]["count"]++;

            } else {


                let newData = { "timestamp": isoTime, "count": Number(1) };
                let finalData = Object.assign({}, newData);

                dataset["failed"] = finalData;

            }

            console.log(type, `: sync failed at ${time}`);

        }
        fs.writeFile(DBpath, JSON.stringify(data), (err) => {
            if (err) {
                console.log(err);
            }
        });
    } catch (e) {
        console.log(e);
    }
});
