import { LoginForm } from "@/components/forms";
import { card } from "@/components/ui";

const GARLAND = ["bg-morado", "bg-verde", "bg-flag-fucsia", "bg-cempasuchil", "bg-morado", "bg-verde", "bg-flag-fucsia"];

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div aria-hidden className="relative">
        <div className="absolute inset-x-0 top-0 h-[3px] rounded-full bg-ink-soft/35" />
        <div className="grid grid-cols-7 gap-1.5 pt-[2px]">
          {GARLAND.map((color, i) => (
            <div key={i} className="sway" style={{ animationDelay: `${-i * 0.45}s` }}>
              <div className={`pennant aspect-[4/5] ${color}`}>
                <span className="lace block translate-y-1.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h1 className="font-display text-[52px] leading-none text-fucsia">CInput</h1>
        <p className="mt-2 text-[15px] text-ink-soft">30 days of Spanish you can understand.</p>
      </div>
      <div className={card}>
        <LoginForm />
      </div>
    </main>
  );
}
