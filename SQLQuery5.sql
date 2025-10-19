INSERT INTO vehiculo (
    vin, marca, modelo, anio_fabricacion, numero_chasis, placa, 
    type_vehiculo, motor_cc, motor_type_combustible, transmision, 
    color, kilometraje, numero_puertas, traccion, condicion, 
    historial_accidentes, mantenimiento, garantia, precio, 
    disponibilidad_financiamiento, predio_o_vendedor, contacto, 
    fotos, videos
) VALUES (
    '1HGCM82633A123456',  -- vin (17 caracteres)
    'Honda',               -- marca
    'Civic',               -- modelo
    2020,                  -- anio_fabricacion
    'JH4KA7561PC123456',   -- numero_chasis
    'ABC-123',             -- placa
    'Sedán',               -- type_vehiculo
    '1.5L',                -- motor_cc
    'Gasolina',            -- motor_type_combustible
    'Manual',              -- transmision
    'Blanco',              -- color
    '50000',               -- kilometraje
    '4',                   -- numero_puertas
    'Delantera',           -- traccion
    'Usado',               -- condicion
    'Sin accidentes',      -- historial_accidentes
    'Al día',              -- mantenimiento
    'Vigente',             -- garantia
    '$15000',              -- precio
    'Disponible',          -- disponibilidad_financiamiento
    'Concesionario XYZ',   -- predio_o_vendedor
    'contacto@xyz.com',    -- contacto
    '/fotos/civic2020/',   -- fotos
    'VIDEO123456789AB'     -- videos (17 caracteres)
);

INSERT INTO foto_vehiculo (
    vin, ruta_foto, descripcion, fecha_subida
) VALUES (
    '1HGCM82633A123456',           -- vin (debe existir en tabla vehiculo)
    '/fotos/civic2020/frontal.jpg', -- ruta_foto
    'Vista frontal del vehículo',   -- descripcion
    GETDATE()                       -- fecha_subida (opcional, se usa DEFAULT)
);

-- O sin especificar fecha_subida para usar el DEFAULT:
INSERT INTO foto_vehiculo (vin, ruta_foto, descripcion) 
VALUES ('1HGCM82633A123456', '/fotos/civic2020/lateral.jpg', 'Vista lateral derecha');

INSERT INTO video_vehiculo (
    vin, ruta_video, descripcion, fecha_subida
) VALUES (
    '1HGCM82633A123456',              -- vin
    '/videos/civic2020/recorrido.mp4', -- ruta_video
    'Recorrido completo del vehículo', -- descripcion
    GETDATE()                          -- fecha_subida
);

INSERT INTO transmision_vehiculo (
    vin, url_transmision, plataforma, descripcion, 
    fecha_inicio, fecha_fin
) VALUES (
    '1HGCM82633A123456',                    -- vin
    'https://youtube.com/watch?v=abc123',   -- url_transmision
    'YouTube',                              -- plataforma
    'Transmisión en vivo de prueba',        -- descripcion
    '2025-10-18',                  -- fecha_inicio
    '2025-10-18'                   -- fecha_fin
);

-- Para una transmisión en curso (sin fecha_fin):
INSERT INTO transmision_vehiculo (
    vin, url_transmision, plataforma, descripcion, fecha_inicio
) VALUES (
    '1HGCM82633A123456',
    'https://zoom.us/j/123456789',
    'Zoom',
    'Consulta virtual con cliente',
    GETDATE()
);

-- ===============================================
-- SEGUNDO VEHÍCULO: Toyota Corolla
-- ===============================================

INSERT INTO vehiculo (
    vin, marca, modelo, anio_fabricacion, numero_chasis, placa, 
    type_vehiculo, motor_cc, motor_type_combustible, transmision, 
    color, kilometraje, numero_puertas, traccion, condicion, 
    historial_accidentes, mantenimiento, garantia, precio, 
    disponibilidad_financiamiento, predio_o_vendedor, contacto, 
    fotos, videos
) VALUES (
    '2T1BURHE9JC123789',  -- vin (17 caracteres) - Toyota
    'Toyota',              -- marca
    'Corolla',             -- modelo
    2019,                  -- anio_fabricacion
    '2T1BURHE9JC654321',   -- numero_chasis
    'XYZ-789',             -- placa
    'Sedán',               -- type_vehiculo
    '1.8L',                -- motor_cc
    'Gasolina',            -- motor_type_combustible
    'Automático',          -- transmision
    'Gris',                -- color
    '75000',               -- kilometraje
    '4',                   -- numero_puertas
    'Delantera',           -- traccion
    'Usado',               -- condicion
    'Un accidente menor',  -- historial_accidentes
    'Reciente',            -- mantenimiento
    'Vencida',             -- garantia
    '$12500',              -- precio
    'No disponible',       -- disponibilidad_financiamiento
    'AutoDealer Pro',      -- predio_o_vendedor
    'ventas@autodealer.com', -- contacto
    '/fotos/corolla2019/', -- fotos
    'VIDEO987654321XY'     -- videos (17 caracteres)
);

