import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Welcome to your new App
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
          This is your starting point. Let&apos;s build something amazing.
        </p>
        <div className="mt-6">
          <Button>Get Started</Button>
        </div>
      </div>
    </main>
  );
}
