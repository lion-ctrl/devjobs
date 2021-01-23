import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
	// * activar skills
	const skills = document.querySelector("ul.lista-conocimientos");
	skills && skills.addEventListener("click", agregarSkills);
	skills && skillsSeleccionados();

	// * limpiar alertas
	const alertas = document.querySelector(".alertas");
	alertas && limpiarAlertas(alertas);

	// * eliminar vacante
	const vacantesListado = document.querySelector(".panel-administracion");
	vacantesListado && vacantesListado.addEventListener("click", accionesListado);
});

const skills = new Set();
const agregarSkills = (e) => {
	if (!e.target.classList.contains("lista-conocimientos")) {
		if (e.target.classList.contains("activo")) {
			skills.delete(e.target.textContent);
			e.target.classList.remove("activo");
		} else {
			skills.add(e.target.textContent);
			e.target.classList.add("activo");
		}
	}
	document.querySelector("#skills").value = [...skills];
	// console.log([...skills]);
};
const skillsSeleccionados = () => {
	const selecionadas = Array.from(
		document.querySelectorAll("ul.lista-conocimientos li.activo")
	);

	selecionadas.forEach((seleccionada) => {
		skills.add(seleccionada.textContent);
	});
	document.querySelector("#skills").value = [...skills];
};

// * limpiar alertas
const limpiarAlertas = (alertas) => {
	const interval = setInterval(() => {
		if (alertas.children.length) {
			alertas.removeChild(alertas.children[0]);
			// % al momento de eliminarlos se van acomodando automaticamente
		} else {
			alertas.remove();
			clearInterval(interval);
			// % deja de ejecutarse el interval
		}
	}, 2000);
};

// * eliminar vacante
const accionesListado = (e) => {
	if (e.target.dataset.eliminar) {
		e.preventDefault();
		const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
		// % construir dinamicamente la ruta para que cuando se monte la tome no importa el servidor

		Swal.fire({
			title: "Eliminar Vacante",
			text: "Esta accion no se puede deshacer, ¿Deseas continuar?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Si, Eliminar",
			cancelButtonText: "No, Cancelar",
		}).then((result) => {
			if (result.isConfirmed) {
				axios
					.delete(url, { params: url })
					.then((res) => {
						if (res.status === 200) {
							Swal.fire("Eliminado", res.data, "success");
							e.target.parentElement.parentElement.remove();
						}
					})
					.catch((err) => {
						Swal.fire({
							title: "Error",
							text: "No se pudo Eliminar",
							type: "error",
						});
					});
			}
		});
	}
};
