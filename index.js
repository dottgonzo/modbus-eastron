"use strict";
var async = require("async");
var Promise = require("bluebird");
var lsusbdev_1 = require("lsusbdev");
var mrtu = require("modbus-serial");
var Models = require('./models.json');
var Model;
var Client = new mrtu();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (o) {
    return new Promise(function (resolve, reject) {
        var answer = {};
        var registers;
        function availablemodels() {
            var models = [];
            for (var i = 0; i < Models.length; i++) {
                models.push(Models[i].label);
            }
            return models;
        }
        function connectRTU() {
            function start() {
                Client.setID(o.id);
                async.eachSeries(registers, function (regi, cb) {
                    Client.readInputRegisters(regi.reg, 2, function (err, data) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            if (regi.group) {
                                if (!answer[regi.group])
                                    answer[regi.group] = {};
                                answer[regi.group][regi.label] = data.buffer.readFloatBE();
                            }
                            else {
                                answer[regi.label] = data.buffer.readFloatBE();
                            }
                            cb();
                        }
                    });
                }, function (err) {
                    Client.close();
                    if (err) {
                        reject(err);
                    }
                    else {
                        var pkg = require("./package.json");
                        answer.apiVersion = pkg.name + ' - ' + pkg.version;
                        answer.updatedAt = new Date().getTime();
                        answer.model = o.model;
                        answer.direction = o.direction;
                        if (o.uid) {
                            answer.uid = o.uid;
                            if (o.className) {
                                answer._id = o.className + "_" + o.uid + '_' + answer.updatedAt;
                            }
                            else {
                                answer._id = "data_" + o.uid + '_' + answer.updatedAt;
                            }
                        }
                        resolve(answer);
                    }
                });
            }
            Client.setTimeout(10000);
            Client.connectRTUBuffered(o.dev, { baudrate: o.baud }, start);
        }
        if (!o) {
            reject("No conf provided");
        }
        else if (!o.dev && !o.hub) {
            reject("No dev");
        }
        else if (!o.model) {
            reject("No model provided. Available models are: " + availablemodels());
        }
        else {
            for (var i = 0; i < Models.length; i++) {
                if (Models[i].label === o.model) {
                    registers = Models[i].registers;
                }
            }
            if (registers && registers.length && registers[0] && (registers[0].reg || registers[0].reg === 0) && registers[0].label) {
                if (o.dev) {
                    connectRTU();
                }
                else if (!o.dev && o.hub) {
                    lsusbdev_1.default().then(function (data) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].hub === o.hub) {
                                o.dev = data[i].dev;
                            }
                        }
                        if (o.dev) {
                            connectRTU();
                        }
                        else {
                            reject("No dev for " + o.hub);
                        }
                    }).catch(function (err) {
                        reject(err);
                    });
                }
            }
            else {
                reject("No model founded. Available models are: " + availablemodels());
            }
        }
    });
};

