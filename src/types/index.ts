export type AppCategory =
  | 'Transportation'
  | 'Business'
  | 'Education'
  | 'Entertainment'
  | 'Games'
  | 'Travel'
  | 'Productivity'
  | 'Social'
  | 'Other';

export interface AppPermission {
  id: string;
  name: string;
  description: string;
  category: 'Network' | 'Device' | 'Privacy' | 'Storage' | 'Media';
}

export interface AppItem {
  id: string;
  name: string;
  slug: string;
  developer_name: string;
  package_name: string;
  description: string;
  whats_new?: string;
  category: AppCategory;
  version_name: string;
  version_code: number;
  minimum_android_version: string;
  apk_storage_path: string;
  apk_url?: string;
  icon_storage_path?: string;
  icon_url: string;
  apk_size: string; // e.g. "24.8 MB"
  download_count: number;
  rating: number; // e.g. 4.8
  review_count: number;
  is_published: boolean;
  is_featured: boolean;
  login_required: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
  screenshots?: string[];
}

export interface AppScreenshot {
  id: string;
  app_id: string;
  storage_path: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface AppReview {
  id: string;
  app_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number; // 1 - 5
  comment: string;
  created_at: string;
}

export interface AppDownload {
  id: string;
  app_id: string;
  user_id?: string;
  version_name: string;
  ip_address?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface StorageBucketInfo {
  name: string;
  id: string;
  public: boolean;
  fileCount: number;
  description: string;
}

export interface AdminStats {
  totalApps: number;
  publishedApps: number;
  totalDownloads: number;
  totalUsers: number;
  appsAddedThisMonth: number;
}
