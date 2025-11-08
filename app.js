// Variables globales para paginación
let currentPage = 1;
let currentSearch = "";

// Función para limpiar modales problemáticos
function limpiarModalesProblematicos() {
  try {
    // Buscar y eliminar modales con aria-hidden="true" que tengan elementos focalizables
    const modalesProblematicos = document.querySelectorAll(
      '.modal[aria-hidden="true"]'
    );
    modalesProblematicos.forEach((modal) => {
      const elementosFocalizables = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (elementosFocalizables.length > 0) {
        elementosFocalizables.forEach((elemento) => {
          elemento.blur();
          elemento.setAttribute("tabindex", "-1");
          elemento.setAttribute("aria-hidden", "true");
        });
        // Remover el modal problemático después de un breve delay
        setTimeout(() => {
          if (modal.parentNode) {
            modal.remove();
          }
        }, 100);
      }
    });
  } catch (e) {
    console.warn("Error al limpiar modales:", e);
  }
}

// Función para cargar vehículos en cualquier página (crea contenedor si no existe)
function cargarVehiculosEnCualquierPagina(page = 1) {
  // Buscar contenedor existente o crear uno nuevo
  let container = document.getElementById("vehiculos-container");

  if (!container) {
    // Crear contenedor temporal en el body
    container = document.createElement("div");
    container.id = "vehiculos-container";
    container.className = "container mt-4";
    document.body.appendChild(container);

    // También crear contenedor de paginación
    let paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination-vehiculos";
    paginationContainer.className = "container mt-3";
    document.body.appendChild(paginationContainer);
  }

  // Ahora usar la función normal
  cargarVehiculos(page);
}

// Función para crear controles de paginación
function createPagination(pagination) {
  const container = document.getElementById("pagination-vehiculos");
  let html =
    '<nav><ul class="pagination pagination-sm justify-content-center">';

  // Botón anterior
  if (pagination.has_prev) {
    html += `<li class="page-item"><a class="page-link" href="#" onclick="cargarVehiculos(${
      pagination.page - 1
    })">Anterior</a></li>`;
  } else {
    html +=
      '<li class="page-item disabled"><span class="page-link text-center">Anterior</span></li>';
  }

  // Números de página (máximo 5 páginas visibles)
  let startPage = Math.max(1, pagination.page - 2);
  let endPage = Math.min(pagination.total_pages, pagination.page + 2);

  for (let i = startPage; i <= endPage; i++) {
    if (i === pagination.page) {
      html += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
    } else {
      html += `<li class="page-item"><a class="page-link" href="#" onclick="cargarVehiculos(${i})">${i}</a></li>`;
    }
  }

  // Botón siguiente
  if (pagination.has_next) {
    html += `<li class="page-item"><a class="page-link" href="#" onclick="cargarVehiculos(${
      pagination.page + 1
    })">Siguiente</a></li>`;
  } else {
    html +=
      '<li class="page-item disabled"><span class="page-link">Siguiente</span></li>';
  }

  html += "</ul></nav>";
  html += `<small class="text-muted d-block text-center mt-2">Mostrando hasta ${pagination.per_page} de ${pagination.total} vehículos (Página ${pagination.page} de ${pagination.total_pages})</small>`;

  container.innerHTML = html;
}

