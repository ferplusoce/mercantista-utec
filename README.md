# Mercantista

# PROMPT MAESTRO PARA LOVABLE — MERCANTISTA

## 1. Rol y objetivo del proyecto

Actúa como un equipo experto compuesto por un diseñador UX/UI, desarrollador full-stack, especialista en comercio electrónico y consultor de operaciones logísticas para mercados mayoristas.

Quiero que desarrolles una aplicación web profesional, moderna, responsive y funcional llamada **Mercantista**, enfocada principalmente en abastecer bodegas y pequeños negocios con frutas y verduras frescas compradas en el Mercado Mayorista Unicachi.

**Nombre:** Mercantista  
**Eslogan:** “Tu bodega abastecida, sin salir de ella”.  
**Mercado inicial:** Lima Sur, comenzando por Lurín y zonas cercanas.  
**Clientes principales:** bodegas, minimarkets, puestos de mercado, restaurantes pequeños y otros negocios que compran frutas y verduras al por mayor.

El objetivo es que un bodeguero pueda explorar los productos disponibles, comparar opciones entre puestos del mercado, solicitar productos específicos, elegir cómo recibir su compra y conocer cuánto le costará el servicio.

No construyas únicamente una landing page. Desarrolla una aplicación con navegación real, páginas conectadas, formularios funcionales, carrito, cálculos, gestión de pedidos y panel administrativo.

Todo el contenido de ejemplo debe estar claramente identificado como demostrativo cuando no se encuentre verificado. No inventes integraciones que todavía no existen.

---

## 2. Concepto diferencial de Mercantista

Mercantista facilita el abastecimiento de las bodegas sin que sus propietarios tengan que abandonar sus negocios para comprar en el mercado mayorista.

La aplicación debe transmitir tres ideas:

1. **Frescura:** frutas y verduras como protagonistas del catálogo.
2. **Ahorro de tiempo:** el bodeguero sigue atendiendo mientras Mercantista gestiona sus compras.
3. **Flexibilidad:** el cliente puede elegir productos de distintos puestos y decidir cómo recibirá su pedido.

El elemento central de la experiencia debe ser la navegación por los puestos o vendedores de Unicachi, además de un catálogo de productos.

No diseñes el negocio como si fuera un supermercado convencional que vende todo desde un único almacén. Mercantista compra productos a diferentes vendedores y puestos del mercado mayorista. Cada puesto puede tener productos, precios, disponibilidad y condiciones diferentes.

El enfoque comercial principal será frutas y verduras. Otros productos de abarrotes podrán agregarse posteriormente, pero no deben dominar el diseño inicial.

## 3. Identidad visual y diseño

Crea una interfaz de calidad comercial, limpia, cálida y moderna. Debe parecer un producto digital real listo para presentarse a clientes e inversionistas.

### Paleta de colores

- Rojo anaranjado principal: #E7472E.
- Crema de fondo: #F7F0EA.
- Blanco: #FFFFFF.
- Texto principal: #211D1B.
- Texto secundario: #786F69.
- Bordes: #E9DED6.
- Verde de confirmación: #23845B.

### Estilo visual

- Bordes suavemente redondeados: `rounded-2xl` y `rounded-xl`.
- Sombras sutiles y elegantes: `shadow-sm`, `shadow-md`.
- Tipografía moderna, legible y jerarquizada: títulos claros, números destacados para precios y pesos.
- Iconos profesionales: Lucide Icons (`ShoppingBag`, `Store`, `Truck`, `Car`, `Clock`, `ShieldCheck`, `TrendingUp`, `Plus`, `Search`, etc.).
- Sensación visual: mercado mayorista ordenado, fresco, rápido y confiable.
- Diseño pensado primero para móviles, pero con excelente adaptación a computadoras y tablets. Los bodegueros usarán principalmente teléfonos inteligentes.

---

## 4. Estructura general de navegación

La aplicación debe contar con las siguientes secciones funcionales accesibles mediante una barra de navegación superior y un menú inferior móvil:

