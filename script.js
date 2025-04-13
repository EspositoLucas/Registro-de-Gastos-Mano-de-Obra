// Modelo de datos
let registros = [];
let nextId = 1;
let entryCounter = 1;

// Clave para localStorage (más general)
const LOCAL_STORAGE_KEY = 'registros_mo';

// Feriados y días no laborables de Argentina en 2025 (NOTA: Esto sigue siendo específico para 2025. Para otros años, debería actualizarse o hacerse dinámico)
const feriados2025 = [
    "2025-01-01", // Año Nuevo
    "2025-02-03", // Carnaval
    "2025-02-04", // Carnaval
    "2025-03-24", // Día Nacional de la Memoria por la Verdad y la Justicia
    "2025-04-02", // Día del Veterano y de los Caídos en la Guerra de Malvinas
    "2025-04-17", // Jueves Santo
    "2025-04-18", // Viernes Santo
    "2025-05-01", // Día del Trabajador
    "2025-05-25", // Día de la Revolución de Mayo
    "2025-06-20", // Paso a la Inmortalidad del General Manuel Belgrano
    "2025-07-09", // Día de la Independencia
    "2025-08-17", // Paso a la Inmortalidad del General José de San Martín (se traslada al lunes 18) -> Confirmar fecha exacta o si se deja el 17
    "2025-10-12", // Día del Respeto a la Diversidad Cultural (se traslada al lunes 13) -> Confirmar fecha exacta o si se deja el 12
    "2025-11-20", // Día de la Soberanía Nacional (se traslada al lunes 24) -> Confirmar fecha exacta o si se deja el 20
    "2025-12-08", // Inmaculada Concepción de María
    "2025-12-25"  // Navidad
];

// Feriados trasladables y puentes (ejemplo, verificar calendario oficial)
const feriadosTrasladadosOPuentes2025 = [
    "2025-08-18", // Traslado San Martín
    "2025-10-13", // Traslado Diversidad Cultural
    "2025-11-24"  // Traslado Soberanía Nacional
    // Agregar aquí puentes si los hubiera
];

// Función para verificar si una fecha es fin de semana
function esFinDeSemana(fechaString) {
    // Asegurarse de que la fecha se interprete correctamente sin problemas de zona horaria para la comparación del día
    const [year, month, day] = fechaString.split('-').map(Number);
    // Los meses en Date son 0-indexados
    const fecha = new Date(Date.UTC(year, month - 1, day));
    const dia = fecha.getUTCDay(); // 0 es Domingo, 6 es Sábado
    return dia === 0 || dia === 6;
}

// Función para verificar si una fecha es feriado (considerando traslados)
function esFeriado(fechaString) {
    return feriados2025.includes(fechaString) || feriadosTrasladadosOPuentes2025.includes(fechaString);
}

// Función para obtener el tipo de día
function obtenerTipoDia(fechaString) {
    if (esFeriado(fechaString)) {
        return 'feriado';
    }
    if (esFinDeSemana(fechaString)) {
        return 'fin-semana';
    }
    return 'laboral';
}


// Función para convertir formato de hora HH:MM a horas decimales
function horaADecimal(hora) {
    if (!hora) return 0;
    const [horas, minutos] = hora.split(':').map(Number);
    return horas + minutos / 60;
}

// Función para calcular la diferencia entre dos horas en formato HH:MM
function calcularDiferenciaHoras(entrada, salida) {
    const entradaDecimal = horaADecimal(entrada);
    const salidaDecimal = horaADecimal(salida);

    // Si la salida es antes que la entrada, asumimos que es del día siguiente
    let diferencia = salidaDecimal - entradaDecimal;
    if (diferencia < 0) {
        diferencia += 24;
    }

    return diferencia;
}

// Función para formatear números como moneda
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(valor);
}