// Función para ver detalle de un vehículo
function verDetalle(vin) {
  fetch(`http://localhost:5000/api/vehiculos/${vin}`)
    .then((response) => response.json())
    .then((vehiculo) => {
      if (vehiculo.error) {
        alert("Vehículo no encontrado");
        return;
      }

      // Crear modal con detalles
      const modalHtml = `
              <div class="modal fade" id="detalleModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio_fabricacion}</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                      <div class="row">
                        <div class="col-md-6">
                          <p><strong>VIN:</strong> ${vehiculo.vin}</p>
                          <p><strong>Marca:</strong> ${vehiculo.marca}</p>
                          <p><strong>Modelo:</strong> ${vehiculo.modelo}</p>
                          <p><strong>Año:</strong> ${vehiculo.anio_fabricacion}</p>
                          <p><strong>Color:</strong> ${vehiculo.color}</p>
                          <p><strong>Precio:</strong> ${vehiculo.precio}</p>
                        </div>
                        <div class="col-md-6">
                          <p><strong>Kilometraje:</strong> ${vehiculo.kilometraje} km</p>
                          <p><strong>Transmisión:</strong> ${vehiculo.transmision}</p>
                          <p><strong>Combustible:</strong> ${vehiculo.tipo_combustible}</p>
                          <p><strong>Condición:</strong> ${vehiculo.condicion}</p>
                          <p><strong>Contacto:</strong> ${vehiculo.contacto}</p>
                          <p><strong>Vendedor:</strong> ${vehiculo.predio_vendedor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `;

      // Agregar modal al DOM y mostrarlo
      document.body.insertAdjacentHTML("beforeend", modalHtml);
      const modalEl = document.getElementById("detalleModal");
      const modal = new bootstrap.Modal(modalEl);

      // Solución completa para problemas de accesibilidad
      modalEl.addEventListener("show.bs.modal", function () {
        // Limpiar cualquier modal anterior que pueda estar causando problemas
        const existingModals = document.querySelectorAll(
          '.modal[aria-hidden="true"]'
        );
        existingModals.forEach((oldModal) => {
          if (oldModal !== modalEl) {
            oldModal.remove();
          }
        });
      });

      modal.show();

      // Mejorar el manejo de accesibilidad para evitar advertencias
      modalEl.addEventListener("hide.bs.modal", function () {
        try {
          // Buscar todos los elementos focalizables dentro del modal
          const focusableElements = modalEl.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          // Forzar la pérdida de foco de TODOS los elementos dentro del modal
          focusableElements.forEach((element) => {
            if (element === document.activeElement) {
              element.blur();
            }
            element.setAttribute("tabindex", "-1");
            element.setAttribute("aria-hidden", "true");
          });

          // Mover foco al body de forma más agresiva
          if (modalEl.contains(document.activeElement)) {
            document.activeElement.blur();
            document.body.focus();
          }

          // Forzar aria-hidden en el modal completo
          modalEl.setAttribute("aria-hidden", "true");
        } catch (e) {
          console.warn("Error al manejar foco en modal:", e);
        }
      });

      // Remover modal del DOM cuando se cierre completamente
      modalEl.addEventListener("hidden.bs.modal", function () {
        this.remove();
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al cargar detalles del vehículo");
    });
}

// Función principal para cargar vehículos con paginación y búsqueda
function cargarVehiculos(page = 1) {
  const container = document.getElementById("vehiculos-container");
  const paginationContainer = document.getElementById("pagination-vehiculos");
  const searchInput = document.getElementById("search-vehiculos");
  const titulo_vehiculos = document.getElementById("tus-vehiculos");

  // Si no existe el contenedor, no hacer nada (no estamos en la página correcta)
  if (!container) {
    return;
  }

  // Solo cambiar el título si el elemento existe (vendedor.html)
  if (titulo_vehiculos) {
    titulo_vehiculos.innerText = "🚘 Tus Vehículos";
  }

  currentPage = page; // Actualizar página actual
  currentSearch = searchInput ? searchInput.value : ""; // Actualizar búsqueda actual

  // Mostrar indicador de carga
  container.innerHTML =
    '<div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div>';

  // Solo limpiar paginación si existe el contenedor
  if (paginationContainer) {
    paginationContainer.innerHTML = "";
  }

  // Construir URL con parámetros
  let url = `http://localhost:5000/api/vehiculos?page=${page}&per_page=6`;
  if (currentSearch) {
    url += `&search=${encodeURIComponent(currentSearch)}`; // Concatenar parámetro de búsqueda si existe
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      let html = "";
      if (data.vehiculos.length === 0) {
        html =
          '<div class="alert alert-info">No hay vehículos encontrados</div>';
      } else {
        data.vehiculos.forEach((vehiculo) => {
          html += `
                  <div class="card mb-2">
                    <div class="card-body">
                      <h6 class="card-title">${vehiculo.marca} ${vehiculo.modelo}</h6>
                      <p class="card-text">
                        <small class="text-muted">Año: ${vehiculo.anio_fabricacion}</small><br>
                        <small class="text-muted">Color: ${vehiculo.color}</small><br>
                        <small class="text-muted">Precio: ${vehiculo.precio}</small><br>
                        <small class="text-muted">Km: ${vehiculo.kilometraje}</small><br>
                        <span class="badge bg-info">${vehiculo.condicion}</span>
                        <button class="btn btn-sm btn-outline-primary ms-2" onclick="verDetalle('${vehiculo.vin}')">Ver Detalle</button>
                      </p>
                    </div>
                  </div>
                `;
        });
      }
      container.innerHTML = html;

      // Crear controles de paginación
      if (data.pagination.total_pages > 1) {
        createPagination(data.pagination);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      container.innerHTML =
        '<div class="alert alert-danger">Error al cargar vehículos</div>';
    });
}

// Función para cargar todos los vehículos (sin filtro)
function cargarTodosVehiculos() {
  const searchInput = document.getElementById("search-vehiculos");
  const titulo_vehiculos = document.getElementById("tus-vehiculos");

  // Solo cambiar el título si el elemento existe (vendedor.html)
  if (titulo_vehiculos) {
    titulo_vehiculos.innerText = "🚘 Tus Vehículos";
  }

  if (searchInput) {
    searchInput.value = "";
  }
  cargarVehiculos(1);
}

// Formulario Registrar Vehículo
function iniciarFormularioRegistroVehiculo() {
  const container = document.getElementById("vehiculos-container");
  const paginationContainer = document.getElementById("pagination-vehiculos");
  const titulo_vehiculos = document.getElementById("tus-vehiculos");

  // Solo cambiar el título si el elemento existe (vendedor.html)
  if (titulo_vehiculos) {
    titulo_vehiculos.innerText = "🚘 Agregar Nuevo Vehículo";
  }

  paginationContainer.innerHTML = "";
  container.innerHTML = "";

  let html = "";
  html += `<section class='container section-formulario-nuevo-vehiculo' style='background-color: #a09d9dff; color: white; border-radius: 1rem; padding: 20px;'>
      <div class="row m-2">
        <div class="col">
          <h5>• Datos de identificacion</h5>
          <label for="vin">Vin:</label>
          <input
            type="text"
            id="vin"
            class="form-control"
            placeholder="ejemplo: JTEPH3FJ5KJ123456"
          />
          <label for="numero-chasis">Numero de Chasis:</label>
          <input
            type="text"
            id="numero-chasis"
            class="form-control"
            placeholder="ejemplo: JTEPH3FJ5KJ123456"
          />
          <label for="marca">Marca:</label>
          <input
            type="text"
            id="marca"
            class="form-control"
            placeholder="Toyota"
          />
          <label for="modelo">Modelo:</label>
          <input
            type="text"
            id="modelo"
            class="form-control"
            placeholder="Rav4"
          />
          <label for="anio-fabricacion">Año de Fabricación:</label>
          <input
            type="text"
            id="anio-fabricacion"
            class="form-control"
            placeholder="ejemplo: 2020"
          />
          <label for="placa">Placa (6 Caracteres):</label>
          <input
            type="text"
            id="placa"
            class="form-control"
            placeholder="ABC1234"
          />

          <h5 class="mt-4">• Caracteristicas Tecnicas</h5>
          <label for="tipo-vehiculo">Tipo de vehículo:</label>
          <input
            type="text"
            id="tipo-vehiculo"
            class="form-control"
            placeholder="sedán, SUV, pickup, moto, etc."
          />
          <label for="cc-motor">CC del Motor:</label>
          <input
            type="text"
            id="cc-motor"
            class="form-control"
            placeholder="2500cc"
          />
          <label for="tipo-combustible">Tipo de Combustible:</label>
          <input
            type="text"
            id="tipo-combustible"
            class="form-control"
            placeholder="Gasolina, Diésel, Eléctrico, etc."
          />
          <label for="transmision">Transmisión:</label>
          <input
            type="text"
            id="transmision"
            class="form-control"
            placeholder="manual, automática, CVT, etc. "
          />
          <label for="color">Color:</label>
          <input
            type="text"
            id="color"
            class="form-control"
            placeholder="Rojo, Azul, Negro, etc."
          />
          <label for="kilometraje">Kilometraje:</label>
          <input
            type="text"
            id="kilometraje"
            class="form-control"
            placeholder="xxx,xxxkms"
          />
          <label for="numero-puertas">Cantidad de puertas:</label>
          <input
            type="text"
            id="numero-puertas"
            class="form-control"
            placeholder="5"
          />
          <label for="traccion">Tracción:</label>
          <input
            type="text"
            id="traccion"
            class="form-control"
            placeholder="4x2, 4x4, Sencillo, etc"
          />

          
        </div>
        <div class="col">
        <h5 class="mt-4">• Estado y condiciones</h5>
          <label for="condicion">condicion:</label>
          <input
            type="text"
            id="condicion"
            class="form-control"
            placeholder="Nuevo/Usado/Semi-Nuevo"
          />
          <label for="historial-accidentes">Historial de accidentes:</label>
          <input
            type="text"
            id="historial-accidentes"
            class="form-control"
            placeholder="si está disponible (golpe lado del bomper)"
          />
          <label for="mantenimiento">Mantenimiento del vehiculo:</label>
          <input
            type="text"
            id="mantenimiento"
            class="form-control"
            placeholder="Al dia, Reciente, etc"
          />
          <label for="garantia">Garantia:</label>
          <input
            type="text"
            id="garantia"
            class="form-control"
            placeholder="Disponible/No Disponible"
          />

          <h5 class="mt-4">• Datos de venta</h5>
          <label for="precio">Precio de venta:</label>
          <input
            type="text"
            id="precio"
            class="form-control"
            placeholder="Ejemplo: 2500"
          />
          <label for="financiamiento">Disponibilidad de financiamiento:</label>
          <input
            type="text"
            id="financiamiento"
            class="form-control"
            placeholder="Disponible/No Disponible"
          />
          <label for="predio-vendedor">Predio/vendedor:</label>
          <input
            type="text"
            id="predio-vendedor"
            class="form-control"
            placeholder="Nombre del Vendedor o el Predio"
          />
          <label for="contacto">Contacto:</label>
          <input
            type="text"
            id="contacto"
            class="form-control"
            placeholder="Teléfono, WhatsApp..."
          />
          
          
          <!-- 4 parametro : Guardar el vin del vehiculo -->
        </div>
      </div>
      <div class="row-6 text-center mt-5">
        <button type="button" class="btn btn-primary" onclick="guardarNuevoVehiculo()">Guardar</button>
        <button type="button" class="btn btn-danger" onclick="cargarVehiculos(1)">Cancelar</button>
      </div>
    </section>`;
  container.innerHTML = html;
}

// Ingresar nuevo vehiculo
function guardarNuevoVehiculo() {
  let url = `http://localhost:5000/api/nuevo-vehiculo`;

  const nuevoVehiculo = {
    vin: document.getElementById("vin").value,
    marca: document.getElementById("marca").value,
    modelo: document.getElementById("modelo").value,
    anio_fabricacion: document.getElementById("anio-fabricacion").value,
    color: document.getElementById("color").value,
    kilometraje: document.getElementById("kilometraje").value,
    precio: document.getElementById("precio").value,
    condicion: document.getElementById("condicion").value,
    numero_chasis: document.getElementById("numero-chasis").value,
    placa: document.getElementById("placa").value,
    tipo_vehiculo: document.getElementById("tipo-vehiculo").value,
    cc_motor: document.getElementById("cc-motor").value,
    tipo_combustible: document.getElementById("tipo-combustible").value,
    transmision: document.getElementById("transmision").value,
    numero_puertas: document.getElementById("numero-puertas").value,
    traccion: document.getElementById("traccion").value,
    historial_accidentes: document.getElementById("historial-accidentes").value,
    mantenimiento: document.getElementById("mantenimiento").value,
    garantia: document.getElementById("garantia").value,
    financiamiento: document.getElementById("financiamiento").value,
    predio_vendedor: document.getElementById("predio-vendedor").value,
    contacto: document.getElementById("contacto").value,
  };

  fetch(url, {
    // fetch: Realiza una solicitud HTTP
    method: "POST" /* POST: publicar datos */,
    headers: {
      // Encabezados HTTP
      "Content-Type": "application/json", // Indica que se envían datos JSON
    },
    body: JSON.stringify(nuevoVehiculo), // Enviar datos del nuevo vehículo como JSON al servidor
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert("Vehículo guardado exitosamente");
        // Limpiar formulario
        limpiarFormularioVehiculo();
        // Volver a la lista de vehículos
        cargarTodosVehiculos();
      } else if (data.error) {
        alert("Error: " + data.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al guardar vehículo");
    });
}

// Función para limpiar el formulario de nuevo vehículo
function limpiarFormularioVehiculo() {
  const campos = [
    "vin",
    "numero-chasis",
    "marca",
    "modelo",
    "anio-fabricacion",
    "placa",
    "tipo-vehiculo",
    "cc-motor",
    "tipo-combustible",
    "transmision",
    "color",
    "kilometraje",
    "numero-puertas",
    "traccion",
    "condicion",
    "historial-accidentes",
    "mantenimiento",
    "garantia",
    "precio",
    "financiamiento",
    "vendedor",
    "contacto",
    "fotos",
    "descripcion_foto",
    "videos",
    "descripcion_video",
  ];

  campos.forEach((campo) => {
    const elemento = document.getElementById(campo);
    if (elemento) {
      elemento.value = "";
    }
  });
}

function ActivarInputsModificarVehiculo() {
  const campos = [
    "color",
    "kilometraje",
    "precio",
    "condicion",
    "placa",
    "transmision",
    "historial-accidentes",
    "mantenimiento",
    "garantia",
    "disponibilidad-financiamiento",
    "predio-vendedor",
    "contacto",
  ];

  campos.forEach((campo) => {
    const elemento = document.getElementById(campo);
    if (elemento) {
      elemento.disabled = false;
    }
  });
  document.getElementById("vin").disabled = true;
}

function ActualizarVehiculo() {
  const vin = document.getElementById("vin").value;
  if (!vin) {
    alert("Por favor ingrese el VIN del vehículo a actualizar.");
    return;
  }
  
  const vehiculoActualizado = {
    color: document.getElementById("color").value,
    kilometraje: document.getElementById("kilometraje").value,
    precio: document.getElementById("precio").value,
    condicion: document.getElementById("condicion").value,
    placa: document.getElementById("placa").value,
    transmision: document.getElementById("transmision").value,
    historial_accidentes: document.getElementById("historial-accidentes").value,
    mantenimiento: document.getElementById("mantenimiento").value,
    garantia: document.getElementById("garantia").value,
    disponibilidad_financiamiento: document.getElementById("disponibilidad-financiamiento").value,
    predio_vendedor: document.getElementById("predio-vendedor").value,
    contacto: document.getElementById("contacto").value
  };

  url = `http://localhost:5000/api/actualizar-vehiculo/${vin}`;

  fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(vehiculoActualizado)
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert("Vehículo actualizado exitosamente");
        // Volver a la lista de vehículos
        cargarVehiculos(1);
      } else if (data.error) {
        alert("Error: " + data.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al actualizar vehículo");
    });
}

function EliminarVehiculo() {
  const vin = document.getElementById("vin").value;
  if (!vin) {
    alert("Por favor ingrese el VIN del vehículo a eliminar.");
    return;
  }

  // Eliminar vehículo mediante una solicitud DELETE
  fetch(`http://localhost:5000/api/eliminar-vehiculo/${vin}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert("Vehículo eliminado exitosamente");
        // Volver a la lista de vehículos
        cargarVehiculos(1);
      } else if (data.error) {
        alert("Error: " + data.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al eliminar vehículo");
    });
}

function iniciarFormularioActualizarVehiculo() {
  const container = document.getElementById("vehiculos-container");
  container.innerHTML = "";
  const paginationContainer = document.getElementById("pagination-vehiculos");
  const titulo_vehiculos = document.getElementById("tus-vehiculos");
  paginationContainer.innerHTML = "";

  if (titulo_vehiculos) {
    titulo_vehiculos.innerText = "🚘 Actualizar Vehículo";
  }

  let html = "";
  html += `<section class="container section-formulario-actualizar-vehiculo" style="background: #b1cbd3; border-radius: 1rem; padding: 20px;">
      <form class="" id="formActualizarVehiculo">
          <!-- Cada fila con label e input -->
          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="vin" class="form-label mb-0">VIN:</label>
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="vin"
                placeholder="Ingrese VIN"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="marca" class="form-label mb-0">Marca:</label>
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="marca"
                disabled
                placeholder="Ejemplo: Toyota, Honda, Ford, Chevrolet"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="modelo" class="form-label mb-0">Modelo:</label>
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="modelo"
                disabled
                placeholder="Ejemplo: Rav4, Civic, Explorer, Cruze"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="anio-fabricacion" class="form-label mb-0"
                >Año Fabricación:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="anio-fabricacion"
                disabled
                placeholder="Ejemplo: 2020, 2021, 2022, 2023"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="color" class="form-label mb-0">Color:</label>
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="color"
                disabled
                placeholder="Ejemplo: Azul, Negro, Blanco, Rojo, Plata"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="kilometraje" class="form-label mb-0"
                >Kilometraje:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="kilometraje"
                disabled
                placeholder="Ejemplo: 50,000 km, 120,000 km, 0 km"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="precio" class="form-label mb-0">Precio:</label>
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="precio"
                disabled
                placeholder="Ejemplo: Q25,000,000, Q45,000,000, Q80,000,000"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="condicion" class="form-label mb-0">Condición:</label>
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="condicion"
                disabled
                placeholder="Ejemplo: Nuevo, Usado, Semi-Nuevo, Excelente"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="numero-chasis" class="form-label mb-0"
                >Número de Chasis:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="numero-chasis"
                disabled
                placeholder="Ejemplo: JTEPH3FJ5KJ123456, 1HGBH41JXMN109186"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="placa" class="form-label mb-0">Placa:</label>
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="placa"
                disabled
                placeholder="Ejemplo: ABC123, XYZ789, DEF456"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="tipo-vehiculo" class="form-label mb-0"
                >Tipo de Vehículo:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="tipo-vehiculo"
                disabled
                placeholder="Ejemplo: Sedán, SUV, Pickup, Hatchback, Moto"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="cc-motor" class="form-label mb-0"
                >CC del Motor:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="cc-motor"
                disabled
                placeholder="Ejemplo: 1600cc, 2000cc, 2500cc, 3000cc"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="tipo-combustible" class="form-label mb-0"
                >Tipo de Combustible:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="tipo-combustible"
                disabled
                placeholder="Ejemplo: Gasolina, Diésel, Híbrido, Eléctrico"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="transmision" class="form-label mb-0"
                >Transmisión:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="transmision"
                disabled
                placeholder="Ejemplo: Manual, Automática, CVT, Secuencial"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="numero-puertas" class="form-label mb-0"
                >Número de Puertas:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="numero-puertas"
                disabled
                placeholder="Ejemplo: 2, 4, 5"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="traccion" class="form-label mb-0">Tracción:</label>
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="traccion"
                disabled
                placeholder="Ejemplo: 4x2, 4x4, AWD, Tracción Delantera"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="historial-accidentes" class="form-label mb-0"
                >Historial de Accidentes:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="historial-accidentes"
                disabled
                placeholder="Ejemplo: Sin accidentes, Golpe lateral menor, Reparado"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="mantenimiento" class="form-label mb-0"
                >Mantenimiento:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="mantenimiento"
                disabled
                placeholder="Ejemplo: Al día, Reciente, Próximo en 5,000 km"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="garantia" class="form-label mb-0">Garantía:</label>
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="garantia"
                disabled
                placeholder="Ejemplo: 2 años, Garantía extendida, Sin garantía"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="disponibilidad-financiamiento" class="form-label mb-0"
                >Disponibilidad de Financiamiento:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="disponibilidad-financiamiento"
                disabled
                placeholder="Ejemplo: Disponible, No disponible, Con banco aliado"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="predio-vendedor" class="form-label mb-0"
                >Predio o Vendedor:</label
              >
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="predio-vendedor"
                disabled
                placeholder="Ejemplo: AutoMax, Vehículos Premium, Juan Pérez"
              />
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-4 text-end">
              <label for="contacto" class="form-label mb-0">Contacto:</label>
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control"
                id="contacto"
                disabled
                placeholder="Ejemplo: 300-123-4567, juan@email.com, WhatsApp"
              />
            </div>
          </div>

        <!-- BOTONES CENTRADOS -->
        <div class="col-12 d-flex justify-content-center mt-4">
          <button
            type="button"
            class="btn btn-primary mx-2"
            onclick="ActualizarVehiculo()"
            style="width: 200px">Actualizar Vehículo
          </button>
          <button
            type="button"
            class="btn btn-warning mx-2"
            onclick="EliminarVehiculo()"
            style="width: 200px">Eliminar Vehículo
          </button>
          <button
            type="button"
            class="btn btn-danger mx-2"
            onclick="location.reload()"
            style="width: 200px">Cancelar
          </button>
        </div>
      </form>
    </section>`;
  container.innerHTML = html;

  // AGREGAR EL EVENT LISTENER DESPUÉS DE CREAR EL FORMULARIO
  const vinInput = document.getElementById("vin");

  if (vinInput) {
    vinInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevenir el comportamiento por defecto del Enter

        if (!vinInput.value) {
          alert("Por favor ingrese el VIN del vehículo a actualizar.");
          return;
        }

        vehiculo = {
          vin: document.getElementById("vin").value,
          marca: document.getElementById("marca").value,
          modelo: document.getElementById("modelo").value,
          anio_fabricacion: document.getElementById("anio-fabricacion").value,
          color: document.getElementById("color").value,
          kilometraje: document.getElementById("kilometraje").value,
          precio: document.getElementById("precio").value,
          condicion: document.getElementById("condicion").value,
          numero_chasis: document.getElementById("numero-chasis").value,
          placa: document.getElementById("placa").value,
          tipo_vehiculo: document.getElementById("tipo-vehiculo").value,
          cc_motor: document.getElementById("cc-motor").value,
          tipo_combustible: document.getElementById("tipo-combustible").value,
          transmision: document.getElementById("transmision").value,
          numero_puertas: document.getElementById("numero-puertas").value,
          traccion: document.getElementById("traccion").value,
          historial_accidentes: document.getElementById("historial-accidentes")
            .value,
          mantenimiento: document.getElementById("mantenimiento").value,
          garantia: document.getElementById("garantia").value,
          financiamiento: document.getElementById(
            "disponibilidad-financiamiento"
          ).value,
          predio_vendedor: document.getElementById("predio-vendedor").value,
          contacto: document.getElementById("contacto").value,
        };
        
        // Primero enviar el vin y muestre los datos del vehículo
        let url = `http://localhost:5000/api/mostrar-vehiculo/${vehiculo.vin}`;
        fetch(url)
          .then((response) => response.json())
          .then((vehiculo) => {
            if (vehiculo.error) {
              alert("Error: " + vehiculo.error);
              return;
            }
            // Habilitar los inputs para modificar
            ActivarInputsModificarVehiculo();

            document.getElementById("marca").value = vehiculo.marca;
            document.getElementById("modelo").value = vehiculo.modelo;
            document.getElementById("anio-fabricacion").value =
              vehiculo.anio_fabricacion;
            document.getElementById("color").value = vehiculo.color;
            document.getElementById("kilometraje").value = vehiculo.kilometraje;
            document.getElementById("precio").value = vehiculo.precio;
            document.getElementById("condicion").value = vehiculo.condicion;
            document.getElementById("numero-chasis").value =
              vehiculo.numero_chasis;
            document.getElementById("placa").value = vehiculo.placa;
            document.getElementById("tipo-vehiculo").value =
              vehiculo.tipo_vehiculo;
            document.getElementById("cc-motor").value = vehiculo.cc_motor;
            document.getElementById("tipo-combustible").value =
              vehiculo.tipo_combustible;
            document.getElementById("transmision").value = vehiculo.transmision;
            document.getElementById("numero-puertas").value =
              vehiculo.numero_puertas;
            document.getElementById("traccion").value = vehiculo.traccion;
            document.getElementById("historial-accidentes").value =
              vehiculo.historial_accidentes;
            document.getElementById("mantenimiento").value =
              vehiculo.mantenimiento;
            document.getElementById("garantia").value = vehiculo.garantia;
            document.getElementById("disponibilidad-financiamiento").value =
              vehiculo.financiamiento;
            document.getElementById("predio-vendedor").value =
              vehiculo.predio_vendedor;
            document.getElementById("contacto").value = vehiculo.contacto;
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        // Hacer foco en el siguiente campo
        document.getElementById("color").focus();
      }
    });
  } else {
    alert("ERROR: No se pudo encontrar el campo VIN");
  }
}

function Login() {
  // Primero obtener los valores ANTES de modificar el DOM
  email = document.getElementById("email").value;
  password = document.getElementById("password").value;
  // verificar el email y el password no esten vacios
  if (!email || !password) {
    alert("Por favor, complete todos los campos");
    return;
  }

  let url = `http://localhost:5000/api/login`;

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        // Solo DESPUÉS del login exitoso, mostrar las opciones
        const container = document.body;
        let html = "";
        html += `<section style="background-color: #424242; color: white; border-radius: 0.5rem;" class="container p-5 text-center">
              <h3>¿Bienvenido qué deseas hacer?</h3>

              <hr class="my-4" />
                  
              <button class="btn btn-info mb-3" onclick="window.open('cliente.html', '_blank')">
                <i class="bi bi-search"></i> Ver/Comprar Vehículos Disponibles
              </button><br>

              <button class="btn btn-primary mb-3" onclick="window.open('vendedor.html', '_blank')">
                <i class="bi bi-car-front"></i> Vender Mi Vehículo
              </button><br>
              
              <button class="btn btn-danger mb-3" onclick="location.reload()">
                <i class="bi bi-x-circle"></i> Cancelar
                </button>
            </section>`;
        container.innerHTML = html;
      } else if (data.error) {
        alert("Error: " + data.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al iniciar sesión");
    });
}

