const {model, Schema} = require("mongoose");

const UserSchema = new Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    balance:{
        type: Number,
        required: false,
        default: 0
    }, 
    last_deposit:{
        type: Number,
        required: false,
        default: 0
    }, 
    total_withdraw: {
        type: Number,
        required: false,
        default: 0
    },
    balance:{
        type: Number,
        required: false,
        default: 0
    },  
    capital:{
        type: Number,
        required: false,
        default: 0
    },
    profit:{
        type: Number,
        required: false,
        default: 0
    },
    debt:{
        type: Number,
        required: false,
        default: 0
    },
    pending:{
        type: Number,
        required: false,
        default: 0
    },
    account_plan:{
        type: String,
        required: false,
        default: "NONE"
    },
    regDate:{
        type: Date,
        required: false,
        default: Date.now()
    }
});

module.exports = User = model("User", UserSchema);