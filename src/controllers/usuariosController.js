const mongoose = require("mongoose");
const Usuarios = mongoose.model("usuarios");
// % otra forma de importar el modelo
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const shortid = require("shortid");

const path = require("path");

// ? configuracion multer
exports.subirImagen = (req, res, next) => {
	upload(req, res, function (error) {
		if (error) {
			if (error instanceof multer.MulterError) {
				if (error.code === "LIMIT_FILE_SIZE") {
					req.flash("error", "Imagen muy pesada, maximo 100kb");
				} else {
					req.flash("error",error.message)
				}
			} else if (error) {
				req.flash("error", error.message);
			}
			return res.redirect("back");
		}
		next();
	});
};
const configuracionMulter = {
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, path.join(__dirname + "/../public/uploads/perfiles"));
		},
		filename: (req, file, cb) => {
			const extension = file.mimetype.split("/")[1];
			// console.log(`${shortid.generate()}.${extension}`);
			cb(null, `${shortid.generate()}.${extension.toLowerCase()}`);
		},
	}),
	fileFilter: (req, file, cb) => {
		if (
			file.mimetype === "image/jpeg" ||
			file.mimetype === "image/png" ||
			file.mimetype === "image/jpg"
		) {
			cb(null, true);
			// % el callback se ejecuta como true o false : true cuando la imagen se acepta
		} else {
			cb(new Error("Formato no Valido"));
		}
	},
	limits: { fileSize: 100000 },
};

const upload = multer(configuracionMulter).single("imagen");

// ? rutas
exports.formCrearCuenta = (req, res) => {
	res.render("crear-cuenta", {
		nombrePagina: "Crea tu cuenta en DevJobs",
		tagline:
			"Comienza a publicar tus Vacantes Gratis, solo debes crear una Cuenta",
	});
};

exports.validarUsuario = [
	check("nombre", "El nombre es Obligatorio").not().isEmpty().escape(),
	check("email")
		.isEmail()
		.withMessage("Debes ingresar un E-mail valido")
		.normalizeEmail()
		.escape()
		.not()
		.isEmpty(),
	check("password", "La contraseña no puede estar vacia")
		.escape()
		.not()
		.isEmpty(),
	check("c_password", "Confirmar contraseña no puede estar vacia")
		.escape()
		.not()
		.isEmpty(),
	check("c_password").custom((value, { req }) => {
		if (value !== req.body.password) {
			// console.log(req.body.password, req.body.c_password);
			throw new Error("Las Contraseñas no son iguales");
		}
		return true;
	}),
];

exports.crearUsuario = async (req, res, next) => {
	const errores = validationResult(req);

	if (!errores.isEmpty()) {
		req.flash(
			"error",
			errores.array().map((error) => error.msg)
		);
		res.render("crear-cuenta", {
			nombrePagina: "Crea tu cuenta en DevJobs",
			tagline:
				"Comienza a publicar tus Vacantes Gratis, solo debes crear una Cuenta",
			mensajes: req.flash(),
		});
		return;
	}

	try {
		const usuario = new Usuarios(req.body);
		const nuevoUsuario = await usuario.save();

		if (!nuevoUsuario) return next();

		res.redirect("/iniciar-sesion");
	} catch (error) {
		// console.log(error);
		req.flash("error", error);
		res.redirect("/crear-cuenta");
	}
};

exports.formIniciarSesion = (req, res) => {
	res.render("iniciar-sesion", { nombrePagina: "Iniciar Sesión DevJobs" });
};

exports.formEditarPerfil = (req, res) => {
	res.render("editar-perfil", {
		nombrePagina: "Edita tu Perfil en DevJobs",
		usuario: req.user,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen:req.user.imagen
	});
};

exports.validarPerfil = [
	check("nombre", "El nombre no puede ir vacio").escape().notEmpty(),
	check("email", "EL E-mail no puede ir vacio").escape().notEmpty(),
	check("password").escape(),
	function (req, res, next) {
		const errores = validationResult(req);

		if (!errores.isEmpty()) {
			req.flash(
				"error",
				errores.array().map((error) => error.msg)
			);
			res.render("editar-perfil", {
				nombrePagina: "Edita tu Perfil en DevJobs",
				usuario: req.user,
				cerrarSesion: true,
				nombre: req.user.nombre,
				mensajes: req.flash(),
			});
			return;
		}

		next();
	},
];

exports.editarPerfil = async (req, res) => {
	const usuario = await Usuarios.findById(req.user._id);

	usuario.nombre = req.body.nombre;
	usuario.email = req.body.email;

	if (req.body.password) {
		usuario.password = req.body.password;
	}

	if (req.file) {
		usuario.imagen = req.file.filename;
	}

	await usuario.save();

	req.flash("correcto", "Cambios Guardados Correctamente");

	res.redirect("/administracion");
};
