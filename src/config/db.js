const mongoose = require("mongoose");
require("dotenv").config({ path: "variables.env" });

mongoose
	.connect(process.env.DATABASE, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify:false,
		useCreateIndex:true
	})
	.then((db) => console.log("DB is Connected"))
	.catch((err) => console.log(err));

require("../models/Usuarios")
