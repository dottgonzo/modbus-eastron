
import * as async from "async";
import * as Promise from "bluebird";
import lsusbdev from "lsusbdev";

const mrtu = require("modbus-serial");

const Models: IModel[] = require('./models.json');
let Model;


const Client = new mrtu();

interface IRegister {
    label: string;
    reg: number;
    group?: string;
}


interface IModel {
    label: string;
    registers: IRegister[];
}





interface EastronDevice {
    dev?: string;
    hub?: string;
    baud: number;
    id: number;
    uid?: string;
    model: string;
    className?: string;
}


export default (o: EastronDevice) => {
    return new Promise((resolve, reject) => {

        let answer: any = {};

        let registers: IRegister[];


        function availablemodels(): string[] {
            let models: string[] = [];

            for (let i = 0; i < Models.length; i++) {

                models.push(Models[i].label);

            }
            return models
        }



        function connectRTU() {

            function start() {

                Client.setID(o.id);
                async.eachSeries(registers, (regi, cb) => {

                    Client.readInputRegisters(regi.reg, 2, (err, data) => {
                        if (err) {
                            cb(err)
                        } else {

                            if (regi.group) {
                                if (!answer[regi.group]) answer[regi.group] = {}
                                answer[regi.group][regi.label] = data.buffer.readFloatBE()
                            } else {
                                answer[regi.label] = data.buffer.readFloatBE()
                            }
                            cb()
                        }

                    })
                }, (err) => {
                    Client.close();
                    if (err) {
                        reject(err)
                    } else {
                        const pkg = require("./package.json")
                        answer.apiVersion = pkg.name + ' - ' + pkg.version;

                        if (o.uid) {
                            answer.uid = o.uid;
                            if (o.className) {
                                answer._id = o.className + "_" + o.uid;
                            } else {
                                answer._id = "data_" + o.uid;
                            }
                        }

                        answer.unixTimestamp = new Date().getTime();
                        resolve(answer)
                    }
                })
            }

            Client.setTimeout(10000);

            Client.connectRTUBuffered(o.dev, { baudrate: o.baud }, start);


        }




        if (!o) {
            reject("No conf provided")
        } else if (!o.dev && !o.hub) {
            reject("No dev")
        } else if (!o.model) {
            reject("No model provided. Available models are: " + availablemodels())
        } else {


            for (let i = 0; i < Models.length; i++) {
                if (Models[i].label === o.model) {
                    registers = Models[i].registers;
                }
            }

            if (registers && registers.length && registers[0] && (registers[0].reg || registers[0].reg === 0) && registers[0].label) {
                if (o.dev) {

                    connectRTU();

                } else if (!o.dev && o.hub) {
                    lsusbdev().then((data) => {

                        for (let i = 0; i < data.length; i++) {
                            if (data[i].hub === o.hub) {
                                o.dev = data[i].dev;
                            }
                        }

                        if (o.dev) {
                            connectRTU();

                        } else {
                            reject("No dev for " + o.hub)

                        }

                    }).catch((err) => {
                        reject(err)

                    })


                }

            } else {
                reject("No model founded. Available models are: " + availablemodels())
            }
        }
    })
}
