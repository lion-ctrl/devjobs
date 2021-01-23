const { check, validationResult } = require("express-validator");
const multer = require("multer");
const shortid = require("shortid");
const path = require("path");

const Vacante = require("../models/Vacantes");
// ? configuracion multer
exports.subirCV = (req, res, next) => {
	upload(req, res, function (error) {
		if (error) {
			if (error instanceof multer.MulterError) {
				if (error.code === "LIMIT_FILE_SIZE") {
					req.flash("error", "El archivo es muy grande, maximo 100kb");
				} else {
					req.flash("error", error.message);
				}
			} else if (error) {
				req.flash("error", error.message);
			}
			return res.redirect(`back`);
			// % redirecciona a la vista anterior
		}
		next();
	});
};
const configuracionMulter = {
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, path.join(__dirname + "/../public/uploads/cv"));
		},
		filename: (req, file, cb) => {
			const extension = file.mimetype.split("/")[1];
			// console.log(`${shortid.generate()}.${extension}`);
			cb(null, `${shortid.generate()}.${extension.toLowerCase()}`);
		},
	}),
	fileFilter: (req, file, cb) => {
		if (file.mimetype === "application/pdf") {
			cb(null, true);
			// % el callback se ejecuta como true o false : true cuando la imagen se acepta
		} else {
			cb(new Error("Formato no Valido"));
		}
	},
	limits: { fileSize: 100000 },
};

const upload = multer(configuracionMulter).single("cv");

// ? rutas
exports.formularioNuevaVacante = (req, res) => {
	res.render("nueva-vacante", {
		nombrePagina: "Nueva Vacante",
		tagline: "Llena el formulario y publica tu vacante",
		cerrarSesion: true,
		imagen: req.user.imagen,
		nombre: req.user.nombre,
	});
};

// * validar vacante
exports.validarVacante = [
	check("titulo", "Agrega un titulo a la vacante").escape().notEmpty(),
	check("empresa", "Agrega una Empresa").escape().notEmpty(),
	check("ubicacion", "Agrega una ubicación").escape().notEmpty(),
	check("salario").escape(),
	check("contrato", "Selecciona el tipo de Contrato").escape().notEmpty(),
	check("skills", "Agrega al menos solo una habilidad").escape().notEmpty(),
	function (req, res, next) {
		const errores = validationResult(req);

		if (!errores.isEmpty()) {
			req.flash(
				"error",
				errores.array().map((error) => error.msg)
			);
			res.render("nueva-vacante", {
				nombrePagina: "Nueva Vacante",
				tagline: "Llena el formulario y publica tu vacante",
				cerrarSesion: true,
				nombre: req.user.nombre,
				mensajes: req.flash(),
			});
			return;
		}
		next();
	},
];

exports.crearVacante = async (req, res) => {
	const vacante = new Vacante(req.body);

	vacante.autor = req.user._id;

	// * crear arreglo de habilidades de skills
	vacante.skills = req.body.skills.split(",");

	// * guardar vacante
	const nuevaVacante = await vacante.save();

	res.redirect(`/vacantes/${nuevaVacante.url}`);
};

exports.mostrarVacante = async function (req, res, next) {
	const vacante = await Vacante.findOne({ url: req.params.url }).populate(
		"autor"
	);
	// console.log(vacante);
	// % .populate: funcion que trae los datos de la otra colleccion como si fueran un join

	if (!vacante) return next();

	res.render("vacante", {
		vacante,
		nombrePagina: vacante.titulo,
		barra: true,
	});
};
// * almacenar los candidatos en la bd
exports.contactar = async (req, res, next) => {
	const vacante = await Vacante.findOne({ url: req.params.url });

	if (!vacante) return next();

	const nuevoCandidato = {
		nombre: req.body.nombre,
		email: req.body.email,
		cv: req.file.filename,
	};

	vacante.candidatos.push(nuevoCandidato);

	await vacante.save();

	req.flash("correcto", "Se envio tu curriculum correctamente");
	res.redirect("/");
};

exports.formEditarVacante = async (req, res, next) => {
	const vacante = await Vacante.findOne({ url: req.params.url });

	if (!vacante) return next();

	res.render("editar-vacante", {
		vacante,
		nombrePagina: `Editar - ${vacante.titulo}`,
		cerrarSesion: true,
		imagen: req.user.imagen,
		nombre: req.user.nombre,
	});
};

exports.editarVacante = async (req, res, next) => {
	const vacanteActualizada = req.body;
	vacanteActualizada.skills = req.body.skills.split(",");

	const vacante = await Vacante.findOneAndUpdate(
		{ url: req.params.url },
		vacanteActualizada,
		{ new: true, runValidators: true }
	);
	// % 1er parametro: por que campo va a buscar
	// % 2: los datos para realizar la actualizacion
	// % 3: new: opciones para que devuelva el registro actualizado y no el anterior ,runValidators: para que tome todas las validaciones de la db establecidas en el modelo

	res.redirect(`/vacantes/${vacante.url}`);
};

exports.eliminarVacante = async function (req, res) {
	const { url } = req.params;
	const vacante = await Vacante.findOne({ url });
	if (verificarUsuario(vacante, req.user)) {
		// % verificar que sea el usuario que ingreso el cual elimina la vacante
		await vacante.remove();
		res.status(200).send("Vacante eliminada correctamente");
	} else {
		res.status(403).send("Error");
	}
};

const verificarUsuario = (vacante = {}, usuario = {}) => {
	if (!vacante.autor.equals(usuario._id)) {
		return false;
	}
	return true;
};

// * mostrar candidatos
exports.mostrarCandidatos = async (req, res, next) => {
	const vacante = await Vacante.findById(req.params.id);

	if (vacante.autor != req.user._id.toString()) {
		// % console.log("soy un hacker");
		return next();
	}

	if (!vacante) return next();

	res.render("candidatos", {
		nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
		candidatos: vacante.candidatos,
	});
};

exports.buscador = async (req,res) => {
	const vacantes = await Vacante.find({
		$text:{
			$search:req.body.q
		}
	});
	// console.log(vacante);

	res.render("home",{
		nombrePagina:`Resultados para la busqueda : ${req.body.q}`,
		barra:true,
		vacantes
	});
}