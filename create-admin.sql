-- Crear usuario admin: ricardotellez7@hotmail.com

INSERT INTO users (id, email, role, "showAdult", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'ricardotellez7@hotmail.com',
  'ADMIN',
  false,
  NOW(),
  NOW()
)
ON CONFLICT (email)
DO UPDATE SET
  role = 'ADMIN',
  "updatedAt" = NOW();

-- Verificar el usuario creado
SELECT id, email, role, "showAdult", "createdAt" FROM users WHERE email = 'ricardotellez7@hotmail.com';
