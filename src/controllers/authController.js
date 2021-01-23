const crypto = require("crypto");
const enviarEmail = require("../handlers/email");

const passport = require("passport");
const Vacantes = require("../models/Vacantes");

const Usuarios = require("../models/Usuarios");

exports.autenticarUsuario = passport.authenticate("local", {
	successRedirect: "/administracion",
	failureRedirect: "/iniciar-sesion",
	failureFlash: true,
	badRequestMessage: "Ambos campos son obligatorios",
});

exports.verificarUsuario = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect("/iniciar-sesion");
};

exports.cerrarSesion = (req, res, next) => {
	req.logout();
	req.flash("correcto", "Cerraste Sesión Correctamente");
	res.redirect("/iniciar-sesion");
};

exports.mostrarPanel = async (req, res) => {
	// * consultar el usuario autenticado
	const vacantes = await Vacantes.find({ autor: req.user._id });
	res.render("administracion", {
		nombrePagina: "Panel de Administración",
		tagline: "Crea y Administra tus Vacantes desde aquí",
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
		vacantes,
	});
};

// * reestablecer password
exports.formReestablecerPassword = (req, res) => {
	res.render("reestablecer-password", {
		nombrePagina: "Reestablece tu Contraseña",
		tagline:
			"Si ya tienes una cuenta pero olvidastes tu contraseña, coloca tu email",
	});
};

// * guardar token
exports.enviarToken = async (req, res) => {
	const usuario = await Usuarios.findOne({ email: req.body.email });

	if (!usuario) {
		req.flash("error", "No existe esa cuenta");
		res.redirect("/iniciar-sesion");
		return;
	}
	usuario.token = crypto.randomBytes(20).toString("hex");
	usuario.expira = Date.now() + 3600000;

	await usuario.save();

	const resetURL = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

	// console.log(resetURL);
	// *  enviar correo
	await enviarEmail.enviar({
		usuario,
		subject: "Reestablecer Contraseña",
		resetURL,
		archivo: "reset",
	});

	req.flash("correcto", "Revisa tu email para recuperar la contraseña");
	res.redirect("/iniciar-sesion");
};

// * valida si el token es valido
exports.formNuevoPassword = async (req, res) => {
	const usuario = await Usuarios.findOne({
		token: req.params.token,
		expira: { $gt: Date.now() },
	});

	if(!usuario){
		req.flash("error","El formulario ya no es valido, intenta de nuevo");
		return res.redirect("/reestablecer-password");
	}

	res.render("nuevo-password",{
		nombrePagina:"Nueva Contraseña"
	})
};

exports.guardarPassword = async (req,res) => {	
	const usuario = await Usuarios.findOne({
		token: req.params.token,
		expira: { $gt: Date.now() },
	});
	// % se revisa nuevamente si deja la vista abierta por horas otra persona puede cambiar su password

	if(!usuario){
		req.flash("error","El formulario ya no es valido, intenta de nuevo");
		return res.redirect("/reestablecer-password");
	}

	// * limpiar los datos previos
	usuario.password = req.body.password;
	usuario.token = undefined;
	usuario.expira = undefined;

	await usuario.save();

	req.flash("correcto","Contraseña modificada satisfactoriamente");
	res.redirect("/iniciar-sesion");
}