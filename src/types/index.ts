export interface App {
  id: string;
  name: string;
  bundle_id: string;
  description: string;
  icon_url: string;
  created_at: string;
}

export interface AppVersion {
  id: string;
  app_id: string;
  version: string;
  build_number: string;
  platform: 'ios' | 'android';
  download_url: string;
  changelog: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppWithVersions extends App {
  versions: AppVersion[];
}
