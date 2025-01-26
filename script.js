// Variables
let role = '', currentFormat = '', rowCount = 0, columnCount = 0;
// Mostrar el modal de la contraseña
function showPasswordModal() {
  document.getElementById('password-modal').style.display = 'block';  // Mostrar el modal
}

// Verificar la contraseña
function verifyPassword() {
  const password = document.getElementById('password-input').value;

  if (password === '1998') {
    // Si la contraseña es correcta, pasar a la pantalla de selección de formatos
    goToSelectionScreen('editor');
    closePasswordModal();  // Cerrar el modal de contraseña automáticamente
  } else {
    // Si la contraseña es incorrecta, mostrar el mensaje de error y mantener al usuario en la pantalla de bienvenida
    showIncorrectPasswordModal();
    closePasswordModal();  // Cerrar el modal de contraseña
  }
}

// Mostrar el modal de "Contraseña Incorrecta"
function showIncorrectPasswordModal() {
  document.getElementById('incorrect-password-modal').style.display = 'block';  // Mostrar el modal de error
}

// Cerrar el modal de "Contraseña Incorrecta"
function closeIncorrectPasswordModal() {
  document.getElementById('incorrect-password-modal').style.display = 'none';  // Cerrar el modal de error
}

// Cerrar el modal de la contraseña
function closePasswordModal() {
  document.getElementById('password-modal').style.display = 'none';  // Cerrar el modal de contraseña
}


// Formatos y encabezados de tablas
const formatStates = { '00': {}, '01': {}, '16': {}, '17': {}, '18': {}, '19': {}, '24': {}, '25': {} };
const tableHeaders = {
  '00': ['Fecha', 'CBD Lect (lts)', 'CBD Cons (lts)', 'Observaciones'],
  '01': ['Fecha', 'Ciamsa Lect (lts)', 'Ciamsa Cons (lts)', 'Observaciones'],
  '16': ['Fecha', 'CA Lect (lts)', 'CA Cons (lts)', 'CP Lect (lts)', 'CP Cons (lts)', 'SLI Lect (lts)', 'SLI Cons (lts)', 'SXAW Lect (lts)', 'SXAW Cons (lts)'],
  '17': ['Hora', 'Turbiedad (NTU) Pozo Vy-64', 'pH (Unidades de pH) Pozo Vy-64', 'Color (UPC) Pozo Vy-64', 'Fosfatos (mg/PO4) Pozo Vy-64'],
  '18': ['Fecha', 'Hora', 'Lect Horómetro', 'Restante Día Hrmtro', 'Lect Medidor (m³)', 'Restante Día Medidor (m³)', 'Observaciones'],
  '19': ['Hora', 'Fecha', 'Día', 'Cons(m³) Día Tanque', 'Hora', 'Lect Macro Medidor', 'Cons(m³) Día', 'Observaciones'],
  '24': ['Fecha', 'Suscriptores', 'Turbiedad≤2NTU', 'Fosfatos≤0,5(mg/l)', 'Cloro 0,3-2(mg/l)', 'Color 15UPC', 'PH vmp 6,5-9'],
  '25': ['Fecha', 'CA Lect', 'CA Cons(Kwh/dia)', 'MD Lect', 'MD Cons(Kwh/dia)', 'OFCB Lect', 'OFCB Cons(Kwh/dia)', 'SXAW Lect', 'SXAW Cons(Kwh/dia)', 'SLI Lect', 'SLI Cons(Kwh/dia)', 'PC Lect', 'PC Cons(Kwh/dia)', 'PTAP Lect', 'PTAP Cons(Kwh/h)', 'Total', 'Observaciones']
};

// Cargar/Guardar datos en localStorage
function loadData() {
  const storedFormats = JSON.parse(localStorage.getItem('formats'));
  const storedHeaders = JSON.parse(localStorage.getItem('tableHeaders'));
  if (storedFormats) Object.assign(formatStates, storedFormats);
  if (storedHeaders) Object.assign(tableHeaders, storedHeaders);
  loadFormatButtons();
}

// Llamar a loadData() al cargar la página
document.addEventListener('DOMContentLoaded', loadData);

