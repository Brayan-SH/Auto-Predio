// Variables globales para paginación
let currentPage = 1;
let currentSearch = "";

// Función para cargar vehículos con paginación
function cargarVehiculos(page = 1) {
  const container = document.getElementById("vehiculos-container");
  const paginationContainer = document.getElementById("pagination-vehiculos");
  const searchInput = document.getElementById("search-vehiculos");
  const titulo_vehiculos = document.getElementById("tus-vehiculos");

  // Solo cambiar el título si el elemento existe (vendedor.html)
  if (titulo_vehiculos) {
    titulo_vehiculos.innerText = "🚘 Tus Vehículos";
  }

  currentPage = page; // Actualizar página actual
  currentSearch = searchInput ? searchInput.value : ""; // Actualizar búsqueda actual

  // Mostrar indicador de carga
  container.innerHTML =
    '<div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div>';
  paginationContainer.innerHTML = "";

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
                  <div class="modal">
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
      const modal = new bootstrap.Modal(
        document.getElementById("detalleModal")
      );
      modal.show();

      // Remover modal cuando se cierre
      document
        .getElementById("detalleModal")
        .addEventListener("hidden.bs.modal", function () {
          this.remove();
        });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al cargar detalles del vehículo");
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

  html += `
    <section class="container section-formulario-nuevo-vehiculo">
      <div class="row m-2">
        <div class="col">
          <h5>• Datos de identificacion:</h5>
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

          <h5 class="mt-4">• Caracteristicas Tecnicas:</h5>
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
            placeholder="5 puertas"
          />
          <label for="traccion">Tracción:</label>
          <input
            type="text"
            id="traccion"
            class="form-control"
            placeholder="4x2, 4x4, Sencillo, etc"
          />

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
        </div>
        <div class="col">
          <h5>• Datos de venta:</h5>
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

          <h5 class="mt-4">• Fotos:</h5>
          <!-- 1 parametro : Guardar el vin del vehiculo -->
          <label for="fotos">Ruta:</label>
          <input
            type="text"
            id="fotos"
            class="form-control"
            placeholder="URL de exterior, interior, motor"
          />
          <label for="fotos">Descripcion de la Foto:</label>
          <input
            type="text"
            id="descripcion_foto"
            class="form-control"
            placeholder="Descripción de la foto"
          />
          <!-- 4 parametro : Guardar el vin del vehiculo -->

          <h5 class="mt-4">• Videos:</h5>
          <!-- 1 parametro : Guardar el vin del vehiculo -->
          <label for="videos">Ruta:</label>
          <input
            type="text"
            id="videos"
            class="form-control"
            placeholder="URL de exterior, interior, motor"
          />
          <label for="videos">Descripcion del Video:</label>
          <input
            type="text"
            id="descripcion_video"
            class="form-control"
            placeholder="Descripción del video"
          />
          <!-- 4 parametro : Guardar el vin del vehiculo -->
        </div>
      </div>
      <div class="row-6 text-center mt-5">
        <button type="button" class="btn btn-primary" onclick="guardarNuevoVehiculo()">Guardar</button>
        <button type="button" class="btn btn-danger" onclick="cargarVehiculos(1)">Cancelar</button>
      </div>
    </section>
  `;
  container.innerHTML = html;
}

// Ingresar nuevo vehiculo
function guardarNuevoVehiculo() {
  let url = `http://localhost:5000/api/nuevo_vehiculo`;

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
    contacto: document.getElementById("contacto").value
  };

  fetch(url, { // fetch: Realiza una solicitud HTTP
    method: "POST", /* POST: publicar datos */
    headers: { // Encabezados HTTP
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
        cargarVehiculos(1);
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
    "vin", "numero-chasis", "marca", "modelo", "anio-fabricacion", "placa",
    "tipo-vehiculo", "cc-motor", "tipo-combustible", "transmision", "color",
    "kilometraje", "numero-puertas", "traccion", "condicion", "historial-accidentes",
    "mantenimiento", "garantia", "precio", "financiamiento", "vendedor", "contacto",
    "fotos", "descripcion_foto", "videos", "descripcion_video"
  ];
  
  campos.forEach(campo => {
    const elemento = document.getElementById(campo);
    if (elemento) {
      elemento.value = "";
    }
  });
}

// Cargar vehículos automáticamente al cargar la página
document.addEventListener("DOMContentLoaded", cargarVehiculos());
