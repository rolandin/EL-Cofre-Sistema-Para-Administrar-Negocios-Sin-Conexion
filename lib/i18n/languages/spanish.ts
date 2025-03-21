export const es = {
  // General
  dashboard: "Panel de Control",
  inventory: "Inventario",
  receive: "Recibir",
  returns: "Devoluciones",
  services: "Servicios",
  contractors: "Contratistas",
  employees: "Empleados",
  payments: "Pagos",
  settings: "Configuración",
  logout: "Cerrar Sesión",
  cancel: "Cancelar",
  save: "Guardar",
  saving: "Guardando...",
  delete: "Eliminar",
  edit: "Editar",
  create: "Crear",
  search: "Buscar",
  filter: "Filtrar",
  sortBy: "Ordenar por",
  actions: "Acciones",
  welcome: "¡Bienvenido de nuevo! Aquí tienes un resumen de tu tienda.",
  error: "Ha ocurrido un error",
  success: "Operación exitosa",
  started: "Iniciado",
  na: "N/A",
  total: "Total",

  // Schedule
  schedule: "Agenda",
  scheduleDescription: "Gestionar citas y horarios",
  now: "Ahora",
  newAppointment: "Nueva Cita",
  editAppointment: "Editar Cita",
  title: "Título",
  startTime: "Hora de Inicio",
  duration: "Duración (minutos)",
  notes: "Notas",
  createAppointment: "Crear Cita",
  updateAppointment: "Actualizar Cita",
  deleteAppointment: "Eliminar Cita",
  deleteAppointmentConfirm: "¿Eliminar Cita?",
  deleteAppointmentDescription:
    "¿Estás seguro que deseas eliminar esta cita? Esta acción no se puede deshacer.",
  appointmentCreated: "Cita creada exitosamente",
  appointmentUpdated: "Cita actualizada exitosamente",
  appointmentDeleted: "Cita eliminada exitosamente",
  noAppointments: "No hay citas programadas para este día",

  // Auth
  signIn: "Iniciar Sesión en",
  signingIn: "Iniciando sesión...",
  username: "Usuario",
  password: "Contraseña",
  confirmLogout: "Confirmar Cierre de Sesión",
  logoutMessage:
    "¿Estás seguro que deseas cerrar sesión? Necesitarás iniciar sesión nuevamente para acceder al sistema.",

  // Metrics
  inventoryValue: "Valor del Inventario",
  potentialValue: "Valor Potencial",
  totalSales: "Ventas Totales",
  netProfit: "Beneficio Neto",
  totalReturns: "Devoluciones Totales",

  // Inventory
  currentInventory: "Inventario Actual",
  name: "Nombre",
  sku: "SKU",
  quantity: "Cantidad",
  value: "Valor",
  lastUpdated: "Última Actualización",
  inStock: "en existencia",
  outOfStock: "sin existencia",
  lowStock: "stock bajo",
  selectProduct: "Seleccionar producto...",
  productDetails: "Detalles del Producto",
  inboundPrice: "Precio de Entrada",
  outboundPrice: "Precio de Salida",
  supplier: "Proveedor",
  commission: "Comisión",
  profitPerUnit: "Beneficio por Unidad",
  profitMargin: "Margen de Beneficio",
  totalValue: "Valor Total",
  noProducts: "No hay productos disponibles",
  searchProducts: "Buscar productos...",
  selectProductToView: "Selecciona un producto para ver sus detalles",
  priceValidation:
    "El precio de salida debe ser mayor que el precio de entrada",
  saveChanges: "Guardar Cambios",
  discardChanges: "Descartar Cambios",

  // Sort options
  sortByName: "Nombre",
  sortBySKU: "SKU",
  sortByQuantity: "Cantidad",
  sortByLastUpdated: "Última Actualización",

  // Receive
  receiveInventory: "Recibir Inventario Existente",
  pricePerUnit: "Precio por Unidad",
  priceInfo: "El precio no se puede modificar al recibir inventario existente.",
  priceUpdateNote:
    "Para actualizar el precio de un producto, utilice la pestaña de Inventario.",
  receiveInventoryBtn: "Recibir Inventario",
  receiving: "Recibiendo...",
  invalidQuantity: "La cantidad debe ser mayor que 0",
  noProductSelected: "Seleccione un producto",
  receivedSuccess: "Inventario recibido exitosamente",
  noReceiveHistory: "No hay historial de recepción",
  receiveHistory: "Historial de Recepción",
  newProduct: "Nuevo Producto",

  // Sales
  createSale: "Crear Venta",
  creatingSale: "Creando Venta...",
  addProduct: "Agregar Producto",
  addService: "Agregar Servicio",
  selectService: "Seleccionar servicio...",
  selectContractor: "Seleccionar contratista (opcional)...",
  exceedsStock: "La cantidad excede el stock disponible ({stock})",
  invalidSale: "Por favor, agregue al menos un producto o servicio",
  invalidProducts: "Por favor, seleccione un producto para todos los elementos",
  invalidServices: "Por favor, seleccione un servicio para todos los elementos",
  saleCreated: "Venta creada exitosamente",
  product: "producto",
  service: "servicio",
  salesHistory: "Historial de Ventas",
  date: "Fecha",
  item: "Artículo",
  type: "Tipo",
  noSales: "No hay ventas registradas",

  // Reports
  salesReport: "Reporte de Ventas",
  generateReport:
    "Generar reporte de ventas para un rango de fechas específico",
  from: "Desde",
  to: "Hasta",
  pickDate: "Seleccionar fecha",
  exportReport: "Exportar Reporte",
  noDataToExport: "No hay datos para exportar",
  reportExported: "Reporte exportado exitosamente",
  recordsFound: "registros encontrados para el período seleccionado",
  noDataAvailable: "No hay datos disponibles para el período seleccionado",
  totalProfit: "Beneficio Total",

  // Returns
  processReturn: "Procesar Devolución",
  returnHistory: "Historial de Devoluciones",
  returnAmount: "Monto de Devolución",
  originalPrice: "Precio Original",
  perUnit: "por unidad",
  maxReturnAmount: "El monto de devolución no puede exceder el precio original",
  processReturnBtn: "Procesar Devolución",
  processing: "Procesando...",
  returnProcessed: "Devolución procesada exitosamente",
  noReturns: "No hay devoluciones registradas",

  // Services
  availableServices: "Servicios Disponibles",
  serviceHistory: "Historial de Servicios",
  description: "Descripción",
  basePrice: "Precio Base",
  newService: "Nuevo Servicio",
  serviceCreated: "Servicio creado exitosamente",
  serviceDeleted: "Servicio eliminado exitosamente",
  deleteService: "Eliminar Servicio",
  confirmDeleteService:
    "¿Está seguro de que desea eliminar este servicio? Esta acción no se puede deshacer.",
  serviceDeleteErrorWithHistory:
    "Este servicio ha sido utilizado en transacciones anteriores. Eliminarlo afectaría los registros históricos y los datos financieros.",
  noServices: "No hay servicios disponibles",
  noServiceHistory: "No hay historial disponible",
  client: "Cliente",
  earnings: "Ganancias",
  business: "Negocio",

  // Payments
  paymentHistory: "Historial de Pagos",
  employeePayments: "Pagos a Empleados",
  contractorPayments: "Pagos a Contratistas",
  newPayment: "Nuevo Pago",
  processPayment: "Procesar Pago",
  paymentAmount: "Monto del Pago",
  paymentPeriod: "Período de Pago",
  periodStart: "Inicio del Período",
  periodEnd: "Fin del Período",
  selectEmployee: "Seleccionar empleado...",
  selectSales: "Seleccionar ventas a pagar",
  selectAll: "Seleccionar Todo",
  unselectAll: "Deseleccionar Todo",
  noUnpaidSales: "No hay ventas sin pagar para este contratista",
  paymentProcessed: "Pago procesado exitosamente",
  noPayments: "No hay pagos registrados",

  // System Settings
  systemSettings: "Configuración del Sistema",
  theme: "Tema",
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
  language: "Idioma",
  spanish: "Español",
  english: "Inglés",
  french: "Francés",
  russian: "Ruso",
  chinese: "Chino",
  hindi: "Hindi",
  bengali: "Bengalí",
  arabic: "Árabe",
  portuguese: "Portugués",
  urdu: "Urdu",
  swahili: "Swahili",
  indonesian: "Indonesio",
  persian: "Persa",
  hausa: "Hausa",
  punjabi: "Panyabí",
  tamil: "Tamil",
  turkish: "Turco",
  yoruba: "Yoruba",
  igbo: "Igbo",
  amharic: "Amárico",
  vietnamese: "Vietnamita",
  thai: "Tailandés",
  malay: "Malayo",
  somali: "Somalí",
  kurdish: "Kurdo",
  zulu: "Zulú",
  xhosa: "Xhosa",
  sinhala: "Cingalés",
  nepali: "Nepalí",
  filipino: "Filipino",
  configureSystem: "Configurar preferencias del sistema y respaldos",

  // User Management
  userManagement: "Gestión de Usuarios",
  role: "Rol",
  lastLogin: "Último Acceso",
  status: "Estado",
  active: "Activo",
  inactive: "Inactivo",
  deleteUser: "Eliminar Usuario",
  deleteUserConfirm:
    "¿Estás seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.",
  userDeleted: "Usuario eliminado exitosamente",
  noUsers: "No hay usuarios disponibles",
  newUser: "Nuevo Usuario",

  // Descriptions
  inventoryDescription: "Ver y gestionar el inventario de productos",
  receiveDescription: "Agregar nuevos productos o actualizar existencias",
  returnsDescription:
    "Procesar y dar seguimiento a las devoluciones de productos",
  servicesDescription: "Gestionar servicios y dar seguimiento al historial",
  contractorsDescription: "Gestionar contratistas y sus ganancias",
  employeesDescription: "Gestionar empleados y sus detalles",
  settingsDescription:
    "Gestionar configuración del sistema y acceso de usuarios",
  processPayments:
    "Procesar y dar seguimiento a pagos de empleados y contratistas",
  employeeNotFound: "Empleado no encontrado",
  editEmployee: "Editar Empleado",
  cannotDeactivateWithPendingPayments:
    "No se puede desactivar el empleado con pagos pendientes",
  cannotDeactivateWithUpcomingAppointments:
    "No se puede desactivar el empleado con citas próximas",

  // Contractor Management
  manageContractors: "Gestionar contratistas y sus tarifas de ubicación",
  newContractor: "Nuevo Contratista",
  locationFee: "Tarifa de Ubicación",
  accumulatedEarnings: "Ganancias Acumuladas",
  startDate: "Fecha de Inicio",
  currentEarnings: "Ganancias Actuales",
  allTimeEarnings: "Ganancias Totales",
  servicesPerformed: "Servicios Realizados",
  productsSold: "Productos Vendidos",
  serviceEarnings: "Ganancias por Servicios",
  productCommissions: "Comisiones por Productos",
  overview: "Resumen",
  contractorDetails: "Detalles del Contratista",
  deleteContractor: "Eliminar Contratista",
  deleteContractorConfirm:
    "¿Estás seguro que deseas eliminar este contratista? Esta acción no se puede deshacer.",
  noContractors: "No hay contratistas disponibles",
  creating: "Creando...",
  price: "Precio",
  contractorDeleteErrorWithServiceHistory:
    "Este contratista ha realizado servicios en el pasado. Eliminarlo afectaría los registros históricos y los datos financieros.",
  contractorDeleteErrorWithSalesHistory:
    "Este contratista tiene historial de ventas. Eliminarlo afectaría los registros históricos y los datos financieros.",
  contractorDeleteErrorWithUnpaidEarnings:
    "Este contratista tiene ganancias no pagadas. Por favor, procese sus pagos pendientes antes de eliminarlo.",

  // Employee Management
  manageEmployees: "Gestionar empleados y sus detalles",
  newEmployee: "Nuevo Empleado",
  position: "Cargo",
  salary: "Salario",
  hireDate: "Fecha de Contratación",
  employeeDetails: "Detalles del Empleado",
  associatedContractor: "Contratista Asociado",
  noEmployees: "No hay empleados disponibles",
  contractor: "Contratista",

  // Setup
  createAccount: "Crear Cuenta",
  confirmPassword: "Confirmar Contraseña",
  passwordsDoNotMatch: "Las contraseñas no coinciden",
  loading: "Cargando...",

  // User Management Settings
  employee: "Empleado",
  userSettings: "Ajustes de Usuario",
  userSettingsDescription: "Gestiona los ajustes de los usuarios",
  admin: "Administrador",
  controller: "Operador",
  createUser: "Crear Usuario",
  editUser: "Editar Usuario",
  deleteUserDescription: "Esta acción no se puede deshacer.",
  userCreated: "Usuario creado exitosamente",
  userUpdated: "Usuario actualizado exitosamente",
  passwordRequirements: "La contraseña debe tener al menos 6 caracteres",
  userExists: "Ya existe un usuario con este nombre",
  invalidUserData: "Datos de usuario inválidos",
  inactiveUserError:
    "Tu cuenta está actualmente inactiva. Por favor, contacta a un administrador.",

  // New key
  selectRole: "Seleccionar rol",

  // New key
  deleteEmployee: "Eliminar Empleado",
  deleteEmployeeConfirm:
    "¿Estás seguro que deseas eliminar este empleado? Esta acción no se puede deshacer.",
};
