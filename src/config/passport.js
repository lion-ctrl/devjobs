const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const Usuarios = require("../models/Usuarios")

passport.use(
	new localStrategy(
		{
			usernameField: "email",
			passwordField: "password",
		},
		async (email, password, done) => {
			const usuario = await Usuarios.findOne({ email });

			if (!usuario) {
				return done(null, false, { message: "Usuario no Existente" });
			}

			const verificarPass = usuario.compararPassword(password);

			if (!verificarPass) {
				return done(null, false, { message: "Contraseña incorrecta" });
			}

			return done(null, usuario);
		}
	)
);

passport.serializeUser((usuario, done) => done(null, usuario._id));

passport.deserializeUser(async (_id, done) => {
	const usuario = await Usuarios.findOne({_id});
	return done(null, usuario);
});

module.exports=passport;