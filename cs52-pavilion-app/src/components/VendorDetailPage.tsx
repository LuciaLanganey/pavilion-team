import { useState } from "react";
import PopupMenu, { type PopupMenuProps } from "./popup_menu";

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

const PavilionIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#ede9fe" />
    <path d="M12 28 L20 12 L28 28" stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 28 L15 33" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
    <path d="M25 28 L25 33" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
    <path d="M11 28 L29 28" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ContractIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3h8l3 3v15H5V3h3z" />
    <path d="M9 13l2 2 4-5" />
  </svg>
);

const BoltIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);

const TagIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.59 13.41 12 22l-8.59-8.59A2 2 0 0 1 2.83 12V4.83A2 2 0 0 1 4.83 2h7.17a2 2 0 0 1 1.41.59l7.18 7.18a2 2 0 0 1 0 2.83zM7.5 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 5v-5a3 3 0 0 1-3-3V5h3z" />
  </svg>
);

const StorefrontIcon = () => (
  <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h16l-1.5-6h-13L4 10z" />
    <path d="M5 10v9h14v-9" />
    <path d="M9 19v-5h6v5" />
  </svg>
);

// ── Data ───────────────────────────────────────────────────────────────────

const navItems = [
  { icon: <HomeIcon />, label: "Home" },
  { icon: <FolderIcon />, label: "Requests" },
  { icon: <ClipboardIcon />, label: "Contracts" },
  { icon: <HelpCircleIcon />, label: "Help" },
];

type ListHighlightKind = "contract" | "fast" | "discount" | "local" | "response";
type VendorLogoVariant = "cintas" | "instaforce" | "imperial";

type VendorContact = {
  id: number;
  name: string;
  role: string;
  location: string;
  image: string;
  popup: Omit<PopupMenuProps, "onOpenChat">;
};

type Vendor = {
  id: string;
  name: string;
  logoVariant: VendorLogoVariant;
  description: string;
  listHighlights: { kind: ListHighlightKind; text: string }[];
  categories: string[];
  contacts: VendorContact[];
};

const larryMarContacts = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  name: "Larry Mar",
  role: "Sales Representative specializing in sanitizer, cleaning supplies",
  location: "San Jose, CA",
  image: "https://randomuser.me/api/portraits/men/32.jpg",
  popup: {
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    profile: {
      name: "Larry Mar",
      role: "Sales Representative specializing in sanitizer, cleaning supplies",
      location: "San Jose, CA",
      bio: "Larry supports California schools and agencies with tailored sanitizer and cleaning programs, quick samples, and reliable follow-through on large bids.",
    },
    contact: {
      email: "larry.mar@imperialdade.com",
      phoneNumber: "(408) 555-0142",
      website: "https://www.imperialdade.com",
    },
    facts: {
      responseTime: "Typically replies within one business day on Pavilion requests.",
      preferences: "Prefers detailed line-item RFPs and can coordinate on-site walkthroughs in the Bay Area.",
    },
  },
}));