// Función para actualizar los cálculos de un registro de empleado en el formulario
function actualizarCalculosFormulario(entryId) {
    const valorHoraInput = document.getElementById(`valor-hora-${entryId}`);
    const horaEntradaInput = document.getElementById(`hora-entrada-${entryId}`);
    const horaSalidaInput = document.getElementById(`hora-salida-${entryId}`);
    const totalDiarioInput = document.getElementById(`total-diario-${entryId}`);
    const totalSemanalInput = document.getElementById(`total-semanal-${entryId}`);

    const valorHora = parseFloat(valorHoraInput.value) || 0;
    const horaEntrada = horaEntradaInput.value;
    const horaSalida = horaSalidaInput.value;

    if (horaEntrada && horaSalida && valorHora > 0) {
        const horasTrabajadas = calcularDiferenciaHoras(horaEntrada, horaSalida);
        const totalDiario = horasTrabajadas * valorHora;
        // El total semanal es una estimación simple, podría necesitar lógica más compleja
        const totalSemanal = totalDiario * 5;

        totalDiarioInput.value = totalDiario.toFixed(2);
        totalSemanalInput.value = totalSemanal.toFixed(2); // Este cálculo es una estimación
    } else {
        totalDiarioInput.value = '0.00';
        totalSemanalInput.value = '0.00';
    }
}


