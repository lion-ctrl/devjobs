const Vacante = require("../models/Vacantes");

exports.mostrarTrabajo = async (req,res,next) => {
	const vacantes = await Vacante.find({});

	if (!vacantes) return next();

	res.render("home", {
		nombrePagina: "devJobs",
		tagline: "Encuentra y Publica Trabajos para Desarrolladores Web",
		barra: true,
		boton: true,
		vacantes
	});
};
