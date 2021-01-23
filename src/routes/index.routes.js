const router = require("express").Router();

const homeController = require("../controllers/homeController");
const vacantesController = require("../controllers/vacantesController");
const usuariosController = require("../controllers/usuariosController");
const authController = require("../controllers/authController");

router
	.get("/", homeController.mostrarTrabajo)
	// ? vacantes
	// * crear vacante
	.get(
		"/vacantes/nueva",
		authController.verificarUsuario,
		vacantesController.formularioNuevaVacante
	)
	.post(
		"/vacantes/nueva",
		authController.verificarUsuario,
		vacantesController.validarVacante,
		vacantesController.crearVacante
	)
	// * mostrar vacante
	.get("/vacantes/:url", vacantesController.mostrarVacante)
	// * recibir vacantes de candidatos
	.post(
		"/vacantes/:url",
		vacantesController.subirCV,
		vacantesController.contactar
	)
	// * editar vacante
	.get(
		"/vacantes/editar/:url",
		authController.verificarUsuario,
		vacantesController.formEditarVacante
	)
	.post(
		"/vacantes/editar/:url",
		authController.verificarUsuario,
		vacantesController.validarVacante,
		vacantesController.editarVacante
	)
	// * eliminar vacante
	.delete(
		"/vacantes/eliminar/:url",
		authController.verificarUsuario,
		vacantesController.eliminarVacante
	)
	// ? cuentas
	// * crear cuenta
	.get("/crear-cuenta", usuariosController.formCrearCuenta)
	.post(
		"/crear-cuenta",
		usuariosController.validarUsuario,
		usuariosController.crearUsuario
	)
	// * iniciar sesion
	.get("/iniciar-sesion", usuariosController.formIniciarSesion)
	.post("/iniciar-sesion", authController.autenticarUsuario)
	// * cerrar sesion
	.get(
		"/cerrar-sesion",
		authController.verificarUsuario,
		authController.cerrarSesion
	)
	// * resetear password
	.get("/reestablecer-password",authController.formReestablecerPassword)
	.post("/reestablecer-password",authController.enviarToken)
	// * mostrar formulario para recuperacion de password
	.get("/reestablecer-password/:token",authController.formNuevoPassword)
	.post("/reestablecer-password/:token",authController.guardarPassword)
	// ? panel de administracion
	.get(
		"/administracion",
		authController.verificarUsuario,
		authController.mostrarPanel
	)
	// * editar Perfil
	.get(
		"/editar-perfil",
		authController.verificarUsuario,
		usuariosController.formEditarPerfil
	)
	.post(
		"/editar-perfil",
		authController.verificarUsuario,
		// usuariosController.validarPerfil,
		usuariosController.subirImagen,
		usuariosController.editarPerfil
	)

	// ? candidatos
	.get(
		"/candidatos/:id",
		authController.verificarUsuario,
		vacantesController.mostrarCandidatos
	)
	// ? buscador de vacantes
	.post("/buscador",vacantesController.buscador)


module.exports = router;