### Para los clientes

1. **Inicio:** propuesta de valor, categorías rápidas, puestos destacados, cómo funciona, llamada a la acción.
2. **Catálogo:** lista general de frutas y verduras con filtros avanzados, búsqueda y ordenamiento.
3. **Puestos:** directorio de puestos y vendedores de Unicachi con fichas individuales.
4. **Solicitud personalizada:** formulario interactivo para pedir productos específicos que no estén listados en el catálogo.
5. **Servicios y tarifas:** explicación clara de los 2 servicios y simulador de costos.
6. **Carrito:** resumen interactivo de productos seleccionados agrupados o clasificados por puesto.
7. **Cotización y checkout:** flujo de confirmación de pedido con selección de servicio de entrega.
8. **Seguimiento:** pantalla para consultar el estado del pedido en tiempo real mediante un código único.
9. **Mi cuenta:** perfil básico del cliente con historial de pedidos y direcciones guardadas.

### Para el administrador

10. **Panel de control:** estadísticas generales, gestión de puestos, gestión de productos, pedidos entrantes, configuración de tarifas y métricas de costos operativos.

---

## 5. Página de inicio

Diseña una página de inicio estructurada con las siguientes secciones:

### Encabezado

- Logotipo de Mercantista con ícono alusivo al abastecimiento fresco.
- Selector rápido de zona de entrega: “Lurín y alrededores (Lima Sur)”.
- Barra de búsqueda destacada con autocompletado simulado para buscar frutas, verduras o puestos.
- Botón rápido a “Solicitud personalizada”.
- Acceso a “Mis pedidos” y carrito con contador numérico de productos.

### Banner principal

- Titular atractivo: “Abastece tu bodega desde el Mercado Mayorista Unicachi sin moverte de tu negocio”.
- Subtítulo: “Compramos tus frutas y verduras en los mejores puestos de Unicachi y te las entregamos en tu taxi de confianza o con nuestra miniván”.
- 2 botones principales de acción:
  - Botón primario: “Explorar catálogo”.
  - Botón secundario: “Pedir lista por encargo”.
- 3 indicadores rápidos de confianza con iconos:
  - “Precios directos de Unicachi”.
  - “Entregas programadas en la mañana”.
  - “Atención personalizada por WhatsApp”.

### Categorías principales

Acceso visual mediante tarjetas interactivas:

1. **Papas, camotes y tubérculos:** sacos, medios sacos y mallas.
2. **Cebollas y ajos:** sacos, mallas y cuartos.
3. **Tomates y hortalizas:** cajas, jabas y atados.
4. **Verduras de hoja verde:** atados grandes y cajones.
5. **Frutas de estación:** cajas, cajones y jabas.
6. **Cítricos y plátanos:** cajones, racimos y mallas.

### Productos destacados

- Tarjetas de producto que muestren nombre, puesto de origen dentro de Unicachi, tipo de presentación por mayor, precio referencial, disponibilidad y botón rápido para agregar al pedido.

### Sección de puestos destacados

- Tarjetas de puestos de Unicachi mostrando:
  - Nombre del puesto y número o pabellón dentro de Unicachi.
  - Especialidad principal.
  - Nombre del vendedor o contacto.
  - Calificación o distintivo de confianza.
  - Botón para ver los productos de ese puesto.

### Sección de cómo funciona

Flujo visual claro en 4 pasos:

1. **Eliges tus productos:** selecciona del catálogo o escribe tu lista personalizada.
2. **Compramos en Unicachi:** nuestro equipo adquiere los productos directamente en los puestos seleccionados.
3. **Eliges tu entrega:** enviamos tu carga a tu taxi de confianza o la llevamos en nuestra miniván hasta tu bodega.
4. **Recibes y verificas:** recibes tu mercadería fresca lista para la venta del día.

### Solicitud personalizada

Banner visual invitando al bodeguero a enviar su lista completa si no desea buscar producto por producto:

