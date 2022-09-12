const fs = require('fs');
const dayjs = require('dayjs');

const DBpath = "MIRROR/logs/status.json";
let status = process.argv[2];
let type = process.argv[3];
const max = 4;

const typelist = {
    "ubuntu": 0,
    "putty": 1,
    "vim": 2,
    "mplayer": 3,
};

const time = dayjs().format('YYYY MM-DD HH:mm:ss A');



fs.readFile(DBpath, 'utf8', (error, jsonFile) => {
    if (error) return console.log(error);
    data = JSON.parse(jsonFile);

    if (type in typelist && status == "success") {
        if (data["pkgs"][typelist[type]]["status"] == "syncing") {
            data["syncing"]--;
        }
        data["pkgs"][typelist[type]]["status"] = status;
        data["active"]++;
        data["pkgs"][typelist[type]]["last_success"] = time;
        if (max < data["active"]) {
            console.log("Exception: active pkgs > max active pkgs");
            process.exit();
        } else {
            if (data["failed_history"][typelist[type]]["isFailed"] == true) {
                data["failed_history"][typelist[type]]["isFailed"] = false;
                data["failed"]--;
            }
        }
        fs.writeFile(DBpath, JSON.stringify(data), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    if (type in typelist && status == "syncing") {
        data["pkgs"][typelist[type]]["status"] = status;
        data["syncing"]++;
        data["active"]--;
        if (max < data["syncing"]) {
            console.log("Exception: active pkgs > max syncing pkgs");
            process.exit();
        } else {
            if (data["failed_history"][typelist[type]]["isFailed"] == true) {
                data["failed_history"][typelist[type]]["isFailed"] = false;
                data["failed"]--;
                data["active"]++;
            }
        }
        fs.writeFile(DBpath, JSON.stringify(data), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    if (type in typelist && status == "failed") {
        if (data["pkgs"][typelist[type]]["status"] == "syncing") {
            data["syncing"]--;
        }
        data["pkgs"][typelist[type]]["status"] = status;
        data["failed"]++;
        if (max < data["failed"]) {
            console.log("Exception: active pkgs > max failed pkgs");
            process.exit();
        } else {
            data["failed_history"][typelist[type]]["isFailed"] = true;
        }
        fs.writeFile(DBpath, JSON.stringify(data), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

});
