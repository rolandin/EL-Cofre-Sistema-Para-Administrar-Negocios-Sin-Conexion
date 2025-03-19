import { es as esTranslations } from "./languages/spanish";
import { en as enTranslations } from "./languages/english";
import { zh as zhTranslations } from "./languages/chinese";

export const translations = {
  es: { ...esTranslations },
  en: { ...enTranslations },
  ru: {
    // General
    dashboard: "Панель управления",
    inventory: "Инвентарь",
    receive: "Получить",
    returns: "Возвраты",
    services: "Услуги",
    contractors: "Подрядчики",
    employees: "Сотрудники",
    payments: "Платежи",
    settings: "Настройки",
    logout: "Выйти",
    cancel: "Отмена",
    save: "Сохранить",
    saving: "Сохранение...",
    delete: "Удалить",
    edit: "Редактировать",
    create: "Создать",
    search: "Поиск",
    filter: "Фильтр",
    sortBy: "Сортировать по",
    actions: "Действия",
    welcome: "С возвращением! Вот краткий обзор вашего магазина.",
    error: "Произошла ошибка",
    success: "Операция выполнена успешно",
    started: "Начато",
    na: "Н/Д",
    total: "Итого",
    // Schedule
    schedule: "Расписание",
    scheduleDescription: "Управление встречами и расписанием",
    now: "Сейчас",
    newAppointment: "Новая встреча",
    editAppointment: "Редактировать встречу",
    title: "Название",
    startTime: "Время начала",
    duration: "Продолжительность (минуты)",
    notes: "Заметки",
    createAppointment: "Создать встречу",
    updateAppointment: "Обновить встречу",
    deleteAppointment: "Удалить встречу",
    deleteAppointmentConfirm: "Удалить встречу?",
    deleteAppointmentDescription:
      "Вы уверены, что хотите удалить эту встречу? Это действие нельзя отменить.",
    appointmentCreated: "Встреча успешно создана",
    appointmentUpdated: "Встреча успешно обновлена",
    appointmentDeleted: "Встреча успешно удалена",
    noAppointments: "На этот день нет запланированных встреч",
    // Auth
    signIn: "Войти в",
    signingIn: "Вход...",
    username: "Имя пользователя",
    password: "Пароль",
    confirmLogout: "Подтвердите выход",
    logoutMessage:
      "Вы уверены, что хотите выйти? Вам нужно будет снова войти в систему для доступа.",
    // Metrics
    inventoryValue: "Стоимость инвентаря",
    potentialValue: "Потенциальная стоимость",
    totalSales: "Общие продажи",
    netProfit: "Чистая прибыль",
    totalReturns: "Общие возвраты",
    // Inventory
    currentInventory: "Текущий инвентарь",
    name: "Название",
    sku: "Артикул",
    quantity: "Количество",
    value: "Стоимость",
    lastUpdated: "Последнее обновление",
    inStock: "в наличии",
    outOfStock: "нет в наличии",
    lowStock: "низкий запас",
    selectProduct: "Выберите продукт...",
    productDetails: "Детали продукта",
    inboundPrice: "Цена входа",
    outboundPrice: "Цена выхода",
    supplier: "Поставщик",
    commission: "Комиссия",
    profitPerUnit: "Прибыль за единицу",
    profitMargin: "Маржа прибыли",
    totalValue: "Общая стоимость",
    noProducts: "Нет доступных продуктов",
    searchProducts: "Поиск продуктов...",
    selectProductToView: "Выберите продукт для просмотра деталей",
    priceValidation: "Цена выхода должна быть выше цены входа",
    saveChanges: "Сохранить изменения",
    discardChanges: "Отменить изменения",
    // Sort options
    sortByName: "Название",
    sortBySKU: "Артикул",
    sortByQuantity: "Количество",
    sortByLastUpdated: "Последнее обновление",
    // Receive
    receiveInventory: "Получить существующий инвентарь",
    pricePerUnit: "Цена за единицу",
    priceInfo: "Цену нельзя изменить при получении существующего инвентаря.",
    priceUpdateNote:
      "Чтобы обновить цену продукта, используйте вкладку 'Инвентарь'.",
    receiveInventoryBtn: "Получить инвентарь",
    receiving: "Получение...",
    invalidQuantity: "Количество должно быть больше 0",
    noProductSelected: "Выберите продукт",
    receivedSuccess: "Инвентарь успешно получен",
    noReceiveHistory: "Нет истории получения",
    receiveHistory: "История получения",
    newProduct: "Новый продукт",
    // Sales
    createSale: "Создать продажу",
    creatingSale: "Создание продажи...",
    addProduct: "Добавить продукт",
    addService: "Добавить услугу",
    selectService: "Выберите услугу...",
    selectContractor: "Выберите подрядчика (опционально)...",
    exceedsStock: "Количество превышает доступный запас ({stock})",
    invalidSale: "Пожалуйста, добавьте хотя бы один продукт или услугу",
    invalidProducts: "Пожалуйста, выберите продукт для всех элементов",
    invalidServices: "Пожалуйста, выберите услугу для всех элементов",
    saleCreated: "Продажа успешно создана",
    product: "продукт",
    service: "услуга",
    salesHistory: "История продаж",
    date: "Дата",
    item: "Товар",
    type: "Тип",
    noSales: "Нет зарегистрированных продаж",
    // Reports
    salesReport: "Отчет о продажах",
    generateReport: "Создать отчет о продажах за определенный период",
    from: "С",
    to: "По",
    pickDate: "Выбрать дату",
    exportReport: "Экспорт отчета",
    noDataToExport: "Нет данных для экспорта",
    reportExported: "Отчет успешно экспортирован",
    recordsFound: "записей найдено за выбранный период",
    noDataAvailable: "Нет данных за выбранный период",
    totalProfit: "Общая прибыль",
    // Returns
    processReturn: "Обработать возврат",
    returnHistory: "История возвратов",
    returnAmount: "Сумма возврата",
    originalPrice: "Оригинальная цена",
    perUnit: "за единицу",
    maxReturnAmount: "Сумма возврата не может превышать оригинальную цену",
    processReturnBtn: "Обработать возврат",
    processing: "Обработка...",
    returnProcessed: "Возврат успешно обработан",
    noReturns: "Нет зарегистрированных возвратов",
    // Services
    availableServices: "Доступные услуги",
    serviceHistory: "История услуг",
    description: "Описание",
    basePrice: "Базовая цена",
    newService: "Новая услуга",
    serviceCreated: "Услуга успешно создана",
    noServices: "Нет доступных услуг",
    noServiceHistory: "Нет доступной истории",
    client: "Клиент",
    earnings: "Заработок",
    business: "Бизнес",
    // Payments
    paymentHistory: "История платежей",
    employeePayments: "Платежи сотрудникам",
    contractorPayments: "Платежи подрядчикам",
    newPayment: "Новый платеж",
    processPayment: "Обработать платеж",
    paymentAmount: "Сумма платежа",
    paymentPeriod: "Период платежа",
    periodStart: "Начало периода",
    periodEnd: "Конец периода",
    selectEmployee: "Выберите сотрудника...",
    selectSales: "Выберите продажи для оплаты",
    selectAll: "Выбрать все",
    unselectAll: "Отменить выбор всех",
    noUnpaidSales: "Нет неоплаченных продаж для этого подрядчика",
    paymentProcessed: "Платеж успешно обработан",
    noPayments: "Нет зарегистрированных платежей",
    // System Settings
    systemSettings: "Настройки системы",
    theme: "Тема",
    light: "Светлая",
    dark: "Темная",
    system: "Системная",
    language: "Язык",
    spanish: "Испанский",
    english: "Английский",
    french: "Французский",
    russian: "Русский",
    chinese: "Китайский",
    hindi: "Хинди",
    bengali: "Бенгальский",
    arabic: "Арабский",
    portuguese: "Португальский",
    urdu: "Урду",
    swahili: "Суахили",
    indonesian: "Индонезийский",
    persian: "Персидский",
    hausa: "Хауса",
    punjabi: "Панджаби",
    tamil: "Тамильский",
    turkish: "Турецкий",
    yoruba: "Йоруба",
    igbo: "Игбо",
    amharic: "Амхарский",
    vietnamese: "Вьетнамский",
    thai: "Тайский",
    malay: "Малайский",
    somali: "Сомалийский",
    kurdish: "Курдский",
    zulu: "Зулусский",
    xhosa: "Коса",
    sinhala: "Сингальский",
    nepali: "Непальский",
    filipino: "Филиппинский",
    configureSystem: "Настройка предпочтений системы и резервного копирования",
    // User Management
    userManagement: "Управление пользователями",
    role: "Роль",
    lastLogin: "Последний вход",
    status: "Статус",
    active: "Активен",
    inactive: "Неактивен",
    deleteUser: "Удалить пользователя",
    deleteUserConfirm:
      "Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.",
    userDeleted: "Пользователь успешно удален",
    noUsers: "Нет доступных пользователей",
    newUser: "Новый пользователь",
    // Descriptions
    inventoryDescription: "Просмотр и управление инвентарем продуктов",
    receiveDescription: "Добавление новых продуктов или обновление запасов",
    returnsDescription: "Обработка и отслеживание возвратов продуктов",
    servicesDescription: "Управление услугами и отслеживание истории",
    contractorsDescription: "Управление подрядчиками и их доходами",
    employeesDescription: "Управление сотрудниками и их данными",
    settingsDescription:
      "Управление настройками системы и доступом пользователей",
    processPayments:
      "Обработка и отслеживание платежей сотрудникам и подрядчикам",
    // Contractor Management
    manageContractors: "Управление подрядчиками и их тарифами на размещение",
    newContractor: "Новый подрядчик",
    locationFee: "Тариф на размещение",
    accumulatedEarnings: "Накопленные доходы",
    startDate: "Дата начала",
    currentEarnings: "Текущие доходы",
    allTimeEarnings: "Общие доходы",
    servicesPerformed: "Выполненные услуги",
    productsSold: "Проданные продукты",
    serviceEarnings: "Доходы от услуг",
    productCommissions: "Комиссии за продукты",
    overview: "Обзор",
    contractorDetails: "Детали подрядчика",
    deleteContractor: "Удалить подрядчика",
    deleteContractorConfirm:
      "Вы уверены, что хотите удалить этого подрядчика? Это действие нельзя отменить.",
    noContractors: "Нет доступных подрядчиков",
    creating: "Создание...",
    price: "Цена",
    // Employee Management
    manageEmployees: "Управление сотрудниками и их данными",
    newEmployee: "Новый сотрудник",
    position: "Должность",
    salary: "Зарплата",
    hireDate: "Дата найма",
    employeeDetails: "Детали сотрудника",
    associatedContractor: "Связанный подрядчик",
    noEmployees: "Нет доступных сотрудников",
    contractor: "Подрядчик",
    // Setup
    createAccount: "Создать учетную запись",
    confirmPassword: "Подтвердить пароль",
    passwordsDoNotMatch: "Пароли не совпадают",
    loading: "Загрузка...",
    // User Management Settings
    employee: "сотрудник",
    userSettings: "Настройки пользователя",
    userSettingsDescription: "Управление настройками пользователей",
    admin: "Администратор",
    controller: "Контролер",
    createUser: "Создать пользователя",
    editUser: "Редактировать пользователя",
    deleteUserDescription: "Это действие нельзя отменить.",
    userCreated: "Пользователь успешно создан",
    userUpdated: "Пользователь успешно обновлен",
    passwordRequirements: "Пароль должен содержать не менее 6 символов",
    userExists: "Пользователь с таким именем уже существует",
    invalidUserData: "Неверные данные пользователя",
  },
  fr: {
    // General
    dashboard: "Tableau de bord",
    inventory: "Inventaire",
    receive: "Recevoir",
    returns: "Retours",
    services: "Services",
    contractors: "Contractants",
    employees: "Employés",
    payments: "Paiements",
    settings: "Paramètres",
    logout: "Déconnexion",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement en cours...",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    search: "Rechercher",
    filter: "Filtrer",
    sortBy: "Trier par",
    actions: "Actions",
    welcome: "Bienvenue ! Voici un résumé de votre magasin.",
    error: "Une erreur est survenue",
    success: "Opération réussie",
    started: "Démarré",
    na: "N/A",
    total: "Total",
    // Schedule
    schedule: "Agenda",
    scheduleDescription: "Gérer les rendez-vous et l'horaire",
    now: "Maintenant",
    newAppointment: "Nouveau rendez-vous",
    editAppointment: "Modifier le rendez-vous",
    title: "Titre",
    startTime: "Heure de début",
    duration: "Durée (minutes)",
    notes: "Notes",
    createAppointment: "Créer un rendez-vous",
    updateAppointment: "Mettre à jour le rendez-vous",
    deleteAppointment: "Supprimer le rendez-vous",
    deleteAppointmentConfirm: "Supprimer le rendez-vous ?",
    deleteAppointmentDescription:
      "Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.",
    appointmentCreated: "Rendez-vous créé avec succès",
    appointmentUpdated: "Rendez-vous mis à jour avec succès",
    appointmentDeleted: "Rendez-vous supprimé avec succès",
    noAppointments: "Aucun rendez-vous prévu pour ce jour",
    // Auth
    signIn: "Se connecter à",
    signingIn: "Connexion en cours...",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    confirmLogout: "Confirmer la déconnexion",
    logoutMessage:
      "Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder au système.",
    // Metrics
    inventoryValue: "Valeur de l'inventaire",
    potentialValue: "Valeur potentielle",
    totalSales: "Ventes totales",
    netProfit: "Bénéfice net",
    totalReturns: "Retours totaux",
    // Inventory
    currentInventory: "Inventaire actuel",
    name: "Nom",
    sku: "SKU",
    quantity: "Quantité",
    value: "Valeur",
    lastUpdated: "Dernière mise à jour",
    inStock: "en stock",
    outOfStock: "rupture de stock",
    lowStock: "stock faible",
    selectProduct: "Sélectionner un produit...",
    productDetails: "Détails du produit",
    inboundPrice: "Prix d'achat",
    outboundPrice: "Prix de vente",
    supplier: "Fournisseur",
    commission: "Commission",
    profitPerUnit: "Bénéfice par unité",
    profitMargin: "Marge bénéficiaire",
    totalValue: "Valeur totale",
    noProducts: "Aucun produit disponible",
    searchProducts: "Rechercher des produits...",
    selectProductToView: "Sélectionnez un produit pour afficher ses détails",
    priceValidation: "Le prix de vente doit être supérieur au prix d'achat",
    saveChanges: "Enregistrer les modifications",
    discardChanges: "Annuler les modifications",
    // Sort options
    sortByName: "Nom",
    sortBySKU: "SKU",
    sortByQuantity: "Quantité",
    sortByLastUpdated: "Dernière mise à jour",
    // Receive
    receiveInventory: "Recevoir l'inventaire existant",
    pricePerUnit: "Prix par unité",
    priceInfo:
      "Le prix ne peut pas être modifié lors de la réception de l'inventaire existant.",
    priceUpdateNote:
      "Pour mettre à jour le prix d'un produit, utilisez l'onglet Inventaire.",
    receiveInventoryBtn: "Recevoir l'inventaire",
    receiving: "Réception en cours...",
    invalidQuantity: "La quantité doit être supérieure à 0",
    noProductSelected: "Sélectionnez un produit",
    receivedSuccess: "Inventaire reçu avec succès",
    noReceiveHistory: "Aucun historique de réception",
    receiveHistory: "Historique de réception",
    newProduct: "Nouveau produit",
    // Sales
    createSale: "Créer une vente",
    creatingSale: "Création de la vente...",
    addProduct: "Ajouter un produit",
    addService: "Ajouter un service",
    selectService: "Sélectionner un service...",
    selectContractor: "Sélectionner un contractant (facultatif)...",
    exceedsStock: "La quantité dépasse le stock disponible ({stock})",
    invalidSale: "Veuillez ajouter au moins un produit ou service",
    invalidProducts: "Veuillez sélectionner un produit pour tous les éléments",
    invalidServices: "Veuillez sélectionner un service pour tous les éléments",
    saleCreated: "Vente créée avec succès",
    product: "produit",
    service: "service",
    salesHistory: "Historique des ventes",
    date: "Date",
    item: "Article",
    type: "Type",
    noSales: "Aucune vente enregistrée",
    // Reports
    salesReport: "Rapport de ventes",
    generateReport: "Générer un rapport de ventes pour une période spécifique",
    from: "Du",
    to: "Au",
    pickDate: "Sélectionner une date",
    exportReport: "Exporter le rapport",
    noDataToExport: "Aucune donnée à exporter",
    reportExported: "Rapport exporté avec succès",
    recordsFound: "enregistrements trouvés pour la période sélectionnée",
    noDataAvailable: "Aucune donnée disponible pour la période sélectionnée",
    totalProfit: "Bénéfice total",
    // Returns
    processReturn: "Traiter le retour",
    returnHistory: "Historique des retours",
    returnAmount: "Montant du retour",
    originalPrice: "Prix d'origine",
    perUnit: "par unité",
    maxReturnAmount:
      "Le montant du retour ne peut pas dépasser le prix d'origine",
    processReturnBtn: "Traiter le retour",
    processing: "Traitement en cours...",
    returnProcessed: "Retour traité avec succès",
    noReturns: "Aucun retour enregistré",
    // Services
    availableServices: "Services disponibles",
    serviceHistory: "Historique des services",
    description: "Description",
    basePrice: "Prix de base",
    newService: "Nouveau service",
    serviceCreated: "Service créé avec succès",
    noServices: "Aucun service disponible",
    noServiceHistory: "Aucun historique disponible",
    client: "Client",
    earnings: "Revenus",
    business: "Entreprise",
    // Payments
    paymentHistory: "Historique des paiements",
    employeePayments: "Paiements aux employés",
    contractorPayments: "Paiements aux contractants",
    newPayment: "Nouveau paiement",
    processPayment: "Traiter le paiement",
    paymentAmount: "Montant du paiement",
    paymentPeriod: "Période de paiement",
    periodStart: "Début de la période",
    periodEnd: "Fin de la période",
    selectEmployee: "Sélectionner un employé...",
    selectSales: "Sélectionner les ventes à payer",
    selectAll: "Tout sélectionner",
    unselectAll: "Tout désélectionner",
    noUnpaidSales: "Aucune vente impayée pour ce contractant",
    paymentProcessed: "Paiement traité avec succès",
    noPayments: "Aucun paiement enregistré",
    // System Settings
    systemSettings: "Paramètres du système",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    system: "Système",
    language: "Langue",
    spanish: "Espagnol",
    english: "Anglais",
    french: "Français",
    russian: "Russe",
    chinese: "Chinois",
    hindi: "Hindi",
    bengali: "Bengali",
    arabic: "Arabe",
    portuguese: "Portugais",
    urdu: "Ourdou",
    swahili: "Swahili",
    indonesian: "Indonésien",
    persian: "Persan",
    hausa: "Haoussa",
    punjabi: "Pendjabi",
    tamil: "Tamoul",
    turkish: "Turc",
    yoruba: "Yoruba",
    igbo: "Igbo",
    amharic: "Amharique",
    vietnamese: "Vietnamien",
    thai: "Thaï",
    malay: "Malais",
    somali: "Somali",
    kurdish: "Kurde",
    zulu: "Zulu",
    xhosa: "Xhosa",
    sinhala: "Cinghalais",
    nepali: "Népalais",
    filipino: "Philippin",
    configureSystem: "Configurer les préférences du système et les sauvegardes",
    // User Management
    userManagement: "Gestion des utilisateurs",
    role: "Rôle",
    lastLogin: "Dernière connexion",
    status: "Statut",
    active: "Actif",
    inactive: "Inactif",
    deleteUser: "Supprimer l'utilisateur",
    deleteUserConfirm:
      "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.",
    userDeleted: "Utilisateur supprimé avec succès",
    noUsers: "Aucun utilisateur disponible",
    newUser: "Nouvel utilisateur",
    // Descriptions
    inventoryDescription: "Afficher et gérer l'inventaire des produits",
    receiveDescription:
      "Ajouter de nouveaux produits ou mettre à jour les stocks",
    returnsDescription: "Traiter et suivre les retours de produits",
    servicesDescription: "Gérer les services et suivre l'historique",
    contractorsDescription: "Gérer les contractants et leurs revenus",
    employeesDescription: "Gérer les employés et leurs détails",
    settingsDescription:
      "Gérer les paramètres du système et l'accès des utilisateurs",
    processPayments:
      "Traiter et suivre les paiements des employés et des contractants",
    // Contractor Management
    manageContractors: "Gérer les contractants et leurs tarifs d'emplacement",
    newContractor: "Nouveau contractant",
    locationFee: "Tarif d'emplacement",
    accumulatedEarnings: "Revenus accumulés",
    startDate: "Date de début",
    currentEarnings: "Revenus actuels",
    allTimeEarnings: "Revenus totaux",
    servicesPerformed: "Services effectués",
    productsSold: "Produits vendus",
    serviceEarnings: "Revenus des services",
    productCommissions: "Commissions sur les produits",
    overview: "Aperçu",
    contractorDetails: "Détails du contractant",
    deleteContractor: "Supprimer le contractant",
    deleteContractorConfirm:
      "Êtes-vous sûr de vouloir supprimer ce contractant ? Cette action est irréversible.",
    noContractors: "Aucun contractant disponible",
    creating: "Création en cours...",
    price: "Prix",
    // Employee Management
    manageEmployees: "Gérer les employés et leurs détails",
    newEmployee: "Nouvel employé",
    position: "Poste",
    salary: "Salaire",
    hireDate: "Date d'embauche",
    employeeDetails: "Détails de l'employé",
    associatedContractor: "Contractant associé",
    noEmployees: "Aucun employé disponible",
    contractor: "Contractant",
    // Setup
    createAccount: "Créer un compte",
    confirmPassword: "Confirmer le mot de passe",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
    loading: "Chargement en cours...",
    // User Management Settings
    employee: "employé",
    userSettings: "Paramètres utilisateur",
    userSettingsDescription: "Gérer les paramètres des utilisateurs",
    admin: "Administrateur",
    controller: "Contrôleur",
    createUser: "Créer un utilisateur",
    editUser: "Modifier l'utilisateur",
    deleteUserDescription: "Cette action ne peut pas être annulée.",
    userCreated: "Utilisateur créé avec succès",
    userUpdated: "Utilisateur mis à jour avec succès",
    passwordRequirements: "Le mot de passe doit contenir au moins 6 caractères",
    userExists: "Un utilisateur avec ce nom existe déjà",
    invalidUserData: "Données utilisateur invalides",
  },
  zh: { ...zhTranslations },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