- “¿Tienes tu lista lista? Sube tu lista de compras o escríbela aquí y nosotros cotizamos en Unicachi por ti”.
- Botón: “Cotizar mi lista”.

---

## 6. Catálogo de frutas y verduras

Crea una vista completa de catálogo con:

### Filtros

- Por tipo de producto: Tubérculos, Cebollas/Ajos, Hortalizas, Hojas verdes, Frutas, Cítricos.
- Por puesto de Unicachi: menú desplegable con los puestos disponibles.
- Por formato de venta por mayor:
  - Saco completo (50 kg / 45 kg aprox.).
  - Medio saco.
  - Jaba o caja de madera.
  - Malla.
  - Atado mayorista.
  - Docena o ciento.
- Por rango de precio.
- Interruptor para mostrar únicamente productos con stock confirmado hoy.

### Tarjetas de productos

Cada tarjeta debe mostrar:

- Fotografía de buena calidad relacionada con el producto mayorista.
- Etiqueta de categoría y etiqueta con el puesto de origen.
- Nombre del producto (ejemplo: “Papa Canchán seleccionada”, “Cebolla roja de Arequipa”, “Tomate Katia de primera”).
- Presentación mayorista (ejemplo: “Saco de 50 kg”, “Jaba de 20 kg”, “Cajón de 18 kg”).
- Precio mayorista referencial en soles (S/).
- Selector de cantidad al por mayor.
- Botón “Agregar al pedido”.
- Modal o vista de detalle al hacer clic en el producto, mostrando:
  - Descripción de la calidad (primera, segunda, comercial).
  - Puesto que lo vende, ubicación en Unicachi y horario en que despacha.
  - Información sobre variabilidad de precios del mercado mayorista.
  - Productos relacionados del mismo puesto.

### Reglas de precios

- Debe incluir una nota informativa clara en el catálogo: “Los precios del Mercado Mayorista Unicachi pueden variar diariamente según la oferta del día. Los montos mostrados son referencias actualizadas esta madrugada”.

---

## 7. Directorio y detalle de puestos

Crea una sección dedicada a los vendedores y puestos de Unicachi:

- Lista de puestos con filtros por pabellón o especialidad.
- Buscador de puestos por nombre o número.

### Página individual del puesto

Cada puesto debe tener una vista dedicada con:

- Nombre comercial del puesto (ejemplo: “Distribuidora Don Lucho - Puesto B-14”).
- Especialidad (ejemplo: “Especialistas en papa amarilla, huayro y canchán por saco”).
- Pabellón y número de puesto en Unicachi.
- Nombre del encargado del puesto.
- Horario de atención mayorista (ejemplo: “03:00 am - 11:00 am”).
- Distintivo de “Puesto verificado por Mercantista”.
- Catálogo exclusivo de productos que vende ese puesto específico.
- Opción para solicitar un producto especial a ese puesto que no esté en la lista.

---

## 8. Solicitud personalizada de compra

Muchos bodegueros no compran navegando por catálogos, sino con una lista escrita a mano o en un mensaje de texto rápido. Crea una herramienta interactiva para atender esta necesidad:

- Formulario con dos modalidades:
  1. **Escribir lista línea por línea:** tabla interactiva donde el usuario agrega filas con:
     - Nombre del producto.
     - Cantidad solicitada.
     - Unidad o formato (Saco, Jaba, Caja, Malla, Atado, Kilos).
     - Calidad preferida (Primera, Comercial, Económica).
     - Puesto de preferencia en Unicachi (opcional).
     - Notas o especificaciones (ejemplo: “Papas medianas para freír”, “Tomates pintones”).
  2. **Subir foto de lista escrita a mano o archivo de texto:** campo para adjuntar imagen o documento con previsualización.
- Datos de contacto del cliente:
  - Nombre del negocio / bodega.
  - Nombre del responsable.
  - Teléfono / WhatsApp.
  - Dirección del negocio en Lurín o zona sur.
  - Fecha y hora deseada de recepción.
