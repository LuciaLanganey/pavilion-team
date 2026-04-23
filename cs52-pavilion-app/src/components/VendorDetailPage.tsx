import { useState } from "react";

// ── SVG Icons ──────────────────────────────────────────────────────────────

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const FolderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const HelpCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const HighlightCheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" fill="#dcfce7" />
    <path d="M10 16l4 4 8-8" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="16" r="13" stroke="#16a34a" strokeWidth="1.5" fill="none" />
  </svg>
);

const HighlightPinIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" fill="#dcfce7" />
    <path d="M16 9c-2.76 0-5 2.24-5 5 0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="#16a34a" />
  </svg>
);

const HighlightChatIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" fill="#ccfbf1" />
    <path d="M9 11c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-7l-3 3V11z" stroke="#0f766e" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M12 14h8M12 17h5" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PavilionIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#ede9fe" />
    <path d="M12 28 L20 12 L28 28" stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 28 L15 33" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
    <path d="M25 28 L25 33" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
    <path d="M11 28 L29 28" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ── Data ───────────────────────────────────────────────────────────────────

const navItems = [
  { icon: <HomeIcon />, label: "Home" },
  { icon: <FolderIcon />, label: "Requests" },
  { icon: <ClipboardIcon />, label: "Contracts" },
  { icon: <HelpCircleIcon />, label: "Help" },
];

const highlights = [
  { icon: <HighlightCheckIcon />, text: "Used by education and CA agencies", bg: "bg-green-50" },
  { icon: <HighlightPinIcon />, text: "Local supplier in San Jose", bg: "bg-green-50" },
  { icon: <HighlightChatIcon />, text: "3 recent responses", bg: "bg-teal-50" },
];

const inlineCategories = ["paper", "food service supplies"];
const extraCategories = [
  "janitorial supplies",
  "medical housekeeping supplies",
  "food service products",
  "carpet cleaners",
];

const contacts = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  name: "Larry Mar",
  role: "Sales Representative specializing in sanitizer, cleaning supplies",
  location: "San Jose, CA",
  image: "https://randomuser.me/api/portraits/men/32.jpg",
}));

// ── Component ──────────────────────────────────────────────────────────────

export default function VendorDetailPage() {
  const [contactsOpen, setContactsOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Left Sidebar ── */}
      <aside className="w-[76px] bg-white border-r border-gray-200 flex flex-col items-center pt-3 gap-0 shrink-0">
        <button className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-500 mb-3">
          <MenuIcon />
        </button>

        {/* New Request */}
        <div className="flex flex-col items-center gap-1 mb-5">
          <button className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-light hover:bg-indigo-700 transition-colors">
            +
          </button>
          <span className="text-[10px] text-gray-500 text-center leading-tight">
            New<br />request
          </span>
        </div>

        {/* Nav items */}
        {navItems.map(({ icon, label }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-1 py-2.5 px-1 w-full hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <span className="text-gray-400">{icon}</span>
            <span className="text-[10px] text-gray-500">{label}</span>
          </button>
        ))}
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top Bar ── */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span>
              <span className="text-gray-400">Need:</span>{" "}
              <span className="font-medium text-gray-800">Paper</span>
            </span>
            <span>
              <span className="text-gray-400">Budget:</span>{" "}
              <span className="font-medium text-gray-800">$220,000</span>
            </span>
            <button className="text-indigo-500 hover:text-indigo-700">
              <PencilIcon />
            </button>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center font-semibold text-xs tracking-wide select-none">
              SA
            </div>
            <button className="text-gray-600 hover:text-gray-900 font-medium">Share</button>
            <button className="text-gray-600 hover:text-gray-900 font-medium">Download PDF</button>
            <button className="text-gray-600 hover:text-gray-900 font-medium">Help</button>
          </div>
        </header>

        {/* ── Scrollable Content ── */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* Back link */}
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-5"
          >
            <ArrowLeftIcon />
            Return to search results
          </a>

          <div className="flex gap-5">

            {/* ── Left: Vendor Card ── */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">

                {/* Vendor header */}
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
                  {/* Logo */}
                  <div className="w-[88px] h-[60px] border border-gray-200 rounded-lg flex items-center justify-center shrink-0 bg-white overflow-hidden">
                    <div className="text-center px-1">
                      <div className="text-[9px] font-bold text-gray-700 leading-tight tracking-tight">Imperial</div>
                      <div className="w-full h-[1.5px] bg-gray-700 my-0.5 rounded" />
                      <div className="text-[9px] font-bold text-orange-500 leading-tight tracking-wide">Dade</div>
                    </div>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Imperial Bag &amp; Paper Co LLC
                  </h1>
                </div>

                {/* Business highlights */}
                <section className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Business highlights</h2>
                  <div className="flex gap-3">
                    {highlights.map(({ icon, text, bg }) => (
                      <div
                        key={text}
                        className={`${bg} rounded-lg px-3 py-3 flex flex-col items-center gap-2 flex-1 text-center`}
                      >
                        {icon}
                        <span className="text-xs text-gray-600 leading-snug">{text}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Products and services */}
                <section className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Products and services</h2>
                  <p className="text-sm text-gray-600 mb-2">
                    Imperial Bag &amp; Paper Co LLC serves the following categories:{" "}
                    {inlineCategories.map((cat, i) => (
                      <span key={cat}>
                        <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {cat}
                        </span>
                        {i < inlineCategories.length - 1 && " "}
                      </span>
                    ))}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {extraCategories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs"
                      >
                        {cat}
                      </span>
                    ))}
                    <a href="#" className="px-1 py-1 text-indigo-600 text-xs hover:underline font-medium">
                      See all
                    </a>
                  </div>
                </section>

                {/* About the business */}
                <section>
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">About the business</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Imperial Bag &amp; Paper Co LLC dba Imperial Dade is a leading distributor of foodservice
                    packaging, janitorial supplies, and cleaning products, serving customers across North America,
                    Puerto Rico, and the Caribbean. The company specializes in delivering high-quality products and
                    supply chain solutions to industries such as foodservice, education, healthcare, hospitality,
                    and more. With an expansive distribution network and deep product inventory, Imperial Dade
                    supports its clients with tailored programs in sanitation, sustainability, and facility
                    maintenance. Known for its reliability and service-first approach, Imperial Dade helps
                    organizations...
                  </p>
                </section>
              </div>
            </div>

            {/* ── Right Sidebar ── */}
            <div className="w-[310px] shrink-0 flex flex-col gap-4">

              {/* Backed by Pavilion */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <PavilionIcon />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Backed by Pavilion</div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      If this vendor is slow to respond, we'll follow up for you and help find great
                      alternatives.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() => setContactsOpen((o) => !o)}
                >
                  <span className="font-semibold text-gray-900 text-sm">Contacts</span>
                  <span className={`text-gray-400 transition-transform ${contactsOpen ? "" : "-rotate-90"}`}>
                    <ChevronDownIcon />
                  </span>
                </button>

                {contactsOpen && (
                  <div>
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={contact.image}
                          alt={contact.name}
                          className="w-12 h-12 rounded-full object-cover shrink-0 bg-gray-200"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">{contact.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5 leading-snug">{contact.role}</div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <MapPinIcon />
                            {contact.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
