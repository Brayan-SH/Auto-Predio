USE [Auto Predio];
GO
-- VEHÍCULO
INSERT INTO vehiculos (vin, marca, modelo, anio_fabricacion, color, kilometraje, precio, condicion, fecha_registro, numero_chasis, placa, tipo_vehiculo, cc_motor, tipo_combustible, transmision, numero_puertas, traccion, historial_accidentes, mantenimiento, garantia, disponibilidad_financiamiento, predio_o_vendedor, contacto, id_vendedor)
VALUES ('TEST123456789VIN', 'Toyota', 'Corolla', 2024, 'Blanco', '5000', '350000', 'Nuevo', GETDATE(), 'TEST123456789CHA', 'TST-2024', 'Sedan', '1.8L', 'Gasolina', 'CVT', 4, 'FWD', 'Sin accidentes', 'Toyota Service', 'Vigente 3 años', 'Disponible', 'Toyota Center', 'test@toyota.mx', (SELECT v.id_vendedor FROM vendedores v WHERE v.nombre_comercial = 'Premium Motors CDMX'));

-- FOTOS (usar fotos_vehiculos)
INSERT INTO fotos_vehiculos (vin, ruta_foto, descripcion, id_vehiculo)
SELECT 'TEST123456789VIN', '/fotos/toyota_corolla/frontal.jpg', 'Vista frontal Toyota Corolla', v.id_vehiculo FROM vehiculos v WHERE v.vin = 'TEST123456789VIN';

-- VIDEOS (usar videos_vehiculos)
INSERT INTO videos_vehiculos (vin, ruta_video, descripcion, id_vehiculo)
SELECT 'TEST123456789VIN', '/videos/toyota_corolla/tour.mp4', 'Tour Toyota Corolla 2024', v.id_vehiculo FROM vehiculos v WHERE v.vin = 'TEST123456789VIN';

-- Limpiar datos de prueba (COMENTADO para mantener el vehículo)
-- DELETE FROM fotos_vehiculos WHERE vin = 'TEST123456789VIN';
-- DELETE FROM videos_vehiculos WHERE vin = 'TEST123456789VIN';
-- DELETE FROM vehiculos WHERE vin = 'TEST123456789VIN';

PRINT 'Vehiculo Toyota Corolla guardado exitosamente - Usar fotos_vehiculos y videos_vehiculos';