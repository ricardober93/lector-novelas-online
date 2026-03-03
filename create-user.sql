-- Crear o actualizar usuario como ADMIN
-- Reemplaza 'tu@email.com' con tu email real

INSERT INTO users (id, email, role, "showAdult", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'REEMPLAZAR_CON_TU_EMAIL',
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
SELECT * FROM users WHERE email = 'REEMPLAZAR_CON_TU_EMAIL';
