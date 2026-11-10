import { getSupabaseClient } from '../lib/supabase';
import { WHATSAPP_BUSINESS_NUMBER } from '../lib/config';

export type HeroImageType = 'logo' | 'product' | 'custom';

export const DEFAULT_COMPANY_LOGO = '/assets/aistudio/AV_Creations_Logo_with_3D_Printer_Icon_29dbcfaa.png';

export interface StoreSettings {
  whatsapp_enabled: boolean;
  whatsapp_number: string;
  hero_image_type: HeroImageType;
  hero_product_id: string;
  hero_custom_image_url: string;
  company_logo_url: string;
}

const LOCAL_STORAGE_KEY = 'av_store_settings';
export const SETTINGS_CHANGE_EVENT = 'av_store_settings_updated';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  whatsapp_enabled: true,
  whatsapp_number: WHATSAPP_BUSINESS_NUMBER || '919876543210',
  hero_image_type: 'logo', // By default keep Company logo here
  hero_product_id: '',
  hero_custom_image_url: '',
  company_logo_url: DEFAULT_COMPANY_LOGO,
};

/**
 * Clean phone number into international digits only (e.g. 919876543210)
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

/**
 * Resolve logo URL with automatic upgrade from older default logos
 */
export function resolveCompanyLogo(storedUrl?: string): string {
  if (!storedUrl || storedUrl.includes('Geometric_3D_Printer_A_V_Logo') || storedUrl.includes('Glossy_AV_Creations_Mascot_Emblem')) {
    return DEFAULT_COMPANY_LOGO;
  }
  return storedUrl;
}

/**
 * Synchronous read from localStorage with fallback to default config
 */
export function getStoredWhatsAppSettings(): StoreSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_STORE_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        whatsapp_enabled: typeof parsed.whatsapp_enabled === 'boolean' ? parsed.whatsapp_enabled : DEFAULT_STORE_SETTINGS.whatsapp_enabled,
        whatsapp_number: sanitizePhoneNumber(parsed.whatsapp_number || DEFAULT_STORE_SETTINGS.whatsapp_number),
        hero_image_type: (['logo', 'product', 'custom'].includes(parsed.hero_image_type) ? parsed.hero_image_type : 'logo') as HeroImageType,
        hero_product_id: parsed.hero_product_id || '',
        hero_custom_image_url: parsed.hero_custom_image_url || '',
        company_logo_url: resolveCompanyLogo(parsed.company_logo_url),
      };
    }
  } catch (err) {
    console.warn('Failed to parse store settings from localStorage:', err);
  }

  return DEFAULT_STORE_SETTINGS;
}

/**
 * Fetch store settings from Supabase with localStorage and fallback support
 */
export async function fetchStoreSettings(): Promise<StoreSettings> {
  const localSettings = getStoredWhatsAppSettings();
  const client = getSupabaseClient();

  if (!client) {
    return localSettings;
  }

  try {
    const { data, error } = await client
      .from('store_settings')
      .select('key, value');

    if (error || !data || data.length === 0) {
      return localSettings;
    }

    const remoteSettings: StoreSettings = { ...localSettings };

    data.forEach((row: { key: string; value: any }) => {
      if (row.key === 'whatsapp_enabled') {
        remoteSettings.whatsapp_enabled = Boolean(row.value);
      } else if (row.key === 'whatsapp_number') {
        const numStr = typeof row.value === 'string' ? row.value : String(row.value);
        remoteSettings.whatsapp_number = sanitizePhoneNumber(numStr);
      } else if (row.key === 'hero_image_type') {
        const typeStr = typeof row.value === 'string' ? row.value : String(row.value);
        if (['logo', 'product', 'custom'].includes(typeStr)) {
          remoteSettings.hero_image_type = typeStr as HeroImageType;
        }
      } else if (row.key === 'hero_product_id') {
        remoteSettings.hero_product_id = typeof row.value === 'string' ? row.value : '';
      } else if (row.key === 'hero_custom_image_url') {
        remoteSettings.hero_custom_image_url = typeof row.value === 'string' ? row.value : '';
      } else if (row.key === 'company_logo_url') {
        remoteSettings.company_logo_url = resolveCompanyLogo(typeof row.value === 'string' ? row.value : undefined);
      }
    });

    // Sync to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteSettings));
      window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: remoteSettings }));
    }

    return remoteSettings;
  } catch (err) {
    console.warn('Error fetching store settings from Supabase:', err);
    return localSettings;
  }
}

/**
 * Update WhatsApp order toggle, business number, and Hero showcase image settings (Admin only)
 */
export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = getStoredWhatsAppSettings();
  const updated: StoreSettings = {
    whatsapp_enabled: typeof settings.whatsapp_enabled === 'boolean' ? settings.whatsapp_enabled : current.whatsapp_enabled,
    whatsapp_number: settings.whatsapp_number !== undefined ? sanitizePhoneNumber(settings.whatsapp_number) : current.whatsapp_number,
    hero_image_type: settings.hero_image_type !== undefined ? settings.hero_image_type : current.hero_image_type,
    hero_product_id: settings.hero_product_id !== undefined ? settings.hero_product_id : current.hero_product_id,
    hero_custom_image_url: settings.hero_custom_image_url !== undefined ? settings.hero_custom_image_url : current.hero_custom_image_url,
    company_logo_url: settings.company_logo_url !== undefined ? settings.company_logo_url : current.company_logo_url,
  };

  // 1. Immediately update localStorage for instant client reactivity
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: updated }));
  }

  // 2. Persist to Supabase if available
  const client = getSupabaseClient();
  if (client) {
    try {
      const rowsToUpsert = [
        {
          key: 'whatsapp_enabled',
          value: updated.whatsapp_enabled,
          updated_at: new Date().toISOString(),
        },
        {
          key: 'whatsapp_number',
          value: updated.whatsapp_number,
          updated_at: new Date().toISOString(),
        },
        {
          key: 'hero_image_type',
          value: updated.hero_image_type,
          updated_at: new Date().toISOString(),
        },
        {
          key: 'hero_product_id',
          value: updated.hero_product_id,
          updated_at: new Date().toISOString(),
        },
        {
          key: 'hero_custom_image_url',
          value: updated.hero_custom_image_url,
          updated_at: new Date().toISOString(),
        },
        {
          key: 'company_logo_url',
          value: updated.company_logo_url,
          updated_at: new Date().toISOString(),
        },
      ];

      const { error } = await client
        .from('store_settings')
        .upsert(rowsToUpsert, { onConflict: 'key' });

      if (error) {
        console.warn('Supabase store_settings upsert note:', error.message);
      }
    } catch (err) {
      console.warn('Could not persist settings to Supabase table:', err);
    }
  }

  return updated;
}
