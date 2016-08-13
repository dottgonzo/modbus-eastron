import sdm120ct from "./index"

sdm120ct({ baud: 2400, id: 1, dev: "/dev/ttyUSB0", model: 'SDM120CT' }).then((a) => {
    console.log(a)
}).catch((err) => {
    throw Error(err)
})