// Función para agregar un nuevo campo de empleado al formulario
function agregarCampoEmpleado() {
    entryCounter++;

    const nuevoEmpleado = document.createElement('div');
    nuevoEmpleado.className = 'employee-entry';
    nuevoEmpleado.dataset.entryId = entryCounter;

    nuevoEmpleado.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="empleado-${entryCounter}">Empleado:</label>
                <input type="text" id="empleado-${entryCounter}" placeholder="Nombre del empleado" required>
            </div>
            <div class="form-group">
                <label for="valor-hora-${entryCounter}">Valor Hora ($):</label>
                <input type="number" id="valor-hora-${entryCounter}" min="0" step="0.01" placeholder="0.00" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="hora-entrada-${entryCounter}">Hora Entrada:</label>
                <input type="time" id="hora-entrada-${entryCounter}" required>
            </div>
            <div class="form-group">
                <label for="hora-salida-${entryCounter}">Hora Salida:</label>
                <input type="time" id="hora-salida-${entryCounter}" required>
            </div>
            <div class="form-group">
                <label for="total-diario-${entryCounter}">Total Diario ($):</label>
                <input type="number" id="total-diario-${entryCounter}" readonly placeholder="0.00">
            </div>
            <div class="form-group">
                <label for="total-semanal-${entryCounter}">Total Semanal ($):</label>
                <input type="number" id="total-semanal-${entryCounter}" readonly placeholder="0.00">
            </div>
        </div>
        <button class="remove-entry" type="button">&times;</button>
    `;

    document.querySelector('.employee-entries').appendChild(nuevoEmpleado);

    // Agregar event listeners a los nuevos campos
    const horaEntrada = document.getElementById(`hora-entrada-${entryCounter}`);
    const horaSalida = document.getElementById(`hora-salida-${entryCounter}`);
    const valorHora = document.getElementById(`valor-hora-${entryCounter}`);

    horaEntrada.addEventListener('change', () => actualizarCalculosFormulario(entryCounter));
    horaSalida.addEventListener('change', () => actualizarCalculosFormulario(entryCounter));
    valorHora.addEventListener('input', () => actualizarCalculosFormulario(entryCounter));

    // Configurar el botón para eliminar este campo
    nuevoEmpleado.querySelector('.remove-entry').addEventListener('click', function() {
        // Verificar que haya más de una entrada antes de eliminar
         const entradas = document.querySelectorAll('.employee-entry');
         if (entradas.length > 1) {
             nuevoEmpleado.remove();
             // No es necesario reajustar entryCounter aquí si usamos data-entry-id como identificador único
         } else {
             alert('Debe tener al menos una entrada de empleado.');
         }
    });
}

// Función para guardar los registros del formulario
function guardarRegistro() {
    const fechaInput = document.getElementById('fecha');
    const fecha = fechaInput.value;

    if (!fecha) {
        alert('Por favor, seleccione una fecha.');
        fechaInput.focus();
        return;
    }

    const entradas = document.querySelectorAll('.employee-entry');
    let hayErrores = false;
    let nuevosRegistros = [];

    entradas.forEach(entrada => {
        if (hayErrores) return; // Si ya hubo un error, no procesar más

        const entryId = entrada.dataset.entryId;
        const empleadoInput = document.getElementById(`empleado-${entryId}`);
        const valorHoraInput = document.getElementById(`valor-hora-${entryId}`);
        const horaEntradaInput = document.getElementById(`hora-entrada-${entryId}`);
        const horaSalidaInput = document.getElementById(`hora-salida-${entryId}`);

        const empleado = empleadoInput.value.trim();
        const valorHora = parseFloat(valorHoraInput.value);
        const horaEntrada = horaEntradaInput.value;
        const horaSalida = horaSalidaInput.value;

        if (!empleado || isNaN(valorHora) || valorHora <= 0 || !horaEntrada || !horaSalida) {
            alert(`Por favor, complete correctamente todos los campos para la entrada ${entryId}. El valor hora debe ser mayor a 0.`);
            // Podríamos hacer focus en el primer campo con error
            if (!empleado) empleadoInput.focus();
            else if (isNaN(valorHora) || valorHora <= 0) valorHoraInput.focus();
            else if (!horaEntrada) horaEntradaInput.focus();
            else if (!horaSalida) horaSalidaInput.focus();
            hayErrores = true;
            return;
        }

         if (horaSalida <= horaEntrada) {
             // Permitir turnos nocturnos, pero advertir si la diferencia es muy grande o cero
             const horasTrabajadasCheck = calcularDiferenciaHoras(horaEntrada, horaSalida);
             if (horasTrabajadasCheck === 0) {
                 alert(`La hora de salida debe ser posterior a la hora de entrada para la entrada ${entryId}.`);
                 horaSalidaInput.focus();
                 hayErrores = true;
                 return;
             }
             // Podríamos añadir una confirmación para turnos largos si es necesario
         }


        const horasTrabajadas = calcularDiferenciaHoras(horaEntrada, horaSalida);
        const totalDiario = horasTrabajadas * valorHora;
        // El total semanal se calcula aquí basado solo en este día, podría recalcularse luego si es necesario
        const totalSemanalEstimado = totalDiario * 5;

        nuevosRegistros.push({
            id: nextId++,
            fecha: fecha,
            empleado: empleado,
            valorHora: valorHora,
            horaEntrada: horaEntrada,
            horaSalida: horaSalida,
            horasTrabajadas: horasTrabajadas,
            totalDiario: totalDiario,
            totalSemanal: totalSemanalEstimado, // Guardamos la estimación
            tipoFecha: obtenerTipoDia(fecha)
        });
    });

    if (hayErrores) {
        // Reajustar nextId si se incrementó pero no se añadieron registros
        if (nuevosRegistros.length === 0) {
            const maxIdActual = registros.length > 0 ? Math.max(...registros.map(r => r.id)) : 0;
            nextId = maxIdActual + 1;
        }
        return; // Detener si hubo errores
    }

    if (nuevosRegistros.length === 0) {
         alert('No se encontraron entradas de empleados válidas para guardar.');
         return;
     }

    // Agregar los nuevos registros a la lista principal
    registros.push(...nuevosRegistros);

    // Guardar en localStorage
    guardarDatosLocalStorage();

    // Actualizar la tabla y estadísticas
    renderizarTablaRegistros();
    actualizarEstadisticas();

    // Limpiar el formulario (dejando una entrada)
    limpiarFormulario();

    alert(`Se ${nuevosRegistros.length === 1 ? 'guardó 1 registro' : 'guardaron ' + nuevosRegistros.length + ' registros'} correctamente.`);
}

// Función para guardar datos en localStorage
function guardarDatosLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(registros));
}

// Función para renderizar la tabla de registros
function renderizarTablaRegistros(datos = registros) {
    const tablaBody = document.getElementById('registros-body');
    tablaBody.innerHTML = ''; // Limpiar tabla

    if (datos.length === 0) {
        const fila = tablaBody.insertRow();
        fila.innerHTML = '<td colspan="8" style="text-align: center;">No hay registros para mostrar</td>';
        return;
    }

    // Ordenar datos por fecha (más reciente primero) y luego por empleado
    datos.sort((a, b) => {
        if (a.fecha > b.fecha) return -1;
        if (a.fecha < b.fecha) return 1;
        // Si las fechas son iguales, ordenar por nombre de empleado
        return a.empleado.localeCompare(b.empleado);
    });

    datos.forEach(registro => {
        const fila = tablaBody.insertRow();
        fila.dataset.id = registro.id; // Guardar ID en la fila para referencia

        // Agregar clase para colorear filas según tipo de día
        fila.classList.add(registro.tipoFecha); // 'laboral', 'fin-semana', 'feriado'

        fila.innerHTML = `
            <td>${formatearFecha(registro.fecha)} <span style="font-size: 0.8em; color: #555;">(${registro.tipoFecha})</span></td>
            <td>${registro.empleado}</td>
            <td>${formatearMoneda(registro.valorHora)}</td>
            <td>${registro.horaEntrada}</td>
            <td>${registro.horaSalida}</td>
            <td>${formatearMoneda(registro.totalDiario)}</td>
            <td>${formatearMoneda(registro.totalSemanal)}</td>
            <td class="action-cell">
                <button class="edit-btn" data-id="${registro.id}" title="Editar Registro">Editar</button>
                <button class="delete-btn" data-id="${registro.id}" title="Eliminar Registro">Eliminar</button>
            </td>
        `;

        // Agregar event listeners directamente a los botones de esta fila
        fila.querySelector('.edit-btn').addEventListener('click', () => abrirModalEdicion(registro.id));
        fila.querySelector('.delete-btn').addEventListener('click', () => eliminarRegistro(registro.id));
    });
}


// Función para formatear la fecha en formato legible
function formatearFecha(fechaString) {
    // Usar UTC para evitar problemas de zona horaria al crear la fecha
    const [year, month, day] = fechaString.split('-').map(Number);
    const fecha = new Date(Date.UTC(year, month - 1, day));

    // Opciones de formato
    const opciones = {
        weekday: 'short', // 'lun.', 'mar.', etc.
        year: 'numeric',
        month: 'short', // 'ene.', 'feb.', etc.
        day: 'numeric',
        timeZone: 'UTC' // Asegurar que se formatee según UTC
    };

    let fechaFormateada = new Intl.DateTimeFormat('es-AR', opciones).format(fecha);
    // Capitalizar la primera letra del día y mes
    fechaFormateada = fechaFormateada.replace(/^\w/, c => c.toUpperCase()).replace(/\b\w/g, c => c.toUpperCase());
    return fechaFormateada;
}

// Función para limpiar el formulario, dejando una entrada vacía
function limpiarFormulario() {
    document.getElementById('fecha').valueAsDate = new Date(); // Poner fecha actual por defecto
    const employeeEntriesContainer = document.querySelector('.employee-entries');
    const allEntries = employeeEntriesContainer.querySelectorAll('.employee-entry');

    allEntries.forEach((entrada, index) => {
        if (index === 0) {
            // Limpiar la primera entrada
            const entryId = entrada.dataset.entryId;
            document.getElementById(`empleado-${entryId}`).value = '';
            document.getElementById(`valor-hora-${entryId}`).value = '';
            document.getElementById(`hora-entrada-${entryId}`).value = '';
            document.getElementById(`hora-salida-${entryId}`).value = '';
            document.getElementById(`total-diario-${entryId}`).value = '0.00';
            document.getElementById(`total-semanal-${entryId}`).value = '0.00';
        } else {
            // Eliminar las entradas adicionales
            entrada.remove();
        }
    });
    // Resetear el contador de entradas a 1 (ya que dejamos la primera)
    // Asegurarse que el ID de la primera entrada sea 1 si fue modificado
    const firstEntry = employeeEntriesContainer.querySelector('.employee-entry');
    if (firstEntry && firstEntry.dataset.entryId !== '1') {
        // Si el ID no es 1, forzarlo (puede pasar si se eliminó la primera original)
        // O mejor, simplemente resetear los IDs de los elementos internos
        resetFirstEntryIds();
    }
     entryCounter = 1; // Resetear contador global
}

// Helper para asegurar que los IDs de la primera entrada sean correctos
function resetFirstEntryIds() {
    const firstEntry = document.querySelector('.employee-entry');
    if (!firstEntry) return;
    const oldId = firstEntry.dataset.entryId;
    if (oldId === '1') return; // Ya es 1

    firstEntry.dataset.entryId = '1';
    firstEntry.querySelectorAll('[id]').forEach(el => {
        el.id = el.id.replace(`-${oldId}`, '-1');
    });
     firstEntry.querySelectorAll('[for]').forEach(el => {
        el.setAttribute('for', el.getAttribute('for').replace(`-${oldId}`, '-1'));
    });
     // Re-asignar listeners si es necesario (aunque deberían seguir funcionando si se basan en el entryId actualizado)
      const horaEntrada = document.getElementById(`hora-entrada-1`);
      const horaSalida = document.getElementById(`hora-salida-1`);
      const valorHora = document.getElementById(`valor-hora-1`);

      // Remover listeners antiguos podría ser complejo, pero añadir nuevos debería funcionar
      horaEntrada.addEventListener('change', () => actualizarCalculosFormulario(1));
      horaSalida.addEventListener('change', () => actualizarCalculosFormulario(1));
      valorHora.addEventListener('input', () => actualizarCalculosFormulario(1));
}

// Función para eliminar un registro
function eliminarRegistro(id) {
     // Convertir id a número si viene como string del dataset
     const idNum = parseInt(id, 10);
    const registroIndex = registros.findIndex(registro => registro.id === idNum);

    if (registroIndex === -1) {
         console.error("No se encontró el registro a eliminar con ID:", idNum);
         return;
     }

    const registroAEliminar = registros[registroIndex];

    if (confirm(`¿Está seguro de que desea eliminar el registro de ${registroAEliminar.empleado} del ${formatearFecha(registroAEliminar.fecha)}?`)) {
        registros.splice(registroIndex, 1); // Eliminar del array

        // Guardar en localStorage
        guardarDatosLocalStorage();

        // Actualizar la tabla (renderizar de nuevo con los datos actuales)
        renderizarTablaRegistros();

        // Actualizar las estadísticas
        actualizarEstadisticas();

        alert('Registro eliminado correctamente.');
    }
}


// Función para abrir el modal de edición
function abrirModalEdicion(id) {
     // Convertir id a número
     const idNum = parseInt(id, 10);
    const registro = registros.find(reg => reg.id === idNum);

    if (registro) {
        document.getElementById('edit-id').value = registro.id;
        document.getElementById('edit-fecha').value = registro.fecha;
        document.getElementById('edit-empleado').value = registro.empleado;
        document.getElementById('edit-valor-hora').value = registro.valorHora;
        document.getElementById('edit-hora-entrada').value = registro.horaEntrada;
        document.getElementById('edit-hora-salida').value = registro.horaSalida;

        const modal = document.getElementById('edit-modal');
        modal.style.display = 'flex';
    } else {
         console.error("No se encontró el registro para editar con ID:", idNum);
     }
}

// Función para guardar los cambios de edición
function guardarEdicion(event) {
    event.preventDefault(); // Prevenir el envío normal del formulario

    const id = parseInt(document.getElementById('edit-id').value, 10);
    const fecha = document.getElementById('edit-fecha').value;
    const empleado = document.getElementById('edit-empleado').value.trim();
    const valorHora = parseFloat(document.getElementById('edit-valor-hora').value);
    const horaEntrada = document.getElementById('edit-hora-entrada').value;
    const horaSalida = document.getElementById('edit-hora-salida').value;

    if (!fecha || !empleado || isNaN(valorHora) || valorHora <= 0 || !horaEntrada || !horaSalida) {
        alert('Por favor, complete correctamente todos los campos. El valor hora debe ser mayor a 0.');
        return;
    }

     if (horaSalida <= horaEntrada) {
         const horasTrabajadasCheck = calcularDiferenciaHoras(horaEntrada, horaSalida);
         if (horasTrabajadasCheck === 0) {
             alert('La hora de salida debe ser posterior a la hora de entrada.');
             document.getElementById('edit-hora-salida').focus();
             return;
         }
     }

    const horasTrabajadas = calcularDiferenciaHoras(horaEntrada, horaSalida);
    const totalDiario = horasTrabajadas * valorHora;
    const totalSemanalEstimado = totalDiario * 5;

    // Encontrar y actualizar el registro en el array
    const index = registros.findIndex(reg => reg.id === id);

    if (index !== -1) {
        registros[index] = {
            ...registros[index], // Mantener otras propiedades si las hubiera
            fecha: fecha,
            empleado: empleado,
            valorHora: valorHora,
            horaEntrada: horaEntrada,
            horaSalida: horaSalida,
            horasTrabajadas: horasTrabajadas,
            totalDiario: totalDiario,
            totalSemanal: totalSemanalEstimado,
            tipoFecha: obtenerTipoDia(fecha)
        };

        // Guardar en localStorage
        guardarDatosLocalStorage();

        // Actualizar la tabla
        renderizarTablaRegistros();

        // Actualizar las estadísticas
        actualizarEstadisticas();

        // Cerrar el modal
        cerrarModalEdicion();

        alert('Registro actualizado correctamente.');
    } else {
         console.error("No se encontró el registro para actualizar con ID:", id);
         alert("Error al actualizar el registro.");
     }
}

// Función para cerrar el modal de edición
function cerrarModalEdicion() {
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'none';
    // Opcional: limpiar el formulario del modal al cerrar
    // document.getElementById('edit-form').reset();
}

// Función para aplicar filtros a los registros
function aplicarFiltros() {
    const fechaDesde = document.getElementById('filter-date-from').value;
    const fechaHasta = document.getElementById('filter-date-to').value;
    const empleado = document.getElementById('filter-employee').value.trim().toLowerCase();
    const tipoDia = document.getElementById('filter-type').value;

    const datosFiltrados = registros.filter(registro => {
        let cumpleFechaDesde = true;
        let cumpleFechaHasta = true;
        let cumpleEmpleado = true;
        let cumpleTipoDia = true;

        // Filtrar por fecha desde (si se especificó)
        if (fechaDesde) {
            cumpleFechaDesde = registro.fecha >= fechaDesde;
        }

        // Filtrar por fecha hasta (si se especificó)
        if (fechaHasta) {
            cumpleFechaHasta = registro.fecha <= fechaHasta;
        }

        // Filtrar por empleado (si se especificó)
        if (empleado) {
            cumpleEmpleado = registro.empleado.toLowerCase().includes(empleado);
        }

        // Filtrar por tipo de día (si no es 'todos')
        if (tipoDia !== 'todos') {
            cumpleTipoDia = registro.tipoFecha === tipoDia;
        }

        return cumpleFechaDesde && cumpleFechaHasta && cumpleEmpleado && cumpleTipoDia;
    });

    // Renderizar la tabla con los datos filtrados
    renderizarTablaRegistros(datosFiltrados);
    // Actualizar estadísticas basadas en los datos filtrados
    actualizarEstadisticas(datosFiltrados);
}

// Función para actualizar las estadísticas resumen
function actualizarEstadisticas(datos = registros) {
    const totalRegistros = datos.length;
    const totalPagado = datos.reduce((suma, registro) => suma + registro.totalDiario, 0);
    const totalHoras = datos.reduce((suma, registro) => suma + registro.horasTrabajadas, 0);

    let promedioHora = 0;
    // Calcular promedio solo si hay horas trabajadas y registros para evitar división por cero
    if (totalHoras > 0 && totalRegistros > 0) {
        // Un promedio más representativo sería el costo total dividido por horas totales
        // promedioHora = totalPagado / totalHoras;
        // O el promedio de los valores hora individuales:
        const sumaValorHora = datos.reduce((suma, registro) => suma + registro.valorHora, 0);
        promedioHora = sumaValorHora / totalRegistros;
    }

    document.getElementById('total-registros').textContent = totalRegistros;
    document.getElementById('total-pagado').textContent = formatearMoneda(totalPagado);
    document.getElementById('total-horas').textContent = `${totalHoras.toFixed(1)}h`;
    document.getElementById('promedio-hora').textContent = formatearMoneda(promedioHora); // Mostrar promedio de valor hora
}

// Función para exportar datos a CSV
function exportarDatosCSV() {
    if (registros.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    // Usar los datos actualmente mostrados en la tabla (filtrados o todos)
    const tablaBody = document.getElementById('registros-body');
    const filas = tablaBody.querySelectorAll('tr');
    let datosParaExportar = [];

    if (filas.length > 0 && !filas[0].querySelector('td[colspan="8"]')) { // Asegurarse que no sea la fila "No hay registros"
        filas.forEach(fila => {
            const id = parseInt(fila.dataset.id, 10);
            const registro = registros.find(r => r.id === id);
            if (registro) {
                datosParaExportar.push(registro);
            }
        });
    } else if(registros.length > 0 && filas[0].querySelector('td[colspan="8"]')) {
         // Si la tabla filtrada está vacía pero hay registros globales, exportar todos
         if (confirm("La tabla filtrada está vacía. ¿Desea exportar todos los registros guardados?")) {
             datosParaExportar = registros;
         } else {
             return;
         }
     } else {
          alert('No hay datos en la tabla para exportar.');
          return;
     }

     if (datosParaExportar.length === 0) {
         alert('No se encontraron datos válidos para exportar.');
         return;
     }


    // Crear contenido CSV
    const cabeceras = ['ID', 'Fecha', 'Tipo Dia', 'Empleado', 'Valor Hora', 'Hora Entrada', 'Hora Salida', 'Horas Trabajadas', 'Total Diario', 'Total Semanal (Estimado)'];
    // Usar punto y coma como separador para mejor compatibilidad con Excel en configuraciones regionales latinas
    let contenidoCSV = cabeceras.join(';') + '\n';

    datosParaExportar.forEach(registro => {
        const fila = [
            registro.id,
            registro.fecha,
            registro.tipoFecha,
            `"${registro.empleado.replace(/"/g, '""')}"`, // Encerrar en comillas y escapar comillas internas
            registro.valorHora.toFixed(2).replace('.', ','), // Usar coma decimal
            registro.horaEntrada,
            registro.horaSalida,
            registro.horasTrabajadas.toFixed(2).replace('.', ','),
            registro.totalDiario.toFixed(2).replace('.', ','),
            registro.totalSemanal.toFixed(2).replace('.', ',')
        ];

        contenidoCSV += fila.join(';') + '\n';
    });

    // Crear Blob con BOM para UTF-8 (ayuda a Excel a reconocer caracteres especiales)
    const blob = new Blob(['\uFEFF' + contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    // Nombre de archivo actualizado
    enlace.setAttribute('download', 'registros_mano_obra.csv');
    enlace.style.visibility = 'hidden';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url); // Liberar memoria
}

