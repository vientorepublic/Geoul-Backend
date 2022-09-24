/**
    Geoul-Backend
    2022 doyeonkim, (alias. viento)
*/

const fs = require('fs');
const dayjs = require('dayjs');

const DBpath = "/ssd/MIRROR/logs/status.json";
let status = process.argv[2];
let type = process.argv[3];
const max = 4;

const typelist = {
    "ubuntu": 0,
    "putty": 1,
    "vim": 2,
    "mplayer": 3,
};

const time = dayjs().format('YYYY MM DD HH:mm:ss A');

fs.readFile(DBpath, 'utf8', (error, jsonFile) => {
    if (error) return console.log(error);
    data = JSON.parse(jsonFile);

    if (type in typelist && status == "success") {
        if (data["pkgs"][typelist[type]]["status"] == "syncing") {
            data["syncing"]--;
        }
        if (data["failed_history"][typelist[type]]["isFailed"] == true) {
            data["failed_history"][typelist[type]]["isFailed"] = false;
            data["failed"]--;
        }
        if (max < data["active"]) {
            console.log("Exception: active pkgs > max active pkgs");
            process.exit();
        }
        data["pkgs"][typelist[type]]["status"] = "success";
        data["active"]++;
        data["pkgs"][typelist[type]]["last_success"] = time;
        fs.writeFile(DBpath, JSON.stringify(data), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    if (type in typelist && status == "syncing") {
        if (max < data["syncing"]) {
            console.log("Exception: active pkgs > max syncing pkgs");
            process.exit();
        }
        if (data["failed_history"][typelist[type]]["isFailed"] == true) {
            data["failed_history"][typelist[type]]["isFailed"] = false;
            data["failed"]--;
            data["active"]++;
        }
        data["pkgs"][typelist[type]]["status"] = "syncing";
        data["syncing"]++;
        data["active"]--;
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
        if (max < data["failed"]) {
            console.log("Exception: active pkgs > max failed pkgs");
            process.exit();
        }
        if (max < data["failed"]) {
            console.log("Exception: active pkgs > max failed pkgs");
            process.exit();
        } else {
            data["failed_history"][typelist[type]]["isFailed"] = true;
        }
        data["pkgs"][typelist[type]]["status"] = "failed";
        data["failed"]++;
        fs.writeFile(DBpath, JSON.stringify(data), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

});
