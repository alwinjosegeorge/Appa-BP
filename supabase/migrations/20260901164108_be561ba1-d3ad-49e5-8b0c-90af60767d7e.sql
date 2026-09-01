CREATE TABLE public.bp_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL DEFAULT 'Dad',
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reading_time TIME NOT NULL DEFAULT CURRENT_TIME,
  right_systolic INT,
  right_diastolic INT,
  left_systolic INT,
  left_diastolic INT,
  pulse INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bp_readings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bp_readings TO authenticated;
GRANT ALL ON public.bp_readings TO service_role;
ALTER TABLE public.bp_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read readings" ON public.bp_readings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert readings" ON public.bp_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update readings" ON public.bp_readings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete readings" ON public.bp_readings FOR DELETE USING (true);

CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL DEFAULT 'Dad',
  patient_age INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert settings" ON public.app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update settings" ON public.app_settings FOR UPDATE USING (true) WITH CHECK (true);

INSERT INTO public.app_settings (patient_name, patient_age) VALUES ('Dad', 68);

INSERT INTO public.bp_readings (patient_name, reading_date, reading_time, right_systolic, right_diastolic, left_systolic, left_diastolic, pulse, notes) VALUES
('Dad', CURRENT_DATE, '08:15', 200, 90, 210, 100, 82, 'Before breakfast'),
('Dad', CURRENT_DATE, '09:15', NULL, NULL, 110, 90, 76, 'After medicine'),
('Dad', CURRENT_DATE, '10:30', 190, 90, 180, 100, 80, 'After resting'),
('Dad', CURRENT_DATE, '11:20', 160, 90, 170, 90, 78, NULL),
('Dad', CURRENT_DATE, '12:30', 160, 90, 160, 90, 75, 'Before lunch'),
('Dad', CURRENT_DATE, '13:45', 160, 90, 180, 90, 79, NULL),
('Dad', CURRENT_DATE, '16:25', 160, 90, 170, 90, 74, 'After resting'),
('Dad', CURRENT_DATE, '17:30', 170, 90, 170, 90, 77, NULL),
('Dad', CURRENT_DATE, '19:00', 190, 100, 180, 100, 84, 'After dinner walk'),
('Dad', CURRENT_DATE - 1, '08:20', 165, 92, 170, 95, 80, 'Before breakfast'),
('Dad', CURRENT_DATE - 1, '13:10', 150, 88, 158, 90, 76, NULL),
('Dad', CURRENT_DATE - 1, '19:30', 172, 95, 176, 96, 81, 'After medicine'),
('Dad', CURRENT_DATE - 2, '08:05', 158, 86, 162, 88, 74, 'Before breakfast'),
('Dad', CURRENT_DATE - 2, '18:45', 168, 94, 172, 92, 79, NULL),
('Dad', CURRENT_DATE - 3, '09:00', 145, 85, 150, 88, 72, 'After resting'),
('Dad', CURRENT_DATE - 4, '08:40', 155, 90, 160, 92, 77, NULL),
('Dad', CURRENT_DATE - 5, '08:30', 148, 84, 152, 86, 73, 'Before breakfast'),
('Dad', CURRENT_DATE - 6, '20:00', 162, 91, 166, 93, 78, NULL),
('Dad', CURRENT_DATE - 9, '08:10', 170, 96, 174, 98, 82, NULL),
('Dad', CURRENT_DATE - 12, '09:20', 152, 88, 156, 90, 75, 'After medicine'),
('Dad', CURRENT_DATE - 16, '08:25', 164, 92, 168, 94, 80, NULL),
('Dad', CURRENT_DATE - 21, '18:15', 158, 90, 160, 91, 76, NULL),
('Dad', CURRENT_DATE - 26, '08:35', 146, 86, 150, 88, 71, 'Before breakfast');