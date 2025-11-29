import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const Header = () => {
  return <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full text-destructive-foreground flex-row flex items-center justify-center bg-primary">
            <span className="text-xl font-bold text-primary-foreground">​</span>
          </div>
          <span className="text-xl font-bold text-foreground">Hop-Inn</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/driver" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Drive with Us
          </Link>
          <Link to="/events" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Events
          </Link>
          <Link to="/safety" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Safety
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>;
};
export default Header;