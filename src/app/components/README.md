# Reusable Components

## ContactModal
A modal dialog for contact form submissions.

```tsx
import { ContactModal } from "@/app/components/ContactModal";

const [contactOpen, setContactOpen] = useState(false);

// Trigger
<button onClick={() => setContactOpen(true)}>Contact Us</button>

// Modal
{contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
```

## Navbar
Navigation bar with logo, theme toggle, and optional contact/auth buttons.

```tsx
import { Navbar } from "@/app/components/Navbar";

// With contact button and auth buttons
<Navbar onContactClick={() => setContactOpen(true)} />

// Without auth buttons (for logged-in users)
<Navbar onContactClick={() => setContactOpen(true)} showAuthButtons={false} />

// Without contact button
<Navbar />
```

## Footer
Footer with copyright, optional credit, and optional contact button.

```tsx
import { Footer } from "@/app/components/Footer";

// With credit and contact button
<Footer onContactClick={() => setContactOpen(true)} />

// Without credit
<Footer showCredit={false} onContactClick={() => setContactOpen(true)} />

// Without contact button
<Footer />
```

## Home Components
Hero, Stats, and Features are specific to the homepage but can be reused:

```tsx
import { Hero } from "@/app/components/home/Hero";
import { Stats } from "@/app/components/home/Stats";
import { Features } from "@/app/components/home/Features";

<Hero />
<Stats />
<Features />
```
