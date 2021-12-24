const {model, Schema} = require("mongoose");

const HistorySchema = new Schema({
    amount:{
        type: Number,
        required: true
    },
    userID:{
        type: String,
        required: true
    },
    shortID:{
        type: String,
        required: true
    },
    user:{
        type: Object,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    gateway:{
        type: String,
        required: true,
        default: "Bitcoin"
    },
    proof:{
        type: String,
        required: false,
    },
    address:{
        type: String,
        required: false,
        default: ""
    },
    date:{
        type: Date,
        required: false,
        default: Date.now()
    }
});

module.exports = History = model("History", HistorySchema);