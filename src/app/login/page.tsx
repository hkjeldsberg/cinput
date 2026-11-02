import { LoginForm } from "@/components/forms";
import { card } from "@/components/ui";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-5xl font-extrabold tracking-tight">CInput</h1>
        <p className="mt-2 text-ink-soft">30 days of Spanish you can understand.</p>
      </div>
      <div className={card}>
        <LoginForm />
      </div>
    </main>
  );
}
