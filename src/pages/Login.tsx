import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#23272b]">
      <div className="bg-[#181c1f] p-8 rounded-xl shadow-xl border border-zinc-800 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Acesso ao Sistema</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#23272b",
                  brandAccent: "#23272b",
                  inputBorder: "#23272b",
                  inputLabelText: "#fff",
                  inputText: "#fff",
                  messageText: "#fff",
                  anchorTextColor: "#fff",
                },
              },
            },
          }}
          theme="light"
        />
      </div>
    </div>
  );
}