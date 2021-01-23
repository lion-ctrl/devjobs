const { Schema, model } = require("mongoose");
const slug = require("slug");
const shortid = require("shortid");

const vacanteSchema = new Schema({
	titulo: {
		type: String,
		required: "El nombre de la vacante es obligatorio",
		trim: true,
	},
	empresa: {
		type: String,
		trim: true,
	},
	ubicacion: {
		type: String,
		trim: true,
		required: "La ubicacion es obligatoria",
	},
	salario: {
		type: String,
		default: 0,
		trim: true,
	},
	contrato: {
		type: String,
		trim: true,
	},
	descripcion: {
		type: String,
		trim: true,
	},
	url: {
		type: String,
		lowercase: true,
	},
	skills: [String],
	candidatos: [
		{
			nombre: String,
			email: String,
			cv: String,
		},
	],
	autor:{
		type:Schema.Types.ObjectId,
		ref:"usuarios",
		required:"El autor es obligatorio"
	}
});

vacanteSchema.pre("save", function (next) {
    
	// * crear la url
	const url = slug(this.titulo);
	this.url = `${url}-${shortid.generate()}`;
	next();
});

vacanteSchema.index({titulo:"text"});
// % indice para acelerar la busqueda, pero pesa mas en la db 

module.exports = model("vacante", vacanteSchema);