const vendors: Vendor[] = [
  {
    id: "cintas",
    name: "Cintas Corporation",
    logoVariant: "cintas",
    description:
      "Cintas powers state and local agencies with essential solutions from uniforms and facility services to safety gear, compliance training, and emergency preparedness. Trusted by over 1 million businesses, we help government teams operate cleaner, safer, and more efficiently.",
    listHighlights: [
      { kind: "contract", text: "Has cooperative contracts" },
      { kind: "fast", text: "Responds in <24 hrs" },
      { kind: "discount", text: "Government discount" },
    ],
    categories: [
      "Cleaning services",
      "Uniform laundry services",
      "Laundry services",
      "Uniform services",
      "First aid services",
    ],
    contacts: larryMarContacts,
  },
  {
    id: "instaforce",
    name: "INSTAFORCE",
    logoVariant: "instaforce",
    description:
      "INSTAFORCE is a San Rafael, CA-based facility and property maintenance contractor that specializes in maintaining commercial and retail properties. It offers a wide range of services including carpentry, repairs, remodeling, fixture installation, electrical and plumbing work, flooring, painting, exterior cleaning, concrete repairs, and disaster recovery services such as flood and water damage mitigation.",
    listHighlights: [
      { kind: "contract", text: "Has cooperative contracts" },
      { kind: "local", text: "Local supplier in San Rafael" },
      { kind: "response", text: "1 recent response" },
    ],
    categories: ["Facility maintenance", "Property repairs", "Exterior cleaning", "Disaster recovery", "Remodeling"],
    contacts: larryMarContacts,
  },
  {
    id: "imperial-dade",
    name: "Imperial Bag & Paper Co LLC",
    logoVariant: "imperial",
    description:
      "Imperial Dade is a leading distributor of foodservice packaging, janitorial supplies, cleaning products, and facility maintenance essentials. It supports education, healthcare, hospitality, and government buyers with broad inventory and practical supply chain programs.",
    listHighlights: [
      { kind: "contract", text: "Used by education and CA agencies" },
      { kind: "local", text: "Local supplier in San Jose" },
      { kind: "response", text: "3 recent responses" },
    ],
    categories: ["Paper", "Food service supplies", "Janitorial supplies", "Medical housekeeping supplies", "Carpet cleaners"],
    contacts: larryMarContacts,
  },
];

function ListHighlightIcon({ kind }: { kind: ListHighlightKind }) {
  const classes = kind === "fast" ? "text-lime-500" : kind === "local" ? "text-teal-500" : kind === "response" ? "text-teal-600" : "text-lime-500";

  if (kind === "fast") {
    return <span className={classes}><BoltIcon /></span>;
  }

  if (kind === "discount") {
    return <span className={classes}><TagIcon /></span>;
  }

  if (kind === "local") {
    return <span className={classes}><MapPinIcon /></span>;
  }

  if (kind === "response") {
    return <span className={classes}><ChatBubbleIcon /></span>;
  }

  return <span className={classes}><ContractIcon /></span>;
}