function saveData() {
  localStorage.setItem('formats', JSON.stringify(formatStates));
  localStorage.setItem('tableHeaders', JSON.stringify(tableHeaders));
}

// Navegar entre pantallas
function goToSelectionScreen(selectedRole) {
  role = selectedRole;
  document.getElementById('welcome-screen').style.display = 'none';
  document.getElementById('selection-screen').style.display = 'block';
  role === 'usuario' ? hideEditingOptions() : showEditingOptions();
}

function showEditingOptions() {
  ['add-format-btn', 'delete-format-btn', 'add-column-btn', 'delete-column-btn'].forEach(id => document.getElementById(id).style.display = 'inline-block');
}

function hideEditingOptions() {
  ['add-format-btn', 'delete-format-btn', 'add-column-btn', 'delete-column-btn'].forEach(id => document.getElementById(id).style.display = 'none');
}

function goToFormatScreen() {
  document.getElementById('selection-screen').style.display = 'none';
  document.getElementById('home-screen').style.display = 'block';
}

// Crear botones de formato
function loadFormatButtons() {
  const container = document.getElementById('format-buttons');
  container.innerHTML = '';
  Object.keys(formatStates).forEach(code => {
    const btn = document.createElement('button');
    btn.innerText = `Formato ${code}`;
    btn.onclick = () => selectFormat(code);
    container.appendChild(btn);
  });
}

// Seleccionar formato
function selectFormat(format) {
  currentFormat = format;
  document.getElementById('selected-format').innerText = currentFormat;
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('table-screen').style.display = 'block';
  createTable();
}

// Crear tabla dinámica
function createTable() {
  const table = document.getElementById('dynamic-table');
  table.innerHTML = '';  // Limpiar la tabla antes de recrearla

  const headers = tableHeaders[currentFormat];
  const state = formatStates[currentFormat];

  // Asegurarse de que el estado de la tabla esté correctamente inicializado
  if (!state.data) state.data = [];  // Inicializar si no existe
  state.columnCount = headers.length;

  console.log('Creando tabla con los siguientes encabezados:', headers);
  console.log('Estado actual de los datos:', state.data);

  const headerRow = table.insertRow();
  headers.forEach((header, index) => {
    const th = document.createElement('th');
    th.innerText = header;
    if (role === 'editor') {
      th.setAttribute('contenteditable', 'true');
      th.addEventListener('blur', () => {
        tableHeaders[currentFormat][index] = th.innerText;
        saveData();
      });
    }
    headerRow.appendChild(th);
  });

  // Crear filas basadas en el estado de los datos
  for (let i = 0; i < state.rowCount; i++) {
    const row = table.insertRow();
    for (let j = 0; j < state.columnCount; j++) {
      const cell = row.insertCell();
      cell.innerText = state.data[i]?.[j] || '';
      cell.setAttribute('contenteditable', 'true');
      cell.addEventListener('blur', () => {
        if (!state.data[i]) state.data[i] = [];
        state.data[i][j] = cell.innerText;
        saveData();
      });
    }
  }

  // Asegúrate de que el botón "Agregar Fila" esté correctamente asignado
  const addRowButton = document.getElementById('add-row-btn');
  if (addRowButton) {
    addRowButton.onclick = function() {
      addRow(); // Llamar a la función de agregar fila directamente
    };
  }

  console.log('Tabla recreada correctamente');
}

// Función para agregar una fila
function addRow() {
  const state = formatStates[currentFormat]; // Obtener el estado del formato seleccionado

  // Asegurarse de que `data` está inicializado para el formato actual
  if (!state.data) {
    state.data = [];  // Si no hay datos, inicializamos el array
  }

  state.rowCount++; // Incrementar el contador de filas
  state.data.push(new Array(state.columnCount).fill('')); // Agregar una nueva fila vacía, con la cantidad correcta de columnas
  createTable(); // Volver a crear la tabla con la nueva fila
  saveData(); // Guardar los cambios en localStorage
}

