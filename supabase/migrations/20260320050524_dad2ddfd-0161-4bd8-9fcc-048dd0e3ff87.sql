
-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Addictions table
CREATE TABLE public.addictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  quit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  per_day INTEGER NOT NULL DEFAULT 0,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  units_per_pack INTEGER NOT NULL DEFAULT 1,
  reduction_mode BOOLEAN NOT NULL DEFAULT false,
  weekly_target INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.addictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addictions" ON public.addictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own addictions" ON public.addictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addictions" ON public.addictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own addictions" ON public.addictions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_addictions_updated_at BEFORE UPDATE ON public.addictions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Health entries table
CREATE TABLE public.health_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  addiction_id UUID NOT NULL REFERENCES public.addictions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  heart_rate INTEGER,
  systolic INTEGER,
  diastolic INTEGER,
  weight NUMERIC,
  peak_flow NUMERIC,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.health_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health entries" ON public.health_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health entries" ON public.health_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own health entries" ON public.health_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own health entries" ON public.health_entries FOR DELETE USING (auth.uid() = user_id);

-- Mood entries table
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  addiction_id UUID NOT NULL REFERENCES public.addictions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  craving INTEGER NOT NULL CHECK (craving >= 1 AND craving <= 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mood entries" ON public.mood_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mood entries" ON public.mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mood entries" ON public.mood_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mood entries" ON public.mood_entries FOR DELETE USING (auth.uid() = user_id);

-- Weekly log for alcohol reduction mode
CREATE TABLE public.weekly_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  addiction_id UUID NOT NULL REFERENCES public.addictions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week TEXT NOT NULL,
  actual INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weekly logs" ON public.weekly_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weekly logs" ON public.weekly_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weekly logs" ON public.weekly_logs FOR UPDATE USING (auth.uid() = user_id);