- Botón de envío que genere una solicitud en el sistema y entregue un número de confirmación.

---

## 9. Carrito de compras

Desarrolla un carrito de compras dinámico y detallado:

- Productos agrupados visualmente por puesto de origen en Unicachi.
- Control interactivo de cantidades con recálculo automático de subtotales.
- Desglose de peso estimado total del pedido (crucial para calcular la logística).
- Desglose del número estimado de bultos (sacos, jabas, cajas).
- Opción para agregar una nota específica por producto (ejemplo: “Por favor verificar que no vengan golpeados”).
- Resumen financiero preliminar:
  - Subtotal estimado de productos de Unicachi.
  - Nota indicando que el costo de servicio de compra y entrega se definirá en el siguiente paso.
- Botón para avanzar a la selección de servicio.

---

## 10. Selección de servicios

Esta es una de las pantallas más importantes de Mercantista. El usuario debe elegir con total claridad entre los dos modelos de entrega disponibles:

### SERVICIO 1: Compra y entrega al taxi de confianza

- **Título:** “Servicio de Compra y Estiba hacia tu Taxi de Confianza”.
- **Descripción:** “Mercantista compra tus productos en los puestos de Unicachi, los reúne, revisa su calidad y los sube directamente al taxi o transportista que tú contrates y envíes al mercado”.
- **Costo del servicio:** Tarifa fija transparente por gestión de compras y estiba en Unicachi (por ejemplo, S/ 25.00 base + S/ 2.00 por saco o bulto adicional a partir del quinto bulto).
- **Campos requeridos para este servicio:**
  - Nombre completo del taxista o chofer.
  - Número de placa del vehículo.
  - Teléfono móvil del conductor.
  - Hora estimada de llegada del taxi a Unicachi (rango entre 04:00 am y 09:00 am).
  - Punto de encuentro acordado en Unicachi (ejemplo: Puerta 2, Estacionamiento B).
- **Nota informativa:** “El costo de la carrera del taxi lo pagas directamente a tu conductor según tu acuerdo con él. Mercantista solo cobra por el servicio de compra, control de calidad y carga en Unicachi”.

### SERVICIO 2: Compra y entrega con la miniván de Mercantista

- **Título:** “Servicio Integral: Compra, Carga y Entrega en tu Bodega con Miniván Mercantista”.
- **Descripción:** “Nosotros nos encargamos de todo. Compramos en Unicachi, cargamos en nuestra unidad de transporte y te llevamos el pedido completo hasta la puerta de tu bodega en Lurín o zonas autorizadas”.
- **Capacidad del vehículo:** Miniván de carga de 750 kg a 800 kg de capacidad útil.

### Simulador de tarifa de entrega

Calculadora interactiva en pantalla que determine el costo del servicio en función de:

1. **Distancia o zona de entrega:**
   - Lurín Cercado.
   - Lurín - Julio C. Tello.
   - Lurín - Huertos de Lurín.
   - Lurín - Km 40 / Arica.
   - Villa El Salvador (zonas limítrofes).
   - Pachacámac (zonas bajas).
2. **Volumen / Peso del pedido:**
   - De 1 a 200 kg (hasta ~4 bultos).
   - De 201 a 450 kg (~5 a 9 bultos).
   - De 451 a 750 kg (~10 a 15 bultos - unidad completa o semicompleta).
3. **Puestos visitados:**
   - Si los productos provienen de 1 a 2 puestos: tarifa estándar.
   - Si los productos provienen de 3 o más puestos distintos: pequeño adicional por consolidación y tiempo de estiba.
4. **Horario de entrega seleccionado:**
   - Turno 1: Madrugada (05:30 am - 07:30 am) - ideal para abrir bodega abastecido.
   - Turno 2: Mañana (08:00 am - 10:30 am).

### Pago del servicio 2

El costo total debe desglosarse claramente:
- Costo estimado de los productos en Unicachi.
- Tarifa de compra y consolidación Mercantista.
- Tarifa de transporte y entrega local.

---

