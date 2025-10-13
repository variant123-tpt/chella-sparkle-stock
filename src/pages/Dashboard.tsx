import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Archive, Users, TrendingUp, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayStats, getTotalStats } from "@/lib/storage";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    todaySales: 0,
    todayBills: 0,
    totalRevenue: 0,
  });

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
  }, []);

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
      value: `₹${stats.todaySales.toFixed(2)}`,
      icon: TrendingUp,
      link: "/customers",
      gradient: "bg-gradient-celebration",
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
          return (
            <Link key={index} to={card.link}>
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
                  <div className="text-3xl font-bold text-foreground">{card.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Total Revenue Card */}
      <Card className="bg-gradient-festive text-primary-foreground shadow-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-6 w-6" />
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
          <p className="text-sm text-primary-foreground/80 mt-2">All time sales revenue</p>
        </CardContent>
      </Card>

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