function VendorLogo({ vendor }: { vendor: Vendor }) {
  if (vendor.logoVariant === "cintas") {
    return (
      <div className="flex h-11 w-14 items-center justify-center rounded-lg bg-white text-center">
        <div>
          <div className="text-[8px] font-extrabold leading-none text-blue-900">CINTAS</div>
          <div className="mt-0.5 text-[5px] font-bold leading-none text-red-500">READY FOR THE WORKDAY</div>
        </div>
      </div>
    );
  }

  if (vendor.logoVariant === "imperial") {
    return (
      <div className="flex h-11 w-14 items-center justify-center rounded-lg bg-white text-center">
        <div>
          <div className="text-[8px] font-bold leading-tight tracking-tight text-gray-700">Imperial</div>
          <div className="my-0.5 h-[1.5px] w-full rounded bg-gray-700" />
          <div className="text-[8px] font-bold leading-tight tracking-wide text-orange-500">Dade</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-50 text-violet-200">
      <StorefrontIcon />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function VendorDetailPage({ onOpenChat }: { onOpenChat?: () => void }) {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [contactsOpen, setContactsOpen] = useState(true);
  const [contactPopupId, setContactPopupId] = useState<number | null>(null);
  const selectedVendor = vendors.find((vendor) => vendor.id === selectedVendorId) ?? null;
  const selectedContact = selectedVendor?.contacts.find((contact) => contact.id === contactPopupId) ?? null;

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

        {/* ── Content ── */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">

          {/* Back link */}
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-5"
          >
            <ArrowLeftIcon />
            Return to search results
          </a>

          <div className="grid min-h-0 flex-1 grid-cols-[minmax(620px,1fr)_340px] gap-5">
            <section className="min-w-0 overflow-y-auto pr-1">
              <div className="space-y-5 pb-4">
                {vendors.map((vendor) => (
                  <button
                    key={vendor.id}
                    type="button"
                    className={`w-full rounded-[1.75rem] border bg-white p-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      selectedVendorId === vendor.id ? "border-indigo-400 ring-2 ring-indigo-100" : "border-gray-200"
                    }`}
                    onClick={() => {
                      setSelectedVendorId(vendor.id);
                      setContactsOpen(true);
                      setContactPopupId(null);
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <VendorLogo vendor={vendor} />
                        <h1 className="truncate text-xl font-semibold text-gray-950 underline decoration-2 underline-offset-2">
                          {vendor.name}
                        </h1>
                      </div>
                      <a
                        href={`mailto:hello@${vendor.id}.example`}
                        className="shrink-0 rounded-2xl border border-indigo-700 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Email this vendor
                      </a>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-[15px] text-gray-700">
                      {vendor.listHighlights.map((highlight) => (
                        <div key={highlight.text} className="flex items-center gap-2">
                          <ListHighlightIcon kind={highlight.kind} />
                          <span>{highlight.text}</span>
                        </div>
                      ))}
                    </div>

                    <p className="mt-5 line-clamp-4 text-[15px] leading-relaxed text-gray-700">
                      {vendor.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {vendor.categories.map((category, index) => (
                        <span
                          key={category}
                          className={`rounded-full px-3 py-1 text-sm text-gray-700 ${
                            index === 0 ? "bg-gray-200 font-semibold" : "bg-gray-100"
                          }`}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="min-w-0 overflow-y-auto">
              {!selectedVendor ? (
                <div className="flex min-h-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
                  <p className="text-lg font-semibold text-gray-500">Click a vendor to learn more</p>
                </div>
              ) : (
                <div className="flex justify-end pb-4">
                  <div className="flex w-[310px] flex-col gap-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <PavilionIcon />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">Backed by Pavilion</div>
                          <p className="mt-1 text-xs leading-relaxed text-gray-500">
                            If this vendor is slow to respond, we'll follow up for you and help find great
                            alternatives.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      <button
                        className="flex w-full items-center justify-between border-b border-gray-200 px-4 py-3.5 transition-colors hover:bg-gray-50"
                        onClick={() => setContactsOpen((o) => !o)}
                      >
                        <span className="text-sm font-semibold text-gray-900">Contacts at {selectedVendor.name}</span>
                        <span className={`text-gray-400 transition-transform ${contactsOpen ? "" : "-rotate-90"}`}>
                          <ChevronDownIcon />
                        </span>
                      </button>

                      {contactsOpen && (
                        <div>
                          {selectedVendor.contacts.map((contact) => (
                            <button
                              key={contact.id}
                              type="button"
                              className="flex w-full cursor-pointer items-start gap-3 border-b border-gray-100 px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-indigo-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                              onClick={() => setContactPopupId(contact.id)}
                              aria-label={`Open profile for ${contact.name}`}
                            >
                              <img
                                src={contact.image}
                                alt=""
                                className="h-12 w-12 shrink-0 rounded-full bg-gray-200 object-cover"
                              />
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900">{contact.name}</div>
                                <div className="mt-0.5 text-xs leading-snug text-gray-500">{contact.role}</div>
                                <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                  <MapPinIcon />
                                  {contact.location}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {selectedContact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => setContactPopupId(null)}
        >
          <div
            className="relative max-h-[min(90vh,900px)] w-full max-w-4xl overflow-y-auto rounded-[2rem] pt-12 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-popup-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700 shadow ring-1 ring-gray-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              onClick={() => setContactPopupId(null)}
            >
              Close
            </button>
            <div id="contact-popup-title" className="sr-only">
              {selectedContact.popup.profile.name} profile
            </div>
            <PopupMenu {...selectedContact.popup} onOpenChat={onOpenChat} />
          </div>
        </div>
      )}
    </div>
  );
}
