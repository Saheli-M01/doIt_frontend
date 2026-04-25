import Link from "next/link";
import { Mail } from "lucide-react";

type FooterProps = {
  showCredit?: boolean;
  onContactClick?: () => void;
};

export function Footer({ showCredit = true, onContactClick }: FooterProps) {
  return (
    <footer className="border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:h-14 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 text-xs text-foreground-muted">
        <span className="text-center sm:text-left">
          © {new Date().getFullYear()} GetDoIt. All rights reserved.
        </span>
        
        <div className="flex items-center gap-4  justify-end" >
          
          
          {showCredit && (
            <span className="text-center">
              Built by{" "}
              <Link
                href="https://sahelimondal.in"
                target="_blank"
                className="hover:text-primary transition-colors"
              >
                Saheli Mondal
              </Link>
            </span>
          )}

          {onContactClick && (
            <button
              onClick={onContactClick}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
              aria-label="Contact us"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>saheli.mondal.prof@gmail.com</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