## 11. Cotización y confirmación del pedido

Pantalla de confirmación con:

- Resumen completo del pedido con lista de productos, puestos, cantidades y presentaciones.
- Tipo de servicio seleccionado con todos sus detalles.
- Total estimado detallado.
- Explicación del mecanismo de pago:
  - Explicar que debido a la naturaleza mayorista diaria, Mercantista valida el precio exacto en Unicachi durante la madrugada.
  - Opciones de confirmación:
    1. **Pago contra entrega / recepción (para clientes frecuentes).**
    2. **Adelanto del 50% mediante transferencia, Yape o Plin, y saldo al recibir la mercadería.**
    3. **Pago completo anticipado.**
- Selector del método de pago preferido:
  - Yape / Plin.
  - Transferencia BCP / BBVA / Interbank.
  - Efectivo contra entrega.
- Datos de facturación o boleta (DNI o RUC, Razón social, Dirección).
- Botón principal: “Confirmar y enviar pedido”.
- Tras la confirmación:
  - Generación de código único de pedido (ejemplo: `MCT-2026-0842`).
  - Pantalla de éxito con opción de descargar resumen en PDF o compartir por WhatsApp con un solo clic.

---

## 12. Seguimiento del pedido

Vista para que el cliente consulte el avance de su pedido:

- Campo para ingresar el código de pedido.
- Línea de tiempo visual con los siguientes estados:
  1. **Pedido recibido:** Mercantista registró la orden.
  2. **Verificando precios y puestos:** equipo coordinando con los vendedores de Unicachi.
  3. **Comprando en Unicachi:** compra física y selección de calidad en proceso.
  4. **En estiba / En punto de encuentro:** mercadería lista en Unicachi.
     - *Si es Servicio 1:* esperando al taxi asignado o cargando en el taxi con placa registrada.
     - *Si es Servicio 2:* cargado en la miniván de Mercantista e iniciando ruta hacia Lurín.
  5. **En camino a tu bodega:** transporte en trayecto con tiempo estimado de llegada.
  6. **Entregado y completado:** mercadería recibida y verificada por el cliente.
- Información de contacto del coordinador de turno en Unicachi con botón directo a WhatsApp.

---

## 13. Perfil del cliente

- Datos del negocio: Nombre de la bodega, nombre del dueño, teléfono, RUC/DNI.
- Direcciones guardadas con referencias claras para la miniván.
- Registro de sus taxis de confianza habituales (nombre del chofer, placa y teléfono para seleccionarlos con un clic en compras futuras).
- Historial de pedidos anteriores con botón de “Repetir este pedido”.

---

## 14. Panel administrativo

Desarrolla un panel completo para el operador de Mercantista con las siguientes pestañas:

### Resumen

- Pedidos del día por estado.
- Volumen total en kilogramos y bultos proyectados para la jornada.
- Desglose por tipo de servicio (Servicio 1: Taxi vs. Servicio 2: Miniván).
- Ingresos brutos estimados por comisiones y transporte.
- Lista de puestos de Unicachi que deben visitarse hoy con la suma de productos a recoger en cada uno.

### Gestión de puestos

- Crear, editar, pausar o eliminar puestos de Unicachi.
- Campos: Nombre del puesto, número, pabellón, responsable, teléfono directo, especialidad, horario y notas internas (ejemplo: “Buen fiado”, “Pide efectivo”, “Mejor calidad en saco cerrado”).

### Gestión de productos

- Crear, editar y actualizar precios diarios de productos.
- Asignación de cada producto a uno o varios puestos de Unicachi.
- Modificación masiva rápida de precios (los precios cambian a diario a las 04:00 am).
- Marcador de disponibilidad (Disponible hoy, Agotado en Unicachi, Precio por confirmar).

### Gestión de pedidos

