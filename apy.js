// Variables globales para paginación
let currentPage = 1;
let currentSearch = "";

// Función para cargar vehículos con paginación
function cargarVehiculos(page = 1) {
  const container = document.getElementById("vehiculos-container");
  const paginationContainer = document.getElementById("pagination-vehiculos");
  const searchInput = document.getElementById("search-vehiculos");

  currentPage = page;
  currentSearch = searchInput ? searchInput.value : "";

  container.innerHTML =
    '<div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div>';
  paginationContainer.innerHTML = "";

  // Construir URL con parámetros
  let url = `http://localhost:5000/api/vehiculos?page=${page}&per_page=5`;
  if (currentSearch) {
    url += `&search=${encodeURIComponent(currentSearch)}`;
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
      '<li class="page-item disabled"><span class="page-link">Anterior</span></li>';
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
  if (searchInput) {
    searchInput.value = "";
  }
  cargarVehiculos(1);
}

// Cargar vehículos automáticamente al cargar la página
document.addEventListener("DOMContentLoaded", cargarVehiculos());
