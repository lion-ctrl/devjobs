// ? express ----
const express = require("express");
const session = require("express-session");
// const expressValidator = require("express-validator");
const flash = require("connect-flash");
// ? handlebars ----
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const {
	allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
// ? mongodb ----
const MongoStore = require("connect-mongo")(session);
// % al colocarle doble parentesis significa que se le estan pasando variables hacia el paquete de connect-mongo
const mongoose = require("mongoose");
// ? nodejs ----
const path = require("path");
// ? passport ----
const passport = require("./config/passport");
// ? manejo de errores
const createError = require("http-errors");

// ? variables de entorno
require("dotenv").config({ path: "variables.env" });

const app = express();
require("./config/db");

// ? settings
app.set("port",4000);
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine(
	"hbs",
	exphbs({
		defaultLayout: "layout",
		layoutsDir: path.join(app.get("views"), "layout"),
		partialsDir: path.join(app.get("views"), "partials"),
		extname: ".hbs",
		helpers: require("./helpers/handlebars"),
		handlebars: allowInsecurePrototypeAccess(Handlebars),
	})
);
app.set("view engine", "hbs");

// ? middlewares
app.use(
	session({
		secret: process.env.SECRETO,
		key: process.env.KEY,
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
	})
);
app.use(passport.initialize());
app.use(passport.session())
// % configuracion de la session para almacenarla en la bd
app.use(flash());

// ? variables Globales
app.use((req, res, next) => {
	res.locals.mensajes = req.flash();
	next();
});

// ? static files
app.use(express.static(path.join(__dirname, "public")));

// ? routes
app.use(require("./routes/index.routes"));
// * 404 pagina no existente
app.use((req,res,next)=>{
	next(createError(404,"No Encontrado"));
})
// * administracion de errores
app.use((error,req,res,next) => {
	// console.log(error.message);
	const status = error.status || 500;
	// % algunas librerias van a generar un error y otras no asi que si no lo envia por defecto cae en 500
	res.locals.mensaje = error.message
	res.locals.status = status;
	res.status(status);
	res.render("error");
});

app.listen(app.get("port"), () => {
	console.log("Server on port", app.get("port"));
});
