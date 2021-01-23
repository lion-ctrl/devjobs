const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const util = require("util");
const path = require("path");

const emailConfig = require("../config/email");

let transport = nodemailer.createTransport({
	host: emailConfig.host,
	port: emailConfig.port,
	auth: emailConfig.auth,
});

// * utilizar template de hbs
const handlebarOptions = {
	viewEngine: {
		// extName: ".hbs",
		// partialsDir: path.join(__dirname, "/../views/emails"),
		defaultLayout: false,// % importante esta linea de codigo, si no la colocas no deja enviar el email
	},
	viewPath: path.join(__dirname, "/../views/emails"),
	extName: ".hbs",
};
transport.use(
	"compile",
	hbs(handlebarOptions)
);

exports.enviar = async (opciones) => {
	// console.log(opciones.archivo);
	const opcionesEmail = {
		from: "devJobs <noreply@devjobs.com>",
		to: opciones.usuario.email,
		subject: opciones.subject,
		template: opciones.archivo,
		context: {
			resetUrl: opciones.resetURL,
		},
		// % todo lo que se coloca dentro de context se puede utilizar dentro del template para hacer templates dinamicos, como variables
	};

	const sendMail = util.promisify(transport.sendMail, transport);
	return sendMail.call(transport, opcionesEmail);
};
