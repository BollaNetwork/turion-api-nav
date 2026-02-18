export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          key_prefix: string
          name: string
          is_active: boolean
          created_at: string
          last_used_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          key_prefix: string
          name?: string
          is_active?: boolean
          created_at?: string
          last_used_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          key_prefix?: string
          name?: string
          is_active?: boolean
          created_at?: string
          last_used_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan_id: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          api_key_id: string | null
          request_type: string
          url: string
          status_code: number | null
          execution_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          api_key_id?: string | null
          request_type: string
          url: string
          status_code?: number | null
          execution_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          api_key_id?: string | null
          request_type?: string
          url?: string
          status_code?: number | null
          execution_time_ms?: number | null
          created_at?: string
        }
      }
      monthly_usage: {
        Row: {
          id: string
          user_id: string
          year_month: string
          request_count: number
          success_count: number
          failed_count: number
          total_execution_time_ms: number
        }
        Insert: {
          id?: string
          user_id: string
          year_month: string
          request_count?: number
          success_count?: number
          failed_count?: number
          total_execution_time_ms?: number
        }
        Update: {
          id?: string
          user_id?: string
          year_month?: string
          request_count?: number
          success_count?: number
          failed_count?: number
          total_execution_time_ms?: number
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          price_gbp: number
          requests_included: number
          requests_per_minute: number
          timeout_seconds: number
          overage_price_per_1k: number | null
          features: Json
          stripe_price_id: string | null
        }
        Insert: {
          id: string
          name: string
          price_gbp: number
          requests_included: number
          requests_per_minute: number
          timeout_seconds: number
          overage_price_per_1k?: number | null
          features?: Json
          stripe_price_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          price_gbp?: number
          requests_included?: number
          requests_per_minute?: number
          timeout_seconds?: number
          overage_price_per_1k?: number | null
          features?: Json
          stripe_price_id?: string | null
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ApiKey = Database['public']['Tables']['api_keys']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type UsageLog = Database['public']['Tables']['usage_logs']['Row']
export type MonthlyUsage = Database['public']['Tables']['monthly_usage']['Row']
export type Plan = Database['public']['Tables']['plans']['Row']

// Plan configuration
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    requestsIncluded: 1000,
    requestsPerMinute: 5,
    timeoutSeconds: 15,
    features: {
      custom_js: false,
      proxy: false,
      priority: false,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 7,
    requestsIncluded: 10000,
    requestsPerMinute: 10,
    timeoutSeconds: 30,
    overagePrice: 0.80,
    features: {
      custom_js: true,
      proxy: false,
      priority: false,
    },
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 25,
    requestsIncluded: 50000,
    requestsPerMinute: 30,
    timeoutSeconds: 45,
    overagePrice: 0.60,
    features: {
      custom_js: true,
      proxy: true,
      priority: false,
    },
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    price: 79,
    requestsIncluded: 200000,
    requestsPerMinute: 60,
    timeoutSeconds: 60,
    overagePrice: 0.45,
    features: {
      custom_js: true,
      proxy: true,
      priority: true,
    },
  },
} as const

export type PlanId = keyof typeof PLANS
