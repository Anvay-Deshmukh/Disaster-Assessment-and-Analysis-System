import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          {/* Brand Info */}
          <div>
            <h2 className="text-2xl font-bold text-teal-400">RESQ.AI</h2>
            <p className="mt-3 text-gray-400 text-sm leading-relaxed">
              AI-powered disaster response platform connecting citizens, rescue teams, and administrators.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-teal-300">Quick Links</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/" className="hover:text-teal-400">Home</Link></li>
              <li><Link to="/citizen" className="hover:text-teal-400">Citizen</Link></li>
              <li><Link to="/rescue" className="hover:text-teal-400">Rescue</Link></li>
              <li><Link to="/admin" className="hover:text-teal-400">Admin</Link></li>
            </ul>
          </div>

          {/* Contact / Social */}
          <div>
            <h3 className="text-lg font-semibold text-teal-300">Stay Connected</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="mailto:help@resq.ai" className="hover:text-teal-400">
                  📧 help@resq.ai
                </a>
              </li>
              <li>
                <a href="tel:+911234567890" className="hover:text-teal-400">
                  📞 +91 12345 67890
                </a>
              </li>
              <li className="flex justify-center md:justify-start space-x-5 text-xl mt-3">
                <a href="#" className="hover:text-teal-400">🐦</a>
                <a href="#" className="hover:text-teal-400">📘</a>
                <a href="#" className="hover:text-teal-400">📸</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} RESQ.AI — All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
