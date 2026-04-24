export type PopupMenuProps = {
  image: string;
  profile: {
    name: string;
    role: string;
    location: string;
    bio: string;
  };
  contact: {
    email: string;
    phoneNumber: string;
    website: string;
  };
  facts: {
    responseTime: string;
    preferences: string;
  };
  onChat?: () => void;
};

function displayWebsite(url: string) {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.replace(/\/$/, "") || url;
  } catch {
    return url.replace(/^https?:\/\//i, "");
  }
}

const sectionCardClass =
  "rounded-xl border border-indigo-500 bg-indigo-50/90 px-4 py-4 sm:px-5 sm:py-5";
const contactLinkClass = "break-all font-medium text-blue-700 hover:underline";
const plainLinkClass = "font-medium text-blue-700 hover:underline";

function PopupMenu({ image, profile, contact, facts, onChat }: PopupMenuProps) {
  const websiteLabel = displayWebsite(contact.website);
  const phoneHref = `tel:${contact.phoneNumber.replace(/\D/g, "")}`;

  return (
    <div className="mx-auto max-w-4xl rounded-[2rem] border-2 border-indigo-500 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="shrink-0 lg:w-[min(100%,280px)]">
          <img
            className="aspect-[4/5] w-full rounded-2xl border-2 border-indigo-500 object-cover"
            src={image}
            alt={`Photo of ${profile.name}`}
          />
          <h2 className="mt-5 text-xl font-bold text-gray-900">{profile.name}</h2>
          <p className="mt-2 text-[15px] text-gray-700">
            {profile.role}
            <span className="text-gray-400"> · </span>
            {profile.location}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{profile.bio}</p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <section className={sectionCardClass}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Contact</p>
            <ul className="mt-3 space-y-3 text-sm">
              <li>
                <span className="font-medium text-gray-500">Email </span>
                <a className={contactLinkClass} href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </li>
              <li>
                <span className="font-medium text-gray-500">Phone </span>
                <a className={plainLinkClass} href={phoneHref}>
                  {contact.phoneNumber}
                </a>
              </li>
              <li>
                <span className="font-medium text-gray-500">Web </span>
                <a
                  className={contactLinkClass}
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {websiteLabel}
                </a>
              </li>
            </ul>
          </section>

          <section className={sectionCardClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-blue-700">{facts.responseTime}</p>
              <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-blue-700">{facts.preferences}</p>
            </div>
          </section>

          <button
            type="button"
            onClick={() => onChat?.()}
            className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Chat with this Person on Pavilion
          </button>
        </div>
      </div>
    </div>
  );
}

export default PopupMenu;
