const { model, Schema } = require("mongoose");
const bcrypt = require("bcrypt");

const UsuarioSchema = new Schema(
	{
		email: {
			type: String,
			index: {
				unique: true,
			},
			lowercase: true,
			trim: true,
			required: true,
		},
		nombre: {
			type: String,
			required: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			trim: true,
		},
		imagen:String,
		token: String,
		expira: Date,
	},
	{
		timestamps: true,
	}
);

// * hashear password
UsuarioSchema.pre("save", async function (next) {
	// * si el password ya esta hasheado
	if (!this.isModified("password")) {
		return next();
	} else {
		// * si el password no esta hasheado
		const hash = await bcrypt.hash(this.password, 12);
		this.password = hash;
		next();
	}
});
UsuarioSchema.post("save", function (error, doc, next) {
	// % post: funcion que se ejecuta luego de tratar de guardar el documento
	if (error.name === "MongoError" && error.code === 11000) {
		next("Ese correo ya esta registrado");
	} else {
		next(error);
		// % pueden ocurrir varios tipos de errores asi que siempre debe continuar
	}
});

UsuarioSchema.methods = {
	compararPassword: function (password) {
		return bcrypt.compareSync(password, this.password);
	},
};

module.exports = model("usuarios", UsuarioSchema);
