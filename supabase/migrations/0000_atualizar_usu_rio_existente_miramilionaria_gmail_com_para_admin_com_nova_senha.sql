-- Atualizar senha do usuário existente
UPDATE auth.users
SET 
  encrypted_password = crypt('Miz@Mili0n@ria', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'miramilionaria@gmail.com';

-- Atualizar ou criar perfil (se não existir)
INSERT INTO public.profiles (id, first_name, last_name)
SELECT id, 'Admin', 'Mira Milionária'
FROM auth.users
WHERE email = 'miramilionaria@gmail.com'
ON CONFLICT (id) DO UPDATE
SET first_name = 'Admin', last_name = 'Mira Milionária';

-- Atualizar ou criar configurações como admin
INSERT INTO public.configuracoes (user_id, email, nome, role, account_status)
SELECT id, 'miramilionaria@gmail.com', 'Admin Mira Milionária', 'admin', 'approved'
FROM auth.users
WHERE email = 'miramilionaria@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin', account_status = 'approved', nome = 'Admin Mira Milionária';