-- Fotos para el Toyota Corolla
INSERT INTO foto_vehiculo (
    vin, ruta_foto, descripcion
) VALUES 
    ('2T1BURHE9JC123789', '/fotos/corolla2019/frontal.jpg', 'Vista frontal Toyota Corolla'),
    ('2T1BURHE9JC123789', '/fotos/corolla2019/lateral.jpg', 'Vista lateral izquierda'),
    ('2T1BURHE9JC123789', '/fotos/corolla2019/interior.jpg', 'Interior del vehículo');

-- Video para el Toyota Corolla
INSERT INTO video_vehiculo (
    vin, ruta_video, descripcion
) VALUES (
    '2T1BURHE9JC123789',
    '/videos/corolla2019/presentacion.mp4',
    'Video presentación Toyota Corolla 2019'
);

-- Transmisión para el Toyota Corolla
INSERT INTO transmision_vehiculo (
    vin, url_transmision, plataforma, descripcion, fecha_inicio
) VALUES (
    '2T1BURHE9JC123789',
    'https://facebook.com/live/corolla789',
    'Facebook Live',
    'Demostración en vivo del Toyota Corolla',
    GETDATE()
);

-- ===============================================
-- TERCER VEHÍCULO: Ford Explorer
-- ===============================================

INSERT INTO vehiculo (
    vin, marca, modelo, anio_fabricacion, numero_chasis, placa, 
    type_vehiculo, motor_cc, motor_type_combustible, transmision, 
    color, kilometraje, numero_puertas, traccion, condicion, 
    historial_accidentes, mantenimiento, garantia, precio, 
    disponibilidad_financiamiento, predio_o_vendedor, contacto, 
    fotos, videos
) VALUES (
    '1FM5K8D86KGA45678',  -- vin (17 caracteres) - Ford
    'Ford',                -- marca
    'Explorer',            -- modelo
    2021,                  -- anio_fabricacion
    '1FM5K8D86KGA98765',   -- numero_chasis
    'DEF-456',             -- placa
    'SUV',                 -- type_vehiculo
    '2.3L Turbo',          -- motor_cc
    'Gasolina',            -- motor_type_combustible
    'Automático',          -- transmision
    'Azul',                -- color
    '25000',               -- kilometraje
    '5',                   -- numero_puertas
    '4x4',                 -- traccion
    'Seminuevo',           -- condicion
    'Sin accidentes',      -- historial_accidentes
    'Al día',              -- mantenimiento
    'Vigente',             -- garantia
    '$28000',              -- precio
    'Disponible',          -- disponibilidad_financiamiento
    'Ford Premium',        -- predio_o_vendedor
    'info@fordpremium.com', -- contacto
    '/fotos/explorer2021/', -- fotos
    'VIDEO456789123QW'     -- videos (17 caracteres)
);

-- Fotos para el Ford Explorer
INSERT INTO foto_vehiculo (
    vin, ruta_foto, descripcion
) VALUES 
    ('1FM5K8D86KGA45678', '/fotos/explorer2021/frontal.jpg', 'Vista frontal Ford Explorer'),
    ('1FM5K8D86KGA45678', '/fotos/explorer2021/trasera.jpg', 'Vista trasera'),
    ('1FM5K8D86KGA45678', '/fotos/explorer2021/interior.jpg', 'Interior premium'),
    ('1FM5K8D86KGA45678', '/fotos/explorer2021/motor.jpg', 'Motor 2.3L Turbo');

-- Video para el Ford Explorer
INSERT INTO video_vehiculo (
    vin, ruta_video, descripcion
) VALUES (
    '1FM5K8D86KGA45678',
    '/videos/explorer2021/test_drive.mp4',
    'Test drive Ford Explorer 2021 - Características principales'
);

-- Transmisión para el Ford Explorer
INSERT INTO transmision_vehiculo (
    vin, url_transmision, plataforma, descripcion, fecha_inicio, fecha_fin
) VALUES (
    '1FM5K8D86KGA45678',
    'https://youtube.com/watch?v=explorer2021',
    'YouTube',
    'Revisión completa Ford Explorer 2021',
    '2025-10-19 10:00:00',
    '2025-10-19 11:30:00'
);