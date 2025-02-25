import { cn } from "./utils/cn";

export default function App() {
  return (
    <main className={cn("min-h-screen bg-slate-700 ", "flex flex-col items-center justify-center")}>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-[5rem]">
          Create Minimalist React App
        </h1>
      </div>
    </main>
  );
}
