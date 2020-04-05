const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TaskManager', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => {
    console.log("Connected to mongodb successfully");

}).catch((e) => {
    console.log("Error while attempting to connect to mongodb ");
    console.log(e);

});

//mongoose.set('userCreateIndex', true);
//mongoose.set('userFindAndModify', false);

module.exports = {
    mongoose
};