-- Table for user buy box profiles
CREATE TABLE public.investor_buy_boxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Buy Box',
  min_price NUMERIC,
  max_price NUMERIC,
  min_profit NUMERIC,
  min_cash_flow NUMERIC,
  preferred_strategies TEXT[] DEFAULT '{}',
  target_markets TEXT[] DEFAULT '{}',
  max_rehab NUMERIC,
  min_arv NUMERIC,
  notes TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for saved deals
CREATE TABLE public.investor_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  share_token TEXT UNIQUE,
  address TEXT,
  asking_price NUMERIC,
  arv NUMERIC,
  rehab_cost NUMERIC,
  strategy TEXT NOT NULL DEFAULT 'wholesale',
  calculator_type TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  deal_score INTEGER,
  deal_verdict TEXT,
  risk_flags JSONB DEFAULT '[]',
  ai_analysis TEXT,
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  parent_deal_id UUID REFERENCES public.investor_deals(id),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for community benchmarks (aggregated, anonymous)
CREATE TABLE public.investor_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zip_code TEXT,
  state TEXT,
  avg_arv_per_sqft NUMERIC,
  avg_rehab_per_sqft NUMERIC,
  avg_wholesale_fee_pct NUMERIC,
  avg_closing_cost_pct NUMERIC,
  avg_days_on_market INTEGER,
  sample_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investor_buy_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_benchmarks ENABLE ROW LEVEL SECURITY;

-- Buy Box policies
CREATE POLICY "Users can view their own buy boxes" ON public.investor_buy_boxes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own buy boxes" ON public.investor_buy_boxes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own buy boxes" ON public.investor_buy_boxes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own buy boxes" ON public.investor_buy_boxes FOR DELETE USING (auth.uid() = user_id);

-- Deals policies (including shared deals)
CREATE POLICY "Users can view their own deals" ON public.investor_deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view shared deals" ON public.investor_deals FOR SELECT USING (share_token IS NOT NULL);
CREATE POLICY "Users can create their own deals" ON public.investor_deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deals" ON public.investor_deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deals" ON public.investor_deals FOR DELETE USING (auth.uid() = user_id);

-- Benchmarks are public read
CREATE POLICY "Anyone can view benchmarks" ON public.investor_benchmarks FOR SELECT USING (true);
CREATE POLICY "Admins can manage benchmarks" ON public.investor_benchmarks FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_investor_buy_boxes_updated_at BEFORE UPDATE ON public.investor_buy_boxes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_investor_deals_updated_at BEFORE UPDATE ON public.investor_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();