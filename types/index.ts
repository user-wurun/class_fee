export interface User {
  id: number;
  username: string;
  real_name: string;
  email?: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface RegistrationCode {
  id: number;
  code: string;
  is_used: boolean;
  used_by?: number;
  used_at?: string;
  created_by: number;
  created_at: string;
  expires_at?: string;
}

export interface Application {
  id: number;
  title: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  applicant_id: number;
  category_id?: number;
  expense_time?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejection_reason?: string;
  cancellation_reason?: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  // JOIN字段
  applicant_username?: string;
  applicant_name?: string;
  category_name?: string;
  approved_by_name?: string;
  proof_count?: number;
  // 收入记录字段
  source?: string;
  income_reason?: string;
  // 支出记录字段
  expense_applicant_name?: string;
  expense_reason?: string;
  expense_record_time?: string;
  // 通用reason字段（兼容性）
  reason?: string;
  // 关联对象
  applicant?: User;
  category?: Category;
  approved_by_user?: User;
  proof_images?: ProofImage[];
  income_record?: IncomeRecord;
  expense_record?: ExpenseRecord;
}

export interface ProofImage {
  id: number;
  application_id: number;
  image_url: string;
  image_name: string;
  file_size: number;
  created_at: string;
}

export interface IncomeRecord {
  id: number;
  application_id: number;
  source: string;
  reason: string;
  created_at: string;
}

export interface ExpenseRecord {
  id: number;
  application_id: number;
  applicant_name: string;
  reason: string;
  expense_time: string;
  created_at: string;
}

export interface OperationLog {
  id: number;
  user_id: number;
  action: string;
  target_type: string;
  target_id: number;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
}

export interface CreateApplicationData {
  title: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category_id?: number;
  expense_time?: string;
  source?: string;
  reason?: string;
  proof_images?: File[];
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejection_reason?: string;
  cancellation_reason?: string;
}

export interface AuthUser {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FilterParams {
  type?: 'all' | 'income' | 'expense';
  category_id?: number;
  categoryId?: number; // 别名，兼容前端代码
  applicant_id?: number;
  applicantId?: number; // 别名，兼容前端代码
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface Statistics {
  total_balance: number;
  total_income: number;
  total_expense: number;
  total_transactions: number;
  category_stats: CategoryStat[];
}

export interface CategoryStat {
  category_id: number;
  category_name: string;
  total_amount: number;
  count: number;
  percentage: number;
}

export interface ExportOptions {
  format: 'xlsx' | 'png';
  filters?: FilterParams;
  include_qr: boolean;
}