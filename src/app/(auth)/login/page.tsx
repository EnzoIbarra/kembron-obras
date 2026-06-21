import { LoginForm } from '@/domains/usuarios/components/LoginForm';

export const metadata = { title: 'Iniciar sesión — Kembron' };

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm px-4">
      <LoginForm />
    </div>
  );
}