- Tabla interactiva con filtros por estado, fecha y tipo de servicio.
- Cambio de estado del pedido en un clic con actualización en tiempo real para el cliente.
- Modal de detalle del pedido con:
  - Lista de compra para el estibador/comprador en Unicachi.
  - Datos del taxi de confianza (si aplica).
  - Hoja de ruta para el chofer de la miniván (si aplica).
  - Ajuste de precio final real comprado en caso de diferencias con la referencia.

### Gestión de tarifas

- Configuración de la tarifa base del Servicio 1 (Taxi).
- Configuración de tarifas por zona y por rango de peso del Servicio 2 (Miniván).
- Costo adicional por bulto extra o puesto adicional.

### Reportes financieros

- Comparador de costos operativos de la miniván (combustible, mantenimiento, chofer, depreciación) versus ingresos cobrados por fletes y comisiones de compra.
- Margen de ganancia promedio por servicio y por día.

---

## 15. Modelo de datos y base de datos

Configura la estructura de base de datos con tablas relacionales y políticas de seguridad (RLS):

### profiles
- `id` (uuid, fk a auth.users)
- `business_name` (text)
- `contact_name` (text)
- `phone` (text)
- `document_type` (text - DNI/RUC)
- `document_number` (text)
- `role` (text - 'client' | 'admin' | 'buyer')
- `created_at` (timestamp)

### addresses
- `id` (uuid)
- `user_id` (uuid, fk a profiles)
- `district` (text)
- `zone` (text)
- `address_line` (text)
- `reference` (text)
- `is_default` (boolean)

### vendors
- `id` (uuid)
- `stall_number` (text - ej: "Pabellón B - Puesto 14")
- `commercial_name` (text)
- `contact_name` (text)
- `phone` (text)
- `specialty` (text)
- `schedule` (text)
- `is_verified` (boolean)
- `internal_notes` (text)
- `is_active` (boolean)

### products
- `id` (uuid)
- `name` (text)
- `category` (text)
- `description` (text)
- `wholesale_unit` (text - Saco, Jaba, Caja, Malla, Atado)
- `average_weight_kg` (numeric)
- `reference_price` (numeric)
- `quality_grade` (text)
- `image_url` (text)
- `is_available` (boolean)

### vendor_products
- `id` (uuid)
- `vendor_id` (uuid, fk a vendors)
- `product_id` (uuid, fk a products)
- `stall_price` (numeric)
- `is_available_today` (boolean)

### custom_requests
- `id` (uuid)
- `user_id` (uuid, nullable para clientes no registrados)
- `business_name` (text)
- `contact_name` (text)
- `phone` (text)
- `address` (text)
- `delivery_date` (date)
- `attachment_url` (text, nullable)
- `status` (text - 'pending' | 'quoted' | 'approved' | 'rejected')
- `total_quoted` (numeric, nullable)
- `created_at` (timestamp)

### custom_request_items
- `id` (uuid)
- `request_id` (uuid, fk a custom_requests)
- `product_name` (text)
- `quantity` (numeric)
- `unit` (text)
- `quality` (text)
- `preferred_vendor_id` (uuid, nullable)
- `notes` (text)

### orders
- `id` (uuid)
- `order_code` (text, único - ej: "MCT-2026-0842")
- `user_id` (uuid, nullable)
- `business_name` (text)
- `contact_name` (text)
- `phone` (text)
- `service_type` (text - 'taxi_delivery' | 'minivan_delivery')
- `status` (text - 'received' | 'verifying' | 'purchasing' | 'staging' | 'on_the_way' | 'delivered' | 'cancelled')
- `products_subtotal` (numeric)
- `service_fee` (numeric)
- `shipping_fee` (numeric)
- `total_amount` (numeric)
- `estimated_weight_kg` (numeric)
- `total_packages` (integer)
- `payment_method` (text)
- `payment_status` (text - 'pending' | 'partially_paid' | 'paid')
- `delivery_date` (date)
- `delivery_time_slot` (text)
- `delivery_address` (text, nullable)
- `delivery_zone` (text, nullable)
- `notes` (text)
- `created_at` (timestamp)

