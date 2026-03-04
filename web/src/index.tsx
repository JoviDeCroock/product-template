import {
  LocationProvider,
  Router,
  Route,
  hydrate,
  prerender as ssr,
  useLocation,
  lazy,
} from "preact-iso";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { DashboardHeader } from "./components/DashboardHeader";
import "./style.css";

const Home = lazy(() => import("./pages/Home/index").then((module) => module.Home));
const Auth = lazy(() => import("./pages/Auth/index").then((module) => module.Auth));
const Dashboard = lazy(() => import("./pages/Dashboard/index").then((module) => module.Dashboard));
const Billing = lazy(() => import("./pages/Billing/index").then((module) => module.Billing));
const NotFound = lazy(() => import("./pages/_404").then((module) => module.NotFound));

function AppContent() {
  const { url } = useLocation();
  const shouldRenderBaseHeader = url === "/" || url === "/auth";

  return (
    <div class="bg-neutral-950 min-h-screen">
      {/* Show appropriate header based on route */}
      {shouldRenderBaseHeader ? <Header /> : <DashboardHeader />}

      <main>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/auth" component={Auth} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/billing" component={Billing} />
          <Route default component={NotFound} />
        </Router>
      </main>

      {/* Show appropriate footer based on route */}
      {shouldRenderBaseHeader && <Footer />}
    </div>
  );
}

export function App() {
  return (
    <LocationProvider>
      <AppContent />
    </LocationProvider>
  );
}

if (typeof window !== "undefined") {
  const appElement = document.getElementById("app");
  if (!appElement) {
    throw new Error("App element not found");
  }
  hydrate(<App />, appElement);
}

export async function prerender(data: Record<string, unknown>) {
  return await ssr(<App {...data} />);
}