function FormularioCuenta_Nueva() {
  let html = "";
  html += `
    <section class="container p-5 text-center rounded-3" style="background-color: #424242; color: white">
      <h2>Crear Nueva Cuenta</h2>
      <form id="registerForm" class="mt-4">
        <div class="mb-3">
            <label for="email" class="form-label">Usuario </label>
            <input type="text" class="form-control-lg" id="email" placeholder='Usuario' required />
        </div>
        <div class="mb-3">
            <label for="password" class="form-label">Contraseña </label>
            <input type="password" class="form-control-lg" id="password" placeholder='Contraseña' required />
        </div>
        <button type="button" class="btn btn-primary" onclick="CrearCuenta()">Crear Cuenta</button>
        <button type="button" class="btn btn-danger" onclick="location.reload()">
            <i class="bi bi-x-circle"></i> Cancelar
            </button>
      </form>
    </section>
  `;
  document.body.innerHTML = html;
}

function CrearCuenta() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  console.log("CrearCuenta() iniciada");
  console.log("Email:", email);
  console.log("Password:", password);

  // verificar el email y el password no esten vacios
  if (!email || !password) {
    alert("Por favor, complete todos los campos");
    return;
  }

  let url = `http://localhost:5000/api/crear_cuenta`;
  console.log("URL:", url);

  const requestData = { email, password };
  console.log("Datos a enviar:", requestData);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => {
      console.log("Response recibida:", response);
      console.log("Status:", response.status);
      console.log("OK:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      console.log("Data recibida:", data);
      if (data.message) {
        // limpiar los campos del formulario
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        alert("Cuenta creada exitosamente");
        // Redirigir o realizar alguna acción adicional
      } else if (data.error) {
        alert("Error: " + data.error);
      }
    })
    .catch((error) => {
      console.error("Error completo:", error);
      console.error("Tipo de error:", typeof error);
      console.error("Mensaje de error:", error.message);
      alert("Error al crear cuenta el usuario ya existe: " + error.message);
    });
}

// Cargar vehículos automáticamente al cargar la página SOLO si estamos en la página correcta
document.addEventListener("DOMContentLoaded", function () {
  // Limpiar modales problemáticos al cargar la página
  limpiarModalesProblematicos();

  // Solo ejecutar cargarVehiculos si existe el contenedor necesario
  if (document.getElementById("vehiculos-container")) {
    cargarVehiculos();
  }

  // Ejecutar limpieza periódica cada 30 segundos
  setInterval(limpiarModalesProblematicos, 30000);
});


