import sdm120ct from "../index"

import * as chai from "chai";

const expect = chai.expect;

interface Ipowa {
    power: number;
    import: number;
    export: number;
    total: number;
}





interface IEastron120CT {
    _id?: string;
    uid?: string;
    voltage: number;
    current: number;
    power: number;
    factor: number;
    phaseAngle: number;
    hz: number;
    active: Ipowa;
    reactive: Ipowa;
    apiVersion: string;
    updatedAt: number;
    direction:string;
}


describe("main test", function () {
    this.timeout(50000);

    it("should return an object", function (done) {

        sdm120ct({ baud: 2400, id: 1, dev: "/dev/ttyUSB0", model: 'SDM120CT', direction: 'consumption' }).then((a: IEastron120CT) => {

            expect(a).to.be.an('Object');
            expect(a.active).to.be.an('Object');
            expect(a.reactive).to.be.an('Object');
            expect(a.voltage).to.be.a('number');
            expect(a.current).to.be.a('number');
            expect(a.power).to.be.a('number');
            expect(a.factor).to.be.a('number');
            expect(a.phaseAngle).to.be.a('number');
            expect(a.hz).to.be.a('number');

            expect(a.active.import).to.be.a('number');
            expect(a.active.export).to.be.a('number');
            expect(a.active.total).to.be.a('number');
            expect(a.active.import).to.be.a('number');
            expect(a.active.export).to.be.a('number');
            expect(a.active.total).to.be.a('number');


            expect(a.apiVersion).to.be.a('string');
            expect(a.updatedAt).to.be.a('number');
            expect(a.direction).to.be.a('string');


            done()
        }).catch((err) => {
            done(Error(err))
        })

    });

});