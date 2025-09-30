import { Link } from 'react-router-dom';
import { FiShield, FiMapPin, FiAlertCircle, FiUsers, FiActivity, FiLock } from 'react-icons/fi';

function About() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <section className="text-center py-8 md:py-12">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30">
          About ResQ.ai
        </span>
        <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-sky-300 to-teal-300 bg-clip-text text-transparent">
          Coordinated, Faster, Safer Emergency Response
        </h1>
        <p className="mt-4 text-gray-300 max-w-3xl mx-auto">
          ResQ.ai is a unified platform for citizens, rescue teams, and administrators to collaborate in real time during emergencies. 
          From SOS alerts to team coordination and analytics, we help you respond faster and save more lives.
        </p>
      </section>

      {/* Key Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          {
            icon: <FiAlertCircle className="w-6 h-6" />, title: 'Instant SOS',
            desc: 'One-tap SOS broadcasting with precise context to the nearest available responders.'
          },
          {
            icon: <FiMapPin className="w-6 h-6" />, title: 'Live Coordination',
            desc: 'Location-aware tasking, team assignments, and progress tracking on the ground.'
          },
          {
            icon: <FiShield className="w-6 h-6" />, title: 'Secure & Reliable',
            desc: 'Role-based access, protected routes, and secure session management built-in.'
          }
        ].map((item, idx) => (
          <div
            key={idx}
            className="group rounded-xl bg-gray-800/60 ring-1 ring-white/10 p-5 md:p-6 hover:bg-gray-800/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-sky-500/20 text-sky-300 ring-1 ring-white/10">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-100">{item.title}</h3>
            </div>
            <p className="mt-3 text-sm text-gray-300">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Who it's for */}
      <section className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          {
            icon: <FiUsers className="w-5 h-5" />, label: 'Citizens',
            points: ['Quick SOS alerts', 'Status updates', 'Guided safety tips']
          },
          {
            icon: <FiActivity className="w-5 h-5" />, label: 'Rescue Teams',
            points: ['Team formation', 'Task assignment', 'Field analytics']
          },
          {
            icon: <FiLock className="w-5 h-5" />, label: 'Administrators',
            points: ['Role-based access', 'Global oversight', 'Incident reporting']
          }
        ].map((role, idx) => (
          <div key={idx} className="rounded-xl overflow-hidden ring-1 ring-white/10">
            <div className="bg-gradient-to-r from-indigo-600/20 to-sky-600/20 px-5 py-3 flex items-center gap-2">
              <span className="text-sky-300">{role.icon}</span>
              <h4 className="font-semibold text-gray-100">{role.label}</h4>
            </div>
            <ul className="bg-gray-800/60 p-5 space-y-2">
              {role.points.map((p, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400/80"></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="mt-10 md:mt-14 text-center">
        <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-indigo-800/30 via-sky-800/30 to-teal-800/30 ring-1 ring-white/10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
            Be part of a safer community
          </h2>
          <p className="mt-2 text-gray-300 max-w-2xl mx-auto">
            Join as a citizen, responder, or admin to make emergency response timely and coordinated.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-sm"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg bg-gray-800 ring-1 ring-white/15 text-gray-100 hover:bg-gray-700"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;

