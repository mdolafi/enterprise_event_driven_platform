INSERT INTO public.users (user_id, email, first_name, last_name, role, permissions)
VALUES (
  'usr_9921a8f',
  'mogammed.dolafi.ctr@dot.gov',
  'Mohammed',
  'Dolafi',
  'ADMIN',
  '["*"]'::jsonb
)
ON CONFLICT (email) DO UPDATE 
SET role = 'ADMIN', permissions = '["*"]'::jsonb;