### order_items
- `id` (uuid)
- `order_id` (uuid, fk a orders)
- `product_id` (uuid, fk a products)
- `vendor_id` (uuid, fk a vendors)
- `quantity` (integer)
- `unit_price` (numeric)
- `subtotal` (numeric)
- `weight_kg` (numeric)
- `notes` (text)

### trusted_taxis
- `id` (uuid)
- `order_id` (uuid, nullable, fk a orders)
- `user_id` (uuid, nullable, fk a profiles)
- `driver_name` (text)
- `license_plate` (text)
- `driver_phone` (text)
- `meeting_point` (text)
- `estimated_arrival_time` (text)

### delivery_quotes
- `id` (uuid)
- `zone_name` (text)
- `min_weight_kg` (numeric)
- `max_weight_kg` (numeric)
- `price` (numeric)
- `active` (boolean)

### payments
- `id` (uuid)
- `order_id` (uuid, fk a orders)
- `amount` (numeric)
- `payment_method` (text)
- `reference_code` (text)
- `proof_image_url` (text, nullable)
- `status` (text - 'pending_verification' | 'verified' | 'rejected')
- `created_at` (timestamp)

### order_status_history
- `id` (uuid)
- `order_id` (uuid, fk a orders)
- `status` (text)
- `note` (text)
- `created_at` (timestamp)

### operating_costs
- `id` (uuid)
- `date` (date)
- `fuel_cost` (numeric)
- `driver_salary` (numeric)
- `maintenance_cost` (numeric)
- `other_costs` (numeric)
- `notes` (text)

### service_settings
- `id` (uuid)
- `setting_key` (text, unique)
- `setting_value` (jsonb)
- `description` (text)

---

## 16. Seguridad y permisos

- Habilita Row Level Security (RLS) en todas las tablas creadas.
- Los clientes deben poder ver únicamente sus propios pedidos, direcciones, taxis guardados y solicitudes personalizadas.
- El catálogo público de productos, categorías y puestos debe ser de lectura libre para todos los visitantes (`anon` y `authenticated`).
- El panel administrativo, la edición de puestos, la edición de productos y la consulta de costos operativos deben estar restringidos exclusivamente a usuarios con rol `admin`.
- Proporciona un usuario administrador preconfigurado para pruebas rápidas.

---

## 17. Tecnología e integraciones

- Interfaz construida con React, TypeScript, Tailwind CSS y componentes de shadcn/ui.
- Íconos con Lucide Icons.
- Gráficos en el panel administrativo mediante Recharts.
- Gestión de estado del carrito persistente en `localStorage`.
- Base de datos relacional y autenticación preparadas para Lovable Cloud (Supabase).
- Formularios interactivos con validación de campos obligatorios en español.
- Botones de acción directa con WhatsApp preconfigurados para abrir conversaciones con mensajes dinámicos (ejemplo: “Hola Mercantista, quiero consultar sobre mi pedido MCT-2026-0842”).

### Integraciones externas

No inventes conexiones con APIs de pasarelas de pago no configuradas. Implementa el flujo de pagos manuales demostrativo con carga de comprobante o selección de pago contra entrega, claramente identificado como modo demostrativo funcional.

---

## 18. Reglas de funcionamiento que no se deben incumplir

1. **El foco es B2B mayorista:** las unidades deben ser sacos, jabas, cajas, atados y mallas. No permitas ventas de 250 gramos o 1 manzana individual. Todo el lenguaje debe sonar al canal mayorista bodeguero peruano.
2. **Puestos visibles:** cada producto debe poder asociarse a un puesto específico de Unicachi.
3. **Simulador funcional:** el simulador de tarifas de transporte debe calcular montos reales en soles basados en zona y peso, no números estáticos o inventados sin lógica.
4. **Dos opciones de entrega siempre presentes:** tanto el servicio de taxi del cliente como el servicio de miniván de Mercantista deben estar claramente diferenciados y disponibles en el checkout.
5. **Generador de pedidos real:** el botón de finalizar pedido debe guardar el pedido en la base de datos o estado del sistema, entregar un código de seguimiento real y permitir su consulta inmediata en la pantalla de seguimiento.
6. **Datos peruanos realistas:** usa moneda en Soles (S/), distritos de Lima Sur (Lurín, Pachacámac, Villa El Salvador), productos típicos del mercado peruano (Papa Canchán, Papa Amarilla, Cebolla Roja, Ají Amarillo, Camote Amarillo, Limón Sutil, Tomate Katia, Plátano Seda, etc.).