//# sourceMappingURL=data:application/json;base64,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LENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7NEJBQ25DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0NBQ3hCLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQzs0QkFDeEIsQ0FBQzt3QkFDTCxDQUFDO3dCQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUNSLFVBQVUsRUFBRSxDQUFDO3dCQUVqQixDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLE1BQU0sQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO3dCQUVqQyxDQUFDO29CQUVMLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFDLEdBQUc7d0JBQ1QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO29CQUVmLENBQUMsQ0FBQyxDQUFBO2dCQUdOLENBQUM7WUFFTCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osTUFBTSxDQUFDLDBDQUEwQyxHQUFHLGVBQWUsRUFBRSxDQUFDLENBQUE7WUFDMUUsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0ICogYXMgYXN5bmMgZnJvbSBcImFzeW5jXCI7XG5pbXBvcnQgKiBhcyBQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuaW1wb3J0IGxzdXNiZGV2IGZyb20gXCJsc3VzYmRldlwiO1xuXG5jb25zdCBtcnR1ID0gcmVxdWlyZShcIm1vZGJ1cy1zZXJpYWxcIik7XG5cbmNvbnN0IE1vZGVsczogSU1vZGVsW10gPSByZXF1aXJlKCcuL21vZGVscy5qc29uJyk7XG5sZXQgTW9kZWw7XG5cblxuY29uc3QgQ2xpZW50ID0gbmV3IG1ydHUoKTtcblxuaW50ZXJmYWNlIElSZWdpc3RlciB7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICByZWc6IG51bWJlcjtcbiAgICBncm91cD86IHN0cmluZztcbn1cblxuXG5pbnRlcmZhY2UgSU1vZGVsIHtcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIHJlZ2lzdGVyczogSVJlZ2lzdGVyW107XG59XG5cblxuXG5cblxuaW50ZXJmYWNlIEVhc3Ryb25EZXZpY2Uge1xuICAgIGRldj86IHN0cmluZztcbiAgICBodWI/OiBzdHJpbmc7XG4gICAgYmF1ZDogbnVtYmVyO1xuICAgIGlkOiBudW1iZXI7XG4gICAgdWlkPzogc3RyaW5nO1xuICAgIG1vZGVsOiBzdHJpbmc7XG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xuICAgIGRpcmVjdGlvbjpzdHJpbmc7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgKG86IEVhc3Ryb25EZXZpY2UpID0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgIGxldCBhbnN3ZXI6IGFueSA9IHt9O1xuXG4gICAgICAgIGxldCByZWdpc3RlcnM6IElSZWdpc3RlcltdO1xuXG5cbiAgICAgICAgZnVuY3Rpb24gYXZhaWxhYmxlbW9kZWxzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgICAgIGxldCBtb2RlbHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICBtb2RlbHMucHVzaChNb2RlbHNbaV0ubGFiZWwpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbW9kZWxzXG4gICAgICAgIH1cblxuXG5cbiAgICAgICAgZnVuY3Rpb24gY29ubmVjdFJUVSgpIHtcblxuICAgICAgICAgICAgZnVuY3Rpb24gc3RhcnQoKSB7XG5cbiAgICAgICAgICAgICAgICBDbGllbnQuc2V0SUQoby5pZCk7XG4gICAgICAgICAgICAgICAgYXN5bmMuZWFjaFNlcmllcyhyZWdpc3RlcnMsIChyZWdpLCBjYikgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIENsaWVudC5yZWFkSW5wdXRSZWdpc3RlcnMocmVnaS5yZWcsIDIsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYihlcnIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlZ2kuZ3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhbnN3ZXJbcmVnaS5ncm91cF0pIGFuc3dlcltyZWdpLmdyb3VwXSA9IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcltyZWdpLmdyb3VwXVtyZWdpLmxhYmVsXSA9IGRhdGEuYnVmZmVyLnJlYWRGbG9hdEJFKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXJbcmVnaS5sYWJlbF0gPSBkYXRhLmJ1ZmZlci5yZWFkRmxvYXRCRSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQ2xpZW50LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwa2cgPSByZXF1aXJlKFwiLi9wYWNrYWdlLmpzb25cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlci5hcGlWZXJzaW9uID0gcGtnLm5hbWUgKyAnIC0gJyArIHBrZy52ZXJzaW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyLnVwZGF0ZWRBdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyLm1vZGVsID0gby5tb2RlbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlci5kaXJlY3Rpb24gPSBvLmRpcmVjdGlvbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG8udWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyLnVpZCA9IG8udWlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvLmNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXIuX2lkID0gby5jbGFzc05hbWUgKyBcIl9cIiArIG8udWlkKydfJythbnN3ZXIudXBkYXRlZEF0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlci5faWQgPSBcImRhdGFfXCIgKyBvLnVpZCsnXycrYW5zd2VyLnVwZGF0ZWRBdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYW5zd2VyKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQ2xpZW50LnNldFRpbWVvdXQoMTAwMDApO1xuXG4gICAgICAgICAgICBDbGllbnQuY29ubmVjdFJUVUJ1ZmZlcmVkKG8uZGV2LCB7IGJhdWRyYXRlOiBvLmJhdWQgfSwgc3RhcnQpO1xuXG5cbiAgICAgICAgfVxuXG5cblxuXG4gICAgICAgIGlmICghbykge1xuICAgICAgICAgICAgcmVqZWN0KFwiTm8gY29uZiBwcm92aWRlZFwiKVxuICAgICAgICB9IGVsc2UgaWYgKCFvLmRldiAmJiAhby5odWIpIHtcbiAgICAgICAgICAgIHJlamVjdChcIk5vIGRldlwiKVxuICAgICAgICB9IGVsc2UgaWYgKCFvLm1vZGVsKSB7XG4gICAgICAgICAgICByZWplY3QoXCJObyBtb2RlbCBwcm92aWRlZC4gQXZhaWxhYmxlIG1vZGVscyBhcmU6IFwiICsgYXZhaWxhYmxlbW9kZWxzKCkpXG4gICAgICAgIH0gZWxzZSB7XG5cblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNb2RlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoTW9kZWxzW2ldLmxhYmVsID09PSBvLm1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lzdGVycyA9IE1vZGVsc1tpXS5yZWdpc3RlcnM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVnaXN0ZXJzICYmIHJlZ2lzdGVycy5sZW5ndGggJiYgcmVnaXN0ZXJzWzBdICYmIChyZWdpc3RlcnNbMF0ucmVnIHx8IHJlZ2lzdGVyc1swXS5yZWcgPT09IDApICYmIHJlZ2lzdGVyc1swXS5sYWJlbCkge1xuICAgICAgICAgICAgICAgIGlmIChvLmRldikge1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RSVFUoKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIW8uZGV2ICYmIG8uaHViKSB7XG4gICAgICAgICAgICAgICAgICAgIGxzdXNiZGV2KCkudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVtpXS5odWIgPT09IG8uaHViKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uZGV2ID0gZGF0YVtpXS5kZXY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoby5kZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0UlRVKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KFwiTm8gZGV2IGZvciBcIiArIG8uaHViKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycilcblxuICAgICAgICAgICAgICAgICAgICB9KVxuXG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KFwiTm8gbW9kZWwgZm91bmRlZC4gQXZhaWxhYmxlIG1vZGVscyBhcmU6IFwiICsgYXZhaWxhYmxlbW9kZWxzKCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