function deleteRow() {
  const state = formatStates[currentFormat];
  if (state.rowCount > 0) {
    state.rowCount--;
    state.data.pop();
    createTable();
    saveData();
  } else {
    alert("No hay filas para eliminar.");
  }
}

function addColumn() {
  const state = formatStates[currentFormat];
  state.columnCount++;
  tableHeaders[currentFormat].push('Nuevo Encabezado');
  state.data.forEach(row => row.push(''));
  createTable();
  saveData();
}

function deleteColumn() {
  const state = formatStates[currentFormat];
  if (state.columnCount > 0) {
    state.columnCount--;
    tableHeaders[currentFormat].pop();
    state.data.forEach(row => row.pop());
    createTable();
    saveData();
  } else {
    alert("No hay columnas para eliminar.");
  }
}

// Funciones de modal
function addFormat() { document.getElementById('add-format-modal').style.display = 'block'; }

function submitAddFormat() {
  const newCode = document.getElementById('new-format-code').value;
  if (newCode && !formatStates[newCode]) {
    formatStates[newCode] = { rowCount: 0, columnCount: 0, data: [] }; // Formato agregado sin encabezados
    tableHeaders[newCode] = []; // Sin encabezados por defecto
    saveData();
    loadFormatButtons();
    document.getElementById('add-format-modal').style.display = 'none';
    document.getElementById('success-add-format-modal').style.display = 'block'; // Mostrar modal de éxito
  } else {
    alert("Código de formato inválido o ya existe.");
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function goBack() {
  document.getElementById('table-screen').style.display = 'none';
  document.getElementById('home-screen').style.display = 'block';
}

// Función para eliminar un formato
function deleteFormatPrompt() {
  document.getElementById('delete-format-modal').style.display = 'block';
}

function submitDeleteFormat() {
  const formatCode = document.getElementById('format-code-to-delete').value;
  if (formatStates[formatCode]) {
    delete formatStates[formatCode];
    delete tableHeaders[formatCode];
    saveData();
    loadFormatButtons();
    closeModal('delete-format-modal');
  } else {
    alert("Formato no encontrado.");
  }
}

// Funciones de exportación
function showExportModal() {
  document.getElementById('export-format-modal').style.display = 'block';
}

function exportAllFormats() {
  const wb = XLSX.utils.book_new();
  Object.keys(formatStates).forEach(formatCode => {
    const ws_data = [tableHeaders[formatCode]].concat(formatStates[formatCode].data || []);
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, `Formato ${formatCode}`);
  });
  XLSX.writeFile(wb, 'formatos.xlsx');
}

function exportSingleFormat() {
  const formatCode = document.getElementById('export-format-code').value;
  if (formatStates[formatCode]) {
    const wb = XLSX.utils.book_new();
    const ws_data = [tableHeaders[formatCode]].concat(formatStates[formatCode].data || []);
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, `Formato ${formatCode}`);
    XLSX.writeFile(wb, `${formatCode}.xlsx`);
  } else {
    alert('Formato no encontrado.');
  }
}

function goBackToWelcome() {
  document.getElementById('selection-screen').style.display = 'none';
  document.getElementById('welcome-screen').style.display = 'block';
}
function goBackToSelection() {
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('selection-screen').style.display = 'block';
}

// Función para abrir el modal de comentarios
function openCommentModal() {
  document.getElementById('comment-modal').style.display = 'block';
}

// Función para cerrar el modal de comentarios
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Función para guardar el comentario
function submitComment() {
  const comment = document.getElementById('comment-text').value;
  if (comment.trim()) {
    alert("Comentario guardado: " + comment);
    // Aquí puedes guardar el comentario en localStorage o realizar otras acciones
    closeModal('comment-modal');
  } else {
    alert("Por favor, escribe un comentario antes de guardar.");
  }
}
// Función para borrar todos los datos de la tabla
function clearTableData() {
  const state = formatStates[currentFormat]; // Obtener el estado actual del formato seleccionado

  // Borrar los datos en el estado
  state.data = [];
  state.rowCount = 0;

  // Volver a crear la tabla vacía
  createTable();

  // Guardar el estado actualizado en localStorage
  saveData();
}

// Cargar datos al inicio
loadData();
