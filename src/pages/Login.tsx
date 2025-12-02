import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      showError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      showError("Erro ao fazer login: " + error.message);
    } else {
      showSuccess("Login realizado com sucesso!");
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      showError("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      showError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      showError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      showError("Erro ao criar conta: " + error.message);
    } else {
      showSuccess("Conta criada com sucesso! Verifique seu email.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#23272b] p-4">
      <div className="bg-[#181c1f] p-8 rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            M
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Entrar no Sistema" : "Criar Conta"}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin
              ? "Acesse o painel administrativo"
              : "Cadastre-se para acessar o sistema"}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-gray-600"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Senha
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-gray-600"
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Confirmar Senha
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-gray-600"
                disabled={loading}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Processando...
              </span>
            ) : isLogin ? (
              "Entrar"
            ) : (
              "Criar Conta"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
            disabled={loading}
          >
            {isLogin ? (
              <>
                Não tem uma conta?{" "}
                <span className="font-semibold text-white">Cadastre-se</span>
              </>
            ) : (
              <>
                Já tem uma conta?{" "}
                <span className="font-semibold text-white">Faça login</span>
              </>
            )}
          </button>
        </div>

        {isLogin && (
          <div className="mt-4 text-center">
            <button
              onClick={async () => {
                if (!email) {
                  showError("Digite seu email para recuperar a senha");
                  return;
                }
                setLoading(true);
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                setLoading(false);
                if (error) {
                  showError("Erro ao enviar email: " + error.message);
                } else {
                  showSuccess("Email de recuperação enviado!");
                }
              }}
              className="text-gray-400 hover:text-white text-sm transition-colors"
              disabled={loading}
            >
              Esqueceu sua senha?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}