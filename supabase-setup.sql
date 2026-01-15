-- ========================================
-- Supabase Database Setup Script
-- نظام تقييم المركبات المستردة v7.0
-- ========================================

-- ========================================
-- 1. جدول المركبات (vehicles)
-- ========================================
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contract_no VARCHAR(100),
    customer_name VARCHAR(255),
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    vin VARCHAR(17),
    plate_no VARCHAR(50),
    odometer INTEGER,
    color VARCHAR(50),
    fuel_type VARCHAR(50),
    market_value DECIMAL(12, 2),
    overall_rating VARCHAR(20) DEFAULT 'good',
    recovery_date DATE,
    recovery_location TEXT,
    recommendation VARCHAR(50),
    operation_status VARCHAR(50),
    warehouse_id UUID,
    warehouse_name VARCHAR(255),
    evaluator_id UUID,
    evaluator_name VARCHAR(255),
    evaluator_employee_id VARCHAR(100),
    gps_latitude VARCHAR(50),
    gps_longitude VARCHAR(50),
    gps_map_url TEXT,
    notes TEXT,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. جدول المستودعات (warehouses)
-- ========================================
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    capacity INTEGER DEFAULT 50,
    manager_name VARCHAR(255),
    manager_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. جدول القائمين بالتقييم (evaluators)
-- ========================================
CREATE TABLE IF NOT EXISTS public.evaluators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. جدول سجل النشاطات (activities)
-- ========================================
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. فهارس لتحسين الأداء
-- ========================================
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON public.vehicles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_contract_no ON public.vehicles(contract_no);
CREATE INDEX IF NOT EXISTS idx_warehouses_user_id ON public.warehouses(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluators_user_id ON public.evaluators(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- ========================================
-- 6. سياسات أمان RLS (Row Level Security)
-- ========================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- سياسات جدول المركبات
CREATE POLICY "Users can view own vehicles" ON public.vehicles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles" ON public.vehicles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles" ON public.vehicles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles" ON public.vehicles
    FOR DELETE USING (auth.uid() = user_id);

-- سياسات جدول المستودعات
CREATE POLICY "Users can view own warehouses" ON public.warehouses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own warehouses" ON public.warehouses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own warehouses" ON public.warehouses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own warehouses" ON public.warehouses
    FOR DELETE USING (auth.uid() = user_id);

-- سياسات جدول القائمين بالتقييم
CREATE POLICY "Users can view own evaluators" ON public.evaluators
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluators" ON public.evaluators
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evaluators" ON public.evaluators
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own evaluators" ON public.evaluators
    FOR DELETE USING (auth.uid() = user_id);

-- سياسات جدول النشاطات
CREATE POLICY "Users can view own activities" ON public.activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON public.activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 7. دوال المساعدة
-- ========================================

-- دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على جدول المركبات
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- تطبيق الدالة على جدول المستودعات
CREATE TRIGGER update_warehouses_updated_at
    BEFORE UPDATE ON public.warehouses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- تطبيق الدالة على جدول القائمين بالتقييم
CREATE TRIGGER update_evaluators_updated_at
    BEFORE UPDATE ON public.evaluators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 8. إدراج بيانات افتراضية للاختبار (اختياري)
-- يمكنك تشغيل هذا بعد تسجيل الدخول لأول مرة
-- ========================================

-- ملاحظة: استبدل 'YOUR_USER_ID' بـ UUID المستخدم الفعلي بعد التسجيل

/*
-- مستودعات افتراضية
INSERT INTO public.warehouses (user_id, name, location, capacity, manager_name, manager_phone)
VALUES 
    ('YOUR_USER_ID', 'المستودع الرئيسي', 'الرياض', 100, 'أحمد محمد', '0501234567'),
    ('YOUR_USER_ID', 'المستودع الشرقي', 'الدمام', 50, 'خالد علي', '0509876543'),
    ('YOUR_USER_ID', 'المستودع الغربي', 'جدة', 75, 'محمد سعد', '0551122334');

-- قائمين بالتقييم افتراضيين
INSERT INTO public.evaluators (user_id, name, employee_id, phone)
VALUES 
    ('YOUR_USER_ID', 'محمد أحمد', 'EMP001', '0501234567'),
    ('YOUR_USER_ID', 'أحمد علي', 'EMP002', '0509876543'),
    ('YOUR_USER_ID', 'خالد محمد', 'EMP003', '0551122334');
*/

-- ========================================
-- تم الانتهاء من إعداد قاعدة البيانات!
-- ========================================