// Función para imprimir registros (la vista de impresión se controla con CSS @media print)
function imprimirRegistros() {
    window.print();
}

// --- Inicialización y Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos desde localStorage al iniciar
    const datosGuardados = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (datosGuardados) {
        try {
            registros = JSON.parse(datosGuardados);
             // Asegurar que los IDs son números y recalcular nextId
             registros = registros.map(r => ({ ...r, id: parseInt(r.id, 10) }));
             nextId = registros.length > 0 ? Math.max(...registros.map(reg => reg.id)) + 1 : 1;
        } catch (e) {
            console.error("Error al parsear datos de localStorage:", e);
            registros = []; // Resetear si hay error
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Limpiar datos corruptos
        }
    }

    // Renderizar tabla y estadísticas iniciales
    renderizarTablaRegistros();
    actualizarEstadisticas();

    // Configurar event listeners de los botones principales
    document.getElementById('add-employee').addEventListener('click', agregarCampoEmpleado);
    document.getElementById('save-record').addEventListener('click', guardarRegistro);
    document.getElementById('reset-form').addEventListener('click', limpiarFormulario);
    document.getElementById('apply-filters').addEventListener('click', aplicarFiltros);
    document.getElementById('export-data').addEventListener('click', exportarDatosCSV);
    document.getElementById('print-registros').addEventListener('click', imprimirRegistros);

    // Event listeners para los campos de cálculo en la primera entrada inicial
    document.getElementById('hora-entrada-1').addEventListener('change', () => actualizarCalculosFormulario(1));
    document.getElementById('hora-salida-1').addEventListener('change', () => actualizarCalculosFormulario(1));
    document.getElementById('valor-hora-1').addEventListener('input', () => actualizarCalculosFormulario(1));

    // Botón para eliminar la primera entrada (solo si hay más de una)
    document.querySelector('.employee-entry .remove-entry').addEventListener('click', function() {
        const entradas = document.querySelectorAll('.employee-entry');
        if (entradas.length > 1) {
            this.closest('.employee-entry').remove();
        } else {
            alert('Debe tener al menos una entrada de empleado.');
        }
    });

    // --- Modal de edición ---
    const editForm = document.getElementById('edit-form');
    const cancelEditButton = document.getElementById('cancel-edit');
    const closeModalButton = document.querySelector('#edit-modal .close-modal');
    const editModal = document.getElementById('edit-modal');

    editForm.addEventListener('submit', guardarEdicion);
    cancelEditButton.addEventListener('click', cerrarModalEdicion);
    closeModalButton.addEventListener('click', cerrarModalEdicion);

    // Cerrar modal al hacer clic fuera de él (en el fondo oscuro)
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            cerrarModalEdicion();
        }
    });

    // Inicializar fecha del formulario principal con la fecha actual
     const hoy = new Date();
     document.getElementById('fecha').valueAsDate = hoy;

    // Limpiar filtros al cargar la página
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value = '';
    document.getElementById('filter-employee').value = '';
    document.getElementById('filter-type').value = 'todos';

});