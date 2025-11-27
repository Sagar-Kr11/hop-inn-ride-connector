-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create custom types
CREATE TYPE public.app_role AS ENUM ('passenger', 'driver', 'admin');
CREATE TYPE public.vehicle_type AS ENUM ('auto', 'shared_auto');
CREATE TYPE public.ride_type AS ENUM ('solo', 'shared_route', 'shared_event');
CREATE TYPE public.ride_status AS ENUM ('searching', 'matched', 'in_progress', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  vehicle_number TEXT NOT NULL,
  permit_number TEXT NOT NULL,
  vehicle_type vehicle_type NOT NULL DEFAULT 'auto',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_online BOOLEAN NOT NULL DEFAULT false,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location_name TEXT NOT NULL,
  location_latitude DECIMAL(10, 8) NOT NULL,
  location_longitude DECIMAL(11, 8) NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create rides table
CREATE TABLE public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_location TEXT NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  ride_type ride_type NOT NULL DEFAULT 'solo',
  status ride_status NOT NULL DEFAULT 'searching',
  fare DECIMAL(10,2),
  distance_km DECIMAL(10,2),
  estimated_time_minutes INTEGER,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  passenger_rating INTEGER CHECK (passenger_rating >= 1 AND passenger_rating <= 5),
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

-- Create ride_passengers for shared rides
CREATE TABLE public.ride_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE NOT NULL,
  passenger_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  fare_share DECIMAL(10,2),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ride_id, passenger_id)
);

ALTER TABLE public.ride_passengers ENABLE ROW LEVEL SECURITY;

-- Create emergency_contacts table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Create driver_routes table
CREATE TABLE public.driver_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_name TEXT NOT NULL,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  waypoints JSONB,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_routes ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for drivers
CREATE TRIGGER set_updated_at_drivers
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for rides
CREATE TRIGGER set_updated_at_rides
  BEFORE UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.phone, '')
  );
  
  -- Assign default passenger role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'passenger');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for drivers
CREATE POLICY "Drivers can view their own profile"
  ON public.drivers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update their own profile"
  ON public.drivers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can insert their own profile"
  ON public.drivers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Passengers can view online drivers"
  ON public.drivers FOR SELECT
  TO authenticated
  USING (is_online = true);

-- RLS Policies for events
CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for rides
CREATE POLICY "Passengers can view their own rides"
  ON public.rides FOR SELECT
  TO authenticated
  USING (auth.uid() = passenger_id);

CREATE POLICY "Drivers can view their assigned rides"
  ON public.rides FOR SELECT
  TO authenticated
  USING (auth.uid() = driver_id);

CREATE POLICY "Passengers can create rides"
  ON public.rides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Passengers can update their own rides"
  ON public.rides FOR UPDATE
  TO authenticated
  USING (auth.uid() = passenger_id);

CREATE POLICY "Drivers can update their assigned rides"
  ON public.rides FOR UPDATE
  TO authenticated
  USING (auth.uid() = driver_id);

-- RLS Policies for ride_passengers
CREATE POLICY "Passengers can view rides they're part of"
  ON public.ride_passengers FOR SELECT
  TO authenticated
  USING (auth.uid() = passenger_id);

CREATE POLICY "System can manage ride passengers"
  ON public.ride_passengers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rides
      WHERE id = ride_id
      AND (passenger_id = auth.uid() OR driver_id = auth.uid())
    )
  );

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view their own emergency contacts"
  ON public.emergency_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own emergency contacts"
  ON public.emergency_contacts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for driver_routes
CREATE POLICY "Drivers can manage their own routes"
  ON public.driver_routes FOR ALL
  TO authenticated
  USING (auth.uid() = driver_id);

CREATE POLICY "Passengers can view active driver routes"
  ON public.driver_routes FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX idx_drivers_online ON public.drivers(is_online);
CREATE INDEX idx_drivers_location ON public.drivers(current_latitude, current_longitude);
CREATE INDEX idx_rides_passenger ON public.rides(passenger_id);
CREATE INDEX idx_rides_driver ON public.rides(driver_id);
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_rides_event ON public.rides(event_id);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_emergency_contacts_user ON public.emergency_contacts(user_id);
CREATE INDEX idx_driver_routes_driver ON public.driver_routes(driver_id);