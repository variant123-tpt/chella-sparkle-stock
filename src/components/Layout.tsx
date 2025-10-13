import { Link, useLocation } from "react-router-dom";
import { Home, Package, ShoppingCart, Archive, Users, Sparkles } from "lucide-react";
import logo from "@/assets/chella-logo.png";

const navItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/add-product", icon: Package, label: "Add Product" },
  { path: "/billing", icon: ShoppingCart, label: "Billing" },
  { path: "/stock", icon: Archive, label: "Stock View" },
  { path: "/customers", icon: Users, label: "Customers" },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-festive shadow-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Chella Crackers" className="h-12 w-12 animate-sparkle" />
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground font-['Playfair_Display']">
                  Chella Crackers
                </h1>
                <p className="text-xs text-primary-foreground/80 font-medium">
                  Billing & Inventory System
                </p>
              </div>
            </Link>
            <Sparkles className="h-8 w-8 text-secondary animate-sparkle" />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b sticky top-[88px] z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-all ${
                    isActive
                      ? "border-b-2 border-primary text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};
