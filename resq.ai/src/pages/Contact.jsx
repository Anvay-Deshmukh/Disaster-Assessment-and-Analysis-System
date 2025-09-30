import { useState } from "react";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMsg, setLastMsg] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending logic (replace with EmailJS / backend)
    setTimeout(() => {
      setLastMsg({
        name,
        email,
        subject,
        message,
        time: new Date().toLocaleString(),
      });

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setLoading(false);
      alert("✅ Message sent successfully!");
    }, 1500);
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-teal-400">📩 Contact Us</h2>
        <p className="mt-2 text-gray-300 max-w-2xl mx-auto">
          Have a question, idea, or feedback? Fill the form and we’ll get back
          to you soon.
        </p>
      </section>

      {/* Contact Form */}
      <section className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-teal-400 mb-4">
          Send a Message
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
            required
          />

          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
            required
          />

          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
          />

          <textarea
            placeholder="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
            rows={5}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg shadow font-semibold w-full"
          >
            {loading ? "⏳ Sending..." : "📩 Send Message"}
          </button>
        </form>
      </section>

      {/* Last Message */}
      {lastMsg && (
        <section className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-yellow-400">
            ✅ Last Message Sent
          </h3>
          <ul className="mt-3 text-gray-300 space-y-1">
            <li>
              <strong className="text-teal-400">Name:</strong> {lastMsg.name}
            </li>
            <li>
              <strong className="text-teal-400">Email:</strong> {lastMsg.email}
            </li>
            <li>
              <strong className="text-teal-400">Subject:</strong>{" "}
              {lastMsg.subject || "N/A"}
            </li>
            <li>
              <strong className="text-teal-400">Message:</strong>{" "}
              {lastMsg.message}
            </li>
            <li>
              <strong className="text-teal-400">Time:</strong> {lastMsg.time}
            </li>
          </ul>
        </section>
      )}
    </div>
  );
}

export default Contact;
