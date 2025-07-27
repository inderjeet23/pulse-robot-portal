import { LayoutDashboard, Wrench, DollarSign, Users, Zap, FileText, Scale, Settings, HelpCircle } from "lucide-react";

export const mainNavigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Tenants",
    url: "/tenants",
    icon: Users,
  },
  {
    title: "Maintenance",
    url: "/maintenance",
    icon: Wrench,
  },
  {
    title: "Rent",
    url: "/rent",
    icon: DollarSign,
  },
  {
    title: "Automation",
    url: "/automation",
    icon: Zap,
  },
];

export const analyticsNavigation = [
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Legal Notices",
    url: "/legal-notices",
    icon: Scale,
  },
];

export const systemNavigation = [
  {
    title: "Setup & Config",
    url: "/setup",
    icon: Settings,
  },
  {
    title: "FAQ & Support",
    url: "/faq",
    icon: HelpCircle,
  },
];
