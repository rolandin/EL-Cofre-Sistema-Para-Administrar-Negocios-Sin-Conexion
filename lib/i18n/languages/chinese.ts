export const zh = {
  // General
  dashboard: "仪表盘",
  inventory: "库存",
  receive: "接收",
  returns: "退货",
  services: "服务",
  contractors: "承包商",
  employees: "员工",
  payments: "付款",
  settings: "设置",
  logout: "退出登录",
  cancel: "取消",
  save: "保存",
  saving: "正在保存...",
  delete: "删除",
  edit: "编辑",
  create: "创建",
  search: "搜索",
  filter: "过滤",
  sortBy: "排序方式",
  actions: "操作",
  welcome: "欢迎回来！以下是您商店的概览。",
  error: "发生错误",
  success: "操作成功",
  started: "已开始",
  na: "不适用",
  total: "总计",
  // Schedule
  schedule: "日程安排",
  scheduleDescription: "管理预约和时间表",
  now: "现在",
  newAppointment: "新预约",
  editAppointment: "编辑预约",
  title: "标题",
  startTime: "开始时间",
  duration: "持续时间（分钟）",
  notes: "备注",
  createAppointment: "创建预约",
  updateAppointment: "更新预约",
  deleteAppointment: "删除预约",
  deleteAppointmentConfirm: "删除预约？",
  deleteAppointmentDescription: "您确定要删除此预约吗？此操作无法撤销。",
  appointmentCreated: "预约创建成功",
  appointmentUpdated: "预约更新成功",
  appointmentDeleted: "预约删除成功",
  noAppointments: "今天没有安排预约",
  // Auth
  signIn: "登录到",
  signingIn: "正在登录...",
  username: "用户名",
  password: "密码",
  confirmLogout: "确认退出登录",
  logoutMessage: "您确定要退出登录吗？您需要重新登录才能访问系统。",
  // Metrics
  inventoryValue: "库存价值",
  potentialValue: "潜在价值",
  totalSales: "总销售额",
  netProfit: "净利润",
  totalReturns: "总退货额",
  // Inventory
  currentInventory: "当前库存",
  name: "名称",
  sku: "SKU",
  quantity: "数量",
  value: "价值",
  lastUpdated: "最后更新",
  inStock: "有库存",
  outOfStock: "缺货",
  lowStock: "库存不足",
  selectProduct: "选择产品...",
  productDetails: "产品详情",
  inboundPrice: "进货价",
  outboundPrice: "出货价",
  supplier: "供应商",
  commission: "佣金",
  profitPerUnit: "每单位利润",
  profitMargin: "利润率",
  totalValue: "总价值",
  noProducts: "没有可用产品",
  searchProducts: "搜索产品...",
  selectProductToView: "选择一个产品以查看详细信息",
  priceValidation: "出货价必须高于进货价",
  saveChanges: "保存更改",
  discardChanges: "放弃更改",
  // Sort options
  sortByName: "名称",
  sortBySKU: "SKU",
  sortByQuantity: "数量",
  sortByLastUpdated: "最后更新",
  // Receive
  receiveInventory: "接收现有库存",
  pricePerUnit: "单价",
  priceInfo: "接收现有库存时，价格不可修改。",
  priceUpdateNote: "要更新产品价格，请使用库存选项卡。",
  receiveInventoryBtn: "接收库存",
  receiving: "正在接收...",
  invalidQuantity: "数量必须大于 0",
  noProductSelected: "请选择一个产品",
  receivedSuccess: "库存接收成功",
  noReceiveHistory: "没有接收历史",
  receiveHistory: "接收历史",
  newProduct: "新产品",
  // Sales
  createSale: "创建销售",
  creatingSale: "正在创建销售...",
  addProduct: "添加产品",
  addService: "添加服务",
  selectService: "选择服务...",
  selectContractor: "选择承包商（可选）...",
  exceedsStock: "数量超过可用库存 ({stock})",
  invalidSale: "请至少添加一个产品或服务",
  invalidProducts: "请为所有项目选择一个产品",
  invalidServices: "请为所有项目选择一个服务",
  saleCreated: "销售创建成功",
  product: "产品",
  service: "服务",
  salesHistory: "销售历史",
  date: "日期",
  item: "项目",
  type: "类型",
  noSales: "没有记录的销售",
  // Reports
  salesReport: "销售报告",
  generateReport: "生成指定日期范围内的销售报告",
  from: "从",
  to: "至",
  pickDate: "选择日期",
  exportReport: "导出报告",
  noDataToExport: "没有数据可导出",
  reportExported: "报告导出成功",
  recordsFound: "找到 {count} 条记录",
  noDataAvailable: "所选期间没有可用数据",
  totalProfit: "总利润",
  // Returns
  processReturn: "处理退货",
  returnHistory: "退货历史",
  returnAmount: "退货金额",
  originalPrice: "原价",
  perUnit: "每单位",
  maxReturnAmount: "退货金额不能超过原价",
  processReturnBtn: "处理退货",
  processing: "正在处理...",
  returnProcessed: "退货处理成功",
  noReturns: "没有记录的退货",
  // Services
  availableServices: "可用服务",
  serviceHistory: "服务历史",
  description: "描述",
  basePrice: "基础价格",
  newService: "新服务",
  serviceCreated: "服务创建成功",
  noServices: "没有可用服务",
  noServiceHistory: "没有可用历史",
  client: "客户",
  earnings: "收入",
  business: "业务",
  // Payments
  paymentHistory: "付款历史",
  employeePayments: "员工付款",
  contractorPayments: "承包商付款",
  newPayment: "新付款",
  processPayment: "处理付款",
  paymentAmount: "付款金额",
  paymentPeriod: "付款周期",
  periodStart: "周期开始",
  periodEnd: "周期结束",
  selectEmployee: "选择员工...",
  selectSales: "选择要支付的销售",
  selectAll: "全选",
  unselectAll: "取消全选",
  noUnpaidSales: "此承包商没有未付款的销售",
  paymentProcessed: "付款处理成功",
  noPayments: "没有记录的付款",
  // System Settings
  systemSettings: "系统设置",
  theme: "主题",
  light: "浅色",
  dark: "深色",
  system: "系统默认",
  language: "语言",
  spanish: "西班牙语",
  english: "英语",
  french: "法语",
  russian: "俄语",
  chinese: "中文",
  hindi: "印地语",
  bengali: "孟加拉语",
  arabic: "阿拉伯语",
  portuguese: "葡萄牙语",
  urdu: "乌尔都语",
  swahili: "斯瓦希里语",
  indonesian: "印尼语",
  persian: "波斯语",
  hausa: "豪萨语",
  punjabi: "旁遮普语",
  tamil: "泰米尔语",
  turkish: "土耳其语",
  yoruba: "约鲁巴语",
  igbo: "伊博语",
  amharic: "阿姆哈拉语",
  vietnamese: "越南语",
  thai: "泰语",
  malay: "马来语",
  somali: "索马里语",
  kurdish: "库尔德语",
  zulu: "祖鲁语",
  xhosa: "科萨语",
  sinhala: "僧伽罗语",
  nepali: "尼泊尔语",
  filipino: "菲律宾语",
  configureSystem: "配置系统偏好和备份",
  // User Management
  userManagement: "用户管理",
  role: "角色",
  lastLogin: "上次登录",
  status: "状态",
  active: "活跃",
  inactive: "不活跃",
  deleteUser: "删除用户",
  deleteUserConfirm: "您确定要删除此用户吗？此操作无法撤销。",
  userDeleted: "用户删除成功",
  noUsers: "没有可用用户",
  newUser: "新用户",
  // Descriptions
  inventoryDescription: "查看和管理产品库存",
  receiveDescription: "添加新产品或更新现有库存",
  returnsDescription: "处理和跟踪产品退货",
  servicesDescription: "管理服务并跟踪服务历史",
  contractorsDescription: "管理承包商及其收入",
  employeesDescription: "管理员工及其详细信息",
  settingsDescription: "管理系统设置和用户访问权限",
  processPayments: "处理和跟踪员工及承包商的付款",
  // Contractor Management
  manageContractors: "管理承包商及其位置费用",
  newContractor: "新承包商",
  locationFee: "位置费用",
  accumulatedEarnings: "累计收入",
  startDate: "开始日期",
  currentEarnings: "当前收入",
  allTimeEarnings: "总收入",
  servicesPerformed: "已完成服务",
  productsSold: "已售产品",
  serviceEarnings: "服务收入",
  productCommissions: "产品佣金",
  overview: "概览",
  contractorDetails: "承包商详细信息",
  deleteContractor: "删除承包商",
  deleteContractorConfirm: "您确定要删除此承包商吗？此操作无法撤销。",
  noContractors: "没有可用承包商",
  creating: "正在创建...",
  price: "价格",
  // Employee Management
  manageEmployees: "管理员工及其详细信息",
  newEmployee: "新员工",
  position: "职位",
  salary: "薪水",
  hireDate: "雇佣日期",
  employeeDetails: "员工详细信息",
  associatedContractor: "关联承包商",
  noEmployees: "没有可用员工",
  contractor: "承包商",
  // Setup
  createAccount: "创建账户",
  confirmPassword: "确认密码",
  passwordsDoNotMatch: "密码不匹配",
  loading: "加载中...",
  // User Management Settings
  employee: "员工",
  userSettings: "用户设置",
  userSettingsDescription: "管理用户设置",
  admin: "管理员",
  controller: "控制器",
  createUser: "创建用户",
  editUser: "编辑用户",
  deleteUserDescription: "此操作无法撤销。",
  userCreated: "用户创建成功",
  userUpdated: "用户更新成功",
  passwordRequirements: "密码必须至少包含 6 个字符",
  userExists: "已存在该用户名的用户",
  invalidUserData: "无效的用户数据",
};
