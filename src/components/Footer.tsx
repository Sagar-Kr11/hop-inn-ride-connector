import { Link } from "react-router-dom";

const cityNames = [
  "INDORE", "BHOPAL", "PUNE", "NAGPUR", "JAIPUR", "SURAT", "AHMEDABAD", "LUCKNOW",
];

// 👇 EDIT THESE URLs to link your social media accounts
const socialLinks = {
  email: "hello@hopinn.in",
  twitter: "https://twitter.com/your-handle",
  instagram: "https://instagram.com/your-handle",
  linkedin: "https://linkedin.com/company/your-page",
};

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* City Marquee */}
      <div className="overflow-hidden border-b border-background/10 py-4">
        <div className="marquee-track flex whitespace-nowrap">
          {[...Array(4)].map((_, setIndex) =>
            cityNames.map((city, i) => (
              <span
                key={`${setIndex}-${i}`}
                className="mx-4 text-sm font-bold tracking-widest uppercase flex items-center gap-4"
              >
                {city}
                <span className="text-primary">•</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black tracking-tight mb-4">HOP-INN</h3>
            <p className="text-background/50 text-sm italic leading-relaxed max-w-xs">
              Shared auto transit for Indian cities. Pool-first, cost-split, eco-efficient urban mobility built for the streets.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-sm font-bold tracking-widest text-primary mb-6">NAVIGATE</h4>
            <nav className="space-y-4">
              <Link to="/" className="block text-sm text-background/60 hover:text-background transition-colors tracking-wide uppercase">
                Home
              </Link>
              <Link to="/booking" className="block text-sm text-background/60 hover:text-background transition-colors tracking-wide uppercase">
                Riders
              </Link>
              <Link to="/driver" className="block text-sm text-background/60 hover:text-background transition-colors tracking-wide uppercase">
                Drivers
              </Link>
              <Link to="/events" className="block text-sm text-background/60 hover:text-background transition-colors tracking-wide uppercase">
                Events
              </Link>
              <Link to="/safety" className="block text-sm text-background/60 hover:text-background transition-colors tracking-wide uppercase">
                About
              </Link>
            </nav>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-bold tracking-widest text-primary mb-6">CONNECT</h4>
            <a
              href={`mailto:${socialLinks.email}`}
              className="block text-sm text-background/60 hover:text-background transition-colors mb-6"
            >
              {socialLinks.email}
            </a>
            <div className="flex gap-6">
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-background/60 hover:text-background transition-colors tracking-wide uppercase"
              >
                Twitter
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-background/60 hover:text-background transition-colors tracking-wide uppercase"
              >
                Instagram
              </a>
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-background/60 hover:text-background transition-colors tracking-wide uppercase"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40 tracking-wide">© HOP-INN 2026</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-background/40 hover:text-background transition-colors tracking-wide uppercase">
              Privacy
            </a>
            <a href="#" className="text-xs text-background/40 hover:text-background transition-colors tracking-wide uppercase">
              Terms
            </a>
            <Link to="/safety" className="text-xs text-background/40 hover:text-background transition-colors tracking-wide uppercase">
              Safety
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
