-- Turion Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Profiles Table (extends auth.users)
-- ===========================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- API Keys Table
-- ===========================================
CREATE TABLE public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT DEFAULT 'Default Key',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- ===========================================
-- Subscriptions Table
-- ===========================================
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Usage Logs Table
-- ===========================================
CREATE TABLE public.usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  api_key_id UUID REFERENCES public.api_keys,
  request_type TEXT NOT NULL,
  url TEXT NOT NULL,
  status_code INTEGER,
  execution_time_ms FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Monthly Usage Summary
-- ===========================================
CREATE TABLE public.monthly_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  year_month TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  total_execution_time_ms FLOAT DEFAULT 0,
  UNIQUE(user_id, year_month)
);

-- ===========================================
-- Plans Configuration
-- ===========================================
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_gbp DECIMAL(10,2) NOT NULL,
  requests_included INTEGER NOT NULL,
  requests_per_minute INTEGER NOT NULL,
  timeout_seconds INTEGER NOT NULL,
  overage_price_per_1k DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '{}',
  stripe_price_id TEXT
);

-- Insert default plans
INSERT INTO public.plans (id, name, price_gbp, requests_included, requests_per_minute, timeout_seconds, overage_price_per_1k, features) VALUES
('free', 'Free', 0, 1000, 5, 15, NULL, '{"custom_js": false, "proxy": false, "priority": false}'),
('starter', 'Starter', 7, 10000, 10, 30, 0.80, '{"custom_js": true, "proxy": false, "priority": false}'),
('growth', 'Growth', 25, 50000, 30, 45, 0.60, '{"custom_js": true, "proxy": true, "priority": false}'),
('scale', 'Scale', 79, 200000, 60, 60, 0.45, '{"custom_js": true, "proxy": true, "priority": true}');

-- ===========================================
-- Row Level Security (RLS)
-- ===========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_usage ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- API Keys policies
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Usage logs policies
CREATE POLICY "Users can view own usage logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON public.usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Monthly usage policies
CREATE POLICY "Users can view own monthly usage" ON public.monthly_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Plans are public
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by all" ON public.plans
  FOR SELECT USING (true);

-- ===========================================
-- Indexes for Performance
-- ===========================================
CREATE INDEX idx_usage_logs_user_created ON public.usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_logs_user_month ON public.usage_logs(user_id, date_trunc('month', created_at));
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_key_prefix ON public.api_keys(key_prefix);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_monthly_usage_user_month ON public.monthly_usage(user_id, year_month);

-- ===========================================
-- Functions
-- ===========================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  INSERT INTO public.subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_request_type TEXT,
  p_url TEXT,
  p_status_code INTEGER DEFAULT NULL,
  p_execution_time FLOAT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_year_month TEXT := to_char(NOW(), 'YYYY-MM');
BEGIN
  -- Insert usage log
  INSERT INTO public.usage_logs (user_id, request_type, url, status_code, execution_time_ms)
  VALUES (p_user_id, p_request_type, p_url, p_status_code, p_execution_time);
  
  -- Update monthly usage
  INSERT INTO public.monthly_usage (user_id, year_month, request_count, success_count, failed_count, total_execution_time_ms)
  VALUES (
    p_user_id,
    v_year_month,
    1,
    CASE WHEN p_status_code BETWEEN 200 AND 299 THEN 1 ELSE 0 END,
    CASE WHEN p_status_code IS NULL OR p_status_code >= 400 THEN 1 ELSE 0 END,
    COALESCE(p_execution_time, 0)
  )
  ON CONFLICT (user_id, year_month) DO UPDATE SET
    request_count = monthly_usage.request_count + 1,
    success_count = monthly_usage.success_count + CASE WHEN p_status_code BETWEEN 200 AND 299 THEN 1 ELSE 0 END,
    failed_count = monthly_usage.failed_count + CASE WHEN p_status_code IS NULL OR p_status_code >= 400 THEN 1 ELSE 0 END,
    total_execution_time_ms = monthly_usage.total_execution_time_ms + COALESCE(p_execution_time, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
