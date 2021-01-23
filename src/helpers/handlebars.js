module.exports = {
	seleccionarSkills: (seleccionadas = [], opciones) => {
		// console.log(seleccionadas);
		// % el primera parametro es lo que se pasa por parametro desde le template
		// console.log(opciones);
		// % opciones: son las opciones que se permiten realizar en el template
		// % fn(): funcion que muestra lo que posee dentro del html estatico osea lo que ya tiene dentro de la funcion por decirlo asi
		const skills = [
			"HTML5",
			"CSS3",
			"CSSGrid",
			"Flexbox",
			"JavaScript",
			"jQuery",
			"Node",
			"Angular",
			"VueJS",
			"ReactJS",
			"React Hooks",
			"Redux",
			"Apollo",
			"GraphQL",
			"TypeScript",
			"PHP",
			"Laravel",
			"Symfony",
			"Python",
			"Django",
			"ORM",
			"Sequelize",
			"Mongoose",
			"SQL",
			"MVC",
			"SASS",
			"WordPress",
		];

		let html = "";

		skills.forEach((skill) => {
			html += `
                <li ${seleccionadas.includes(skill) && 'class="activo"'}>${skill}</li>
            `;

		});
        return (opciones.fn().html = html);
        // % ver de donde sale esa funcion fn parece que de handlebars
	},
	tipoContrato:(seleccionado,opciones)=>{
		return opciones.fn(this).replace(
			// new RegExp(`value="${seleccionado}"`),'$& selected="selected"'
			`value="${seleccionado}"`,'selected="selected"'
		)
	},
	mostrarAlertas:(errores={},alertas) => {
		const categoria = Object.keys(errores)
		let html="";
		if (categoria.length) {
			errores[categoria[0]].forEach(error=>{
				html += `
				<div class="${categoria} alerta">
					${error}
				</div>`.trim();
			})
			return alertas.fn().html = html;
		}

	}
};
