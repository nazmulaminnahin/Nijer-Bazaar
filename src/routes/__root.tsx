import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";

import { Toaster } from "@/components/ui/sonner";
import { FacebookPixel } from "@/components/facebook-pixel";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">পেইজটি খুঁজে পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm text-muted-foreground">আপনি যে পেইজটি খুঁজছেন সেটি আর নেই।</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-brand">
            হোমে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">পেইজটি লোড হয়নি</h1>
        <p className="mt-2 text-sm text-muted-foreground">কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-brand">
            আবার চেষ্টা করুন
          </button>
          <a href="/" className="rounded-full border border-input px-5 py-2.5 text-sm font-medium">হোমে যান</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <FacebookPixel />
      <Outlet />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
