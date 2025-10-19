-- ===============================================
-- CUARTO VEHÍCULO: Chevrolet Camaro 2022
-- ===============================================

INSERT INTO vehiculo (
    vin, marca, modelo, anio_fabricacion, numero_chasis, placa, 
    type_vehiculo, motor_cc, motor_type_combustible, transmision, 
    color, kilometraje, numero_puertas, traccion, condicion, 
    historial_accidentes, mantenimiento, garantia, precio, 
    disponibilidad_financiamiento, predio_o_vendedor, contacto, 
    fotos, videos
) VALUES (
    '1G1FE1R77N0123456',  -- vin (17 caracteres) - Chevrolet
    'Chevrolet',           -- marca
    'Camaro',              -- modelo
    2022,                  -- anio_fabricacion
    '1G1FE1R77N0654321',   -- numero_chasis
    'SPT-001',             -- placa
    'Coupé Deportivo',     -- type_vehiculo
    '6.2L V8',             -- motor_cc
    'Gasolina',            -- motor_type_combustible
    'Manual 6 velocidades', -- transmision
    'Rojo Racing',         -- color
    '8500',                -- kilometraje
    '2',                   -- numero_puertas
    'Trasera',             -- traccion
    'Nuevo',               -- condicion
    'Sin accidentes',      -- historial_accidentes
    'Completo',            -- mantenimiento
    'Vigente 3 años',      -- garantia
    '$45000',              -- precio
    'Disponible',          -- disponibilidad_financiamiento
    'Sports Cars Elite',   -- predio_o_vendedor
    'ventas@sportscars.com', -- contacto
    '/fotos/camaro2022/',  -- fotos
    'VIDEO789012345RS'     -- videos (17 caracteres)
);

-- Fotos para el Chevrolet Camaro
INSERT INTO foto_vehiculo (
    vin, ruta_foto, descripcion
) VALUES 
    ('1G1FE1R77N0123456', '/fotos/camaro2022/frontal.jpg', 'Vista frontal Chevrolet Camaro deportivo'),
    ('1G1FE1R77N0123456', '/fotos/camaro2022/lateral.jpg', 'Perfil deportivo lateral'),
    ('1G1FE1R77N0123456', '/fotos/camaro2022/interior.jpg', 'Interior deportivo con asientos racing'),
    ('1G1FE1R77N0123456', '/fotos/camaro2022/motor.jpg', 'Motor V8 6.2L de alto rendimiento'),
    ('1G1FE1R77N0123456', '/fotos/camaro2022/trasera.jpg', 'Vista trasera con escape dual');

-- Video para el Chevrolet Camaro
INSERT INTO video_vehiculo (
    vin, ruta_video, descripcion
) VALUES (
    '1G1FE1R77N0123456',
    '/videos/camaro2022/sound_test.mp4',
    'Prueba de sonido del motor V8 - Aceleración y escape'
);

-- Transmisión para el Chevrolet Camaro
INSERT INTO transmision_vehiculo (
    vin, url_transmision, plataforma, descripcion, fecha_inicio, fecha_fin
) VALUES (
    '1G1FE1R77N0123456',
    'https://twitch.tv/sportscars_live',
    'Twitch',
    'Test drive en vivo del Chevrolet Camaro 2022',
    '2025-10-20 15:00:00',
    '2025-10-20 16:00:00'
);

-- ===============================================
-- QUINTO VEHÍCULO: Nissan Sentra 2023
-- ===============================================

INSERT INTO vehiculo (
    vin, marca, modelo, anio_fabricacion, numero_chasis, placa, 
    type_vehiculo, motor_cc, motor_type_combustible, transmision, 
    color, kilometraje, numero_puertas, traccion, condicion, 
    historial_accidentes, mantenimiento, garantia, precio, 
    disponibilidad_financiamiento, predio_o_vendedor, contacto, 
    fotos, videos
) VALUES (
    '3N1AB8CV5PY123789',  -- vin (17 caracteres) - Nissan
    'Nissan',              -- marca
    'Sentra',              -- modelo
    2023,                  -- anio_fabricacion
    '3N1AB8CV5PY987654',   -- numero_chasis
    'ECO-789',             -- placa
    'Sedán Compacto',      -- type_vehiculo
    '2.0L',                -- motor_cc
    'Gasolina',            -- motor_type_combustible
    'CVT Automático',      -- transmision
    'Plata Metálico',      -- color
    '12000',               -- kilometraje
    '4',                   -- numero_puertas
    'Delantera',           -- traccion
    'Seminuevo',           -- condicion
    'Sin accidentes',      -- historial_accidentes
    'Al día',              -- mantenimiento
    'Vigente 2 años',      -- garantia
    '$18500',              -- precio
    'Disponible',          -- disponibilidad_financiamiento
    'Nissan Official',     -- predio_o_vendedor
    'info@nissanofficial.com', -- contacto
    '/fotos/sentra2023/',  -- fotos
    'VIDEO345678901TU'     -- videos (17 caracteres)
);

-- Fotos para el Nissan Sentra
INSERT INTO foto_vehiculo (
    vin, ruta_foto, descripcion
) VALUES 
    ('3N1AB8CV5PY123789', '/fotos/sentra2023/frontal.jpg', 'Vista frontal Nissan Sentra elegante'),
    ('3N1AB8CV5PY123789', '/fotos/sentra2023/interior.jpg', 'Interior moderno con tecnología'),
    ('3N1AB8CV5PY123789', '/fotos/sentra2023/lateral.jpg', 'Perfil aerodinámico');

-- Video para el Nissan Sentra
INSERT INTO video_vehiculo (
    vin, ruta_video, descripcion
) VALUES (
    '3N1AB8CV5PY123789',
    '/videos/sentra2023/efficiency_test.mp4',
    'Prueba de eficiencia de combustible - Ciudad y carretera'
);

-- Transmisión para el Nissan Sentra
INSERT INTO transmision_vehiculo (
    vin, url_transmision, plataforma, descripcion, fecha_inicio
) VALUES (
    '3N1AB8CV5PY123789',
    'https://instagram.com/live/sentra2023',
    'Instagram Live',
    'Review completo del Nissan Sentra 2023 - Características y precio',
    GETDATE()
);