---

## 19. Experiencia de usuario y calidad visual

- Todo el texto debe estar en perfecto español con modismos comerciales peruanos apropiados para bodegueros (“casero”, “abastecimiento”, “bodega”, “Unicachi”, “estiba”, “flete”).
- Notificaciones de éxito claras tipo toast al agregar al carrito o enviar solicitudes.
- Estados vacíos bien diseñados para el carrito vacío, sin pedidos o búsqueda sin resultados.
- Vistas optimizadas para pantallas táctiles de teléfonos móviles con botones grandes y fáciles de pulsar para usuarios en movimiento.
- Mensajes informativos que expliquen la variación de precios del mercado mayorista para generar confianza y transparencia.

---

## 20. Datos demostrativos

Incluye datos de prueba iniciales ricos y completos:

- **Al menos 6 puestos representativos de Unicachi:**
  1. *Distribuidora Don Lucho* - Especialista en papas y tubérculos (Pabellón A - Puesto 12).
  2. *Comercial Santa Rosa* - Cebollas, ajos y ajíes de Arequipa (Pabellón B - Puesto 05).
  3. *Verduras y Hortalizas El Huerto* - Tomates, lechugas y hortalizas frescas (Pabellón C - Puesto 18).
  4. *Frutas Doña Elena* - Cítricos, naranjas y limones de Chanchamayo (Pabellón D - Puesto 02).
  5. *Plátanos y Frutas Tropicales San Martín* - Plátanos por racimo y frutas de la selva (Pabellón D - Puesto 15).
  6. *Abarrotes y Granos El Mayorista* - Menestras y sacos de azúcar/arroz (Pabellón E - Puesto 08).
- **Al menos 18 productos mayoristas distribuidos entre estos puestos** con fotos ilustrativas, pesos promedios, precios referenciales y presentaciones por mayor.
- **Tarifas de flete preconfiguradas** para las zonas de Lurín y alrededores.
- **3 pedidos de ejemplo en distintos estados** para que el panel administrativo y la pantalla de seguimiento muestren información desde el primer momento.

---

## 21. Plan de implementación

Construye la aplicación de manera ordenada y completa:

1. **Configuración de base y diseño:** definición de tokens de color, tipografía, componentes base y barra de navegación superior e inferior móvil.
2. **Catálogo y puestos:** creación del directorio de puestos de Unicachi y catálogo de productos mayoristas con filtros y buscador.
3. **Flujo de compra:** carrito agrupado por puesto, selector interactivo entre los dos servicios de entrega (taxi vs. miniván) con simulador de tarifas.
4. **Solicitud personalizada:** formulario para pedidos libres y subida de listas escritas.
5. **Seguimiento y checkout:** pantalla de confirmación de pedido con generación de código de seguimiento e historial interactivo de estados.
6. **Panel administrativo:** dashboard completo con métricas, gestión de puestos, actualización rápida de precios mayoristas y control de pedidos.
7. **Pruebas y refinamiento:** verificación de responsividad móvil, estados vacíos, notificaciones toast y coherencia de datos demostrativos en Soles.

---

## 22. Entregable esperado

Una aplicación web completamente navegable, interactiva, atractiva visualmente y lista para su uso por parte de bodegueros de Lurín y el equipo de operaciones de Mercantista. Debe ser un producto que demuestre con claridad la viabilidad y el valor del negocio tanto a los clientes como a potenciales socios e inversionistas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fb703621-efba-4be1-b7b3-2dcd4212357b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
