import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Archive, Users, TrendingUp, IndianRupee, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { getTodayStats, getTotalStats } from "@/lib/storage";
import { toast } from "sonner";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    todaySales: 0,
    todayBills: 0,
    totalRevenue: 0,
  });

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const CORRECT_PASSWORD = "KARUNACHELLA";

  useEffect(() => {
    const todayStats = getTodayStats();
    const totalStats = getTotalStats();
    
    setStats({
      totalProducts: totalStats.totalProducts,
      totalCustomers: totalStats.totalCustomers,
      todaySales: todayStats.totalSales,
      todayBills: todayStats.billsCount,
      totalRevenue: totalStats.totalRevenue,
    });
    
    // Reset unlock state when component mounts (page loads)
    setIsUnlocked(false);
  }, []);

  const handleUnlockClick = () => {
    setShowPasswordDialog(true);
    setPassword("");
  };

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setIsUnlocked(true);
      setShowPasswordDialog(false);
      setPassword("");
      toast.success("Access granted!");
    } else {
      toast.error("Incorrect password!");
      setPassword("");
    }
  };

  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      link: "/stock",
      gradient: "bg-gradient-festive",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      link: "/customers",
      gradient: "bg-gradient-celebration",
    },
    {
      title: "Today's Bills",
      value: stats.todayBills,
      icon: ShoppingCart,
      link: "/billing",
      gradient: "bg-gradient-festive",
    },
    {
      title: "Today's Sales",
      value: isUnlocked ? `₹${stats.todaySales.toFixed(2)}` : "******",
      icon: TrendingUp,
      link: isUnlocked ? "/customers" : undefined,
      gradient: "bg-gradient-celebration",
      isProtected: true,
    },
  ];

  const quickActions = [
    { title: "Add Product", icon: Package, link: "/add-product", color: "bg-primary" },
    { title: "New Bill", icon: ShoppingCart, link: "/billing", color: "bg-secondary" },
    { title: "View Stock", icon: Archive, link: "/stock", color: "bg-accent" },
    { title: "Customers", icon: Users, link: "/customers", color: "bg-primary" },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome Section */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-4xl font-bold text-primary font-['Playfair_Display']">
          🎇 Welcome to Chella Crackers 🎇
        </h1>
        <p className="text-muted-foreground">
          Manage your inventory, billing, and customer purchases efficiently
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isProtectedCard = card.isProtected && !isUnlocked;
          
          const cardContent = (
            <Card className="hover:shadow-glow transition-all cursor-pointer border-2 hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.gradient}`}>
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground flex items-center gap-2">
                  {card.value}
                  {card.isProtected && !isUnlocked && <Eye className="h-5 w-5 text-muted-foreground" />}
                </div>
              </CardContent>
            </Card>
          );
          
          return isProtectedCard ? (
            <div key={index} onClick={handleUnlockClick}>
              {cardContent}
            </div>
          ) : (
            <Link key={index} to={card.link!}>
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Total Revenue Card */}
      <Card 
        className="bg-gradient-festive text-primary-foreground shadow-glow cursor-pointer hover:scale-[1.02] transition-all" 
        onClick={!isUnlocked ? handleUnlockClick : undefined}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-6 w-6" />
            Total Revenue
            {!isUnlocked && <Eye className="h-5 w-5 ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold">
            {isUnlocked ? `₹${stats.totalRevenue.toFixed(2)}` : "******"}
          </div>
          <p className="text-sm text-primary-foreground/80 mt-2">All time sales revenue</p>
        </CardContent>
      </Card>

      {/* Password Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Password</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the password to view financial information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPassword("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground font-['Playfair_Display']">
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.link}>
                <Card className="hover:shadow-glow transition-all cursor-pointer hover:scale-105">
                  <CardContent className="pt-6 text-center">
                    <div className={`${action.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground">{action.title}</h3>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
