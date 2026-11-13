# MASTER DEVELOPMENT PROMPT
## OLIYARUVI DIGITAL COLOUR LAB
### Premium Cinematic Website + Complete Visual Admin CMS

You are a senior full-stack architect, UI/UX designer, creative frontend developer, database engineer, and security-focused software engineer.

Build a production-ready, premium, cinematic, fully responsive photography and digital printing website for **Oliyaruvi Digital Colour Lab**, located in Nelliady, Jaffna, Sri Lanka.

**This is not just a photography portfolio.** It is a complete business website for photography, videography, live streaming, photo printing, wedding albums, custom gifts, frames, banners, stickers, laser-cut products and other digital printing services.

The website must have two integrated applications:

1. A premium public-facing website.
2. A powerful private CMS/admin dashboard controlling the entire public website.

Use all attached reference images as the primary visual inspiration. The website should feel like a luxury South Indian/Tamil photography brand with cinematic storytelling, sophisticated motion and carefully designed 3D elements.

Do not simply reproduce a static screenshot. Build real, reusable, responsive, database-driven components.

---

# 1. BUSINESS IDENTITY

Business name: Oliyaruvi Digital Colour Lab

Tamil name: ஒளியருவி டிஜிட்டல் கலர் லேப்

Location: Nelliady, Jaffna, Sri Lanka

Contact numbers:
- 0773928215
- 0777241958

WhatsApp: Admin-configurable number, initially using the primary business contact.

Experience: 32 years, subject to admin editing.

Brand personality:
- Premium
- Trustworthy
- Tamil cultural identity
- Creative
- Modern
- Cinematic
- Professional
- Customer-friendly

Use real business photos, logos, and videos when uploaded. Never present generated images as genuine Oliyaruvi work.

---

# 2. DESIGN SYSTEM

Use the attached website images as the visual baseline.

Visual direction:
- Luxury dark charcoal backgrounds
- Elegant antique gold accents
- Warm cinematic lighting
- Subtle maroon highlights
- Premium serif headings
- Clean sans-serif body typography
- Tamil and English language support
- Tasteful kolam and temple-inspired decorative elements
- Large photography and generous whitespace

Suggested palette:

Background: #0B0B0D
Surface: #17171B
Gold: #D6AC57
Light Gold: #F3D58C
Maroon: #651C2A
Primary Text: #F7F3EB
Muted Text: #B8B1A8

These must be editable through the admin Theme Manager.

Typography:
- English headings: Playfair Display or Cormorant Garamond
- English body: Inter
- Tamil: Noto Sans Tamil and a suitable Tamil display font

Ensure correct Tamil Unicode rendering.

Design rules:
- Short headings
- Minimal paragraphs
- Large photographs
- Clean layouts
- Consistent spacing
- Strong visual hierarchy
- Clear action buttons
- No excessive glowing effects
- No overcrowded screens
- No unnecessary animations

The public site must feel more spacious and refined than the reference mockups.

---

# 3. PUBLIC WEBSITE PAGES

Build the following pages using reusable, CMS-controlled sections.

## 3.1 Homepage

Include:
- Cinematic background video or photography slider
- Logo and navigation
- Short Tamil/English hero heading
- Photography portfolio CTA
- WhatsApp enquiry CTA
- Five service categories:
  - Photography
  - Videography
  - Printing
  - Custom Gifts
  - Live Streaming
- Experience highlight
- Featured photographs
- Featured videos
- Featured live event
- Printing and gift highlights
- Customer testimonials
- Contact section
- Footer

Hero content should be editable through admin.

Admin must be able to switch between image, video and slider backgrounds.

## 3.2 Photography

Categories:
- Weddings
- Engagements
- Pre-weddings
- Birthdays
- Family events
- Temple festivals
- School events
- Portraits
- Other events

Include masonry galleries, fullscreen lightboxes, album collections and category filtering.

Every image must be uploaded and managed through the CMS.

## 3.3 Videography

Include:
- Wedding films
- Highlight videos
- Pre-wedding films
- Birthday films
- Temple festival videos
- Promotional videos
- Event coverage

Support YouTube embeds and uploaded video files.

Use cinematic thumbnails and modal playback.

## 3.4 Live Streaming

Create a dedicated Live Streaming page.

Support:
- Facebook Live
- YouTube Live
- Yarl Rip Book
- Yarl Events
- Yarl Tharisanam

The last three are configurable channel identities, not assumed streaming platforms.

Display:
- Featured live event
- Live / Upcoming / Ended status
- Event title
- Event thumbnail
- Event date and time
- Facebook watch link
- YouTube watch link
- Channel identity
- Upcoming events
- Past broadcasts
- Replay videos

Support embeddable streams where the provider permits embedding. Otherwise show a working external watch link.

Do not invent channel URLs or broadcast availability.

The website should never show a false LIVE badge. Status must be controlled by verified provider state or explicitly marked as manually managed by admin.

## 3.5 Printing Services

Categories:
- Photo printing
- Passport and ID photos
- Wedding albums
- Banner printing
- Flex printing
- Cloth banners
- Stickers
- Large-format printing
- Frames
- Name boards
- Other printing services

Show product photographs, descriptions, size options, materials and enquiry buttons.

Optional prices must be admin-controlled.

## 3.6 Custom Gifts

Include:
- Printed mugs
- Phone covers
- Medals
- Trophies
- Mementos
- Crystal gifts
- Photo frames
- Keychains
- Personalized gifts

Each product must support images, descriptions, variants, optional prices and WhatsApp enquiries.

## 3.7 About Us

Include:
- Business introduction
- Experience
- Studio story
- Team
- Equipment and facilities
- Milestones
- Customer trust
- Photo gallery

All content must be editable. Do not invent company milestones or staff identities.

## 3.8 Booking

Create a booking enquiry form supporting:
- Customer name
- Phone number
- Email (optional)
- Service
- Event date
- Location
- Requirements
- Optional reference files

Store enquiries securely in the database.

Do not promise confirmed bookings automatically. Admin must review and confirm them.

## 3.9 Contact

Include:
- Phone numbers
- WhatsApp
- Address
- Map
- Social links
- Enquiry form
- Business hours

Business hours and map location must be entered or verified by admin.

---

# 4. COMPLETE ADMIN CMS

This is the highest-priority requirement.

**The owner must be able to manage the entire public website without touching code.**

Create a secure admin dashboard at `/admin`.

The dashboard must support:

### Dashboard
- Website overview
- Real visitor analytics when configured
- Enquiry statistics
- Orders
- Bookings
- Live events
- Recent activity
- Quick actions

Never display fake analytics as real data.

### Visual Page Builder
- Create pages
- Edit pages
- Duplicate pages
- Delete pages
- Publish/unpublish
- Drag-and-drop section ordering
- Add/remove predefined section blocks
- Edit headings and paragraphs
- Edit images and videos
- Change section backgrounds
- Edit buttons and links
- Configure animations
- Desktop/mobile previews
- Draft mode
- Publish workflow
- Version history
- Restore previous versions

Use a schema-driven block architecture.

Supported block types:
- Hero
- Video hero
- Image slider
- Text
- Image
- Gallery
- Video gallery
- Services
- Product grid
- Live events
- Testimonials
- Statistics
- FAQ
- Contact form
- CTA
- Custom layout sections

Every public page should be rendered from stored page and section data.

Do not build a page editor that only changes text while keeping the rest hardcoded.

### Media Library
- Upload photos
- Upload supported videos
- Replace media
- Delete media safely
- Organize folders and categories
- Image metadata
- Alt text
- Image optimization
- Reusable media selection
- Storage quota and validation

### Navigation Manager
- Add menu items
- Rename items
- Reorder items
- Hide items
- Configure dropdowns
- Set internal/external links
- Edit mobile navigation

### Theme Manager
- Colours
- Typography
- Buttons
- Backgrounds
- Border styles
- Section spacing
- Animation presets
- Header styles
- Footer styles

Provide global settings plus safe per-section overrides.

### Photography Manager
- Albums
- Categories
- Photo ordering
- Cover photos
- Visibility
- Featured galleries

### Videography Manager
- Video titles
- Categories
- Thumbnails
- YouTube links
- Uploaded videos
- Featured videos

### Live Event Manager
- Create/edit/delete events
- Event title
- Description
- Thumbnail
- Event date/time
- Facebook URL
- YouTube URL
- Channel association
- Draft / Upcoming / Live / Ended status
- Replay URL
- Featured event selection
- Publish/unpublish

Allow multiple broadcast links for one event.

Include dedicated management for Yarl Rip Book, Yarl Events and Yarl Tharisanam.

### Printing & Product Manager
- Create products
- Product categories
- Product images
- Sizes
- Materials
- Variants
- Optional prices
- Availability
- Featured products
- Enquiry links

### Booking & Enquiry Manager
- View submissions
- Filter by service/status/date
- Assign staff
- Update status
- Add internal notes
- Export permitted records
- Contact customer through WhatsApp

### Order Manager
- Create/manage printing orders
- Customer details
- Products and quantities
- Pricing
- Payment status
- Production status
- Delivery/pickup status
- Internal notes

Do not implement live payment collection unless separately configured and approved.

### Content Managers
- About Us
- Testimonials
- FAQs
- Contact details
- Social media links
- Footer
- SEO metadata
- Site announcements

### Users & Roles
Implement:
- Super Admin
- Content Editor
- Media Manager
- Order Manager
- Live Event Manager

Enforce permissions on the server and in the database, not only by hiding UI controls.

### Audit & Recovery
- Track admin actions
- Record publish history
- Soft delete where appropriate
- Restore previous content
- Protect against accidental deletion

---

# 5. TECHNICAL ARCHITECTURE

Use:

Frontend:
- React with TypeScript
- Vite and React Router
- Tailwind CSS
- Accessible component library
- Framer Motion / Motion
- GSAP for selected scroll effects
- Three.js / React Three Fiber for selective 3D visuals

Backend:
- Node.js with Express
- Request validation with Zod
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage

The React app and the Node.js API live in one repository. The browser talks to the Node API. The Node server is the only place that holds the Supabase service-role key.

Hosting:
- Vercel for the first production deployment
- The same Node process must also be able to serve the built React app and the API on another server later

Do not use Vercel-only databases, file storage, or edge services. Configuration belongs in environment variables so a future server needs new values, not new application code. Supabase remains the database when the website moves; self-hosting Supabase is a later, separate choice.

Use a maintainable, modular architecture.

Separate:
- Public website components
- Admin components
- CMS rendering engine
- Database services
- Authentication
- Media handling
- Live event integrations
- Shared UI components

Implement server-side validation using Zod or an equivalent schema library.

Use environment variables for secrets.

Never expose service-role keys to the browser.

---

# 6. DATABASE DESIGN

Design a normalized relational schema supporting:

- users and roles
- site settings
- theme settings
- pages
- page revisions
- page sections
- navigation menus
- media assets
- photo albums
- photographs
- video collections
- videos
- live channels
- live events
- event broadcast links
- products
- product categories
- product variants
- bookings
- enquiries
- customers
- orders
- order items
- testimonials
- SEO metadata
- audit logs

Provide SQL migrations, constraints, indexes and appropriate row-level security policies.

All CMS content must persist after refresh and redeployment.

---

# 7. MULTILINGUAL SUPPORT

Support Tamil and English.

Admin must be able to edit content separately for each language.

Include a language switcher.

Ensure:
- Proper Tamil fonts
- Unicode support
- Localized navigation
- Localized headings
- Localized product content
- Fallback translations
- Correct metadata

Do not use automatically generated Tamil text as verified business copy.

---

# 8. ANIMATIONS AND 3D

Create a premium cinematic experience with:
- Smooth hero transitions
- Subtle parallax
- Elegant section reveals
- Gallery hover interactions
- Animated service cards
- Refined page transitions
- Optional 3D photo frames
- Interactive album previews

Animations must remain lightweight.

Respect `prefers-reduced-motion`.

Avoid excessive animation on mobile.

Never sacrifice accessibility or performance for visual effects.

---

# 9. RESPONSIVENESS

Design for:
- Desktop
- Laptop
- Tablet
- Mobile

Prioritize mobile usability.

Ensure:
- Responsive navigation
- Readable typography
- Touch-friendly controls
- Optimized image sizes
- Responsive video players
- Accessible forms
- No horizontal overflow

---

# 10. SECURITY

Implement:
- Secure authentication
- Server-side authorization
- Row-level security
- Role-based permissions
- Input validation
- Safe file uploads
- File size/type restrictions
- Rate limiting on public forms
- Anti-spam protection
- CSRF-safe authentication flows
- Secure session handling
- Audit logs

Protect private customer information.

Do not expose unpublished content or private media through public APIs.

---

# 11. SEO AND PERFORMANCE

Implement:
- Server-side rendering where appropriate
- Metadata per page
- Open Graph images
- Sitemap
- Robots configuration
- Structured data for the business
- Semantic HTML
- Accessible navigation
- Lazy-loaded galleries
- Responsive images
- Optimized video delivery
- Image compression
- Caching
- Error boundaries

Target strong Core Web Vitals and WCAG 2.2 AA accessibility.

Use performance measurements rather than claiming perfect scores.

---

# 12. REAL FUNCTIONALITY REQUIREMENTS

No fake buttons.

No decorative forms that do nothing.

No fake admin statistics.

No nonfunctional dashboard controls.

Every implemented control must perform its advertised action.

If a feature requires an external API, credential or configuration, provide a working configuration interface or clearly mark it as not yet connected.

All changes published from admin must appear on the public website without requiring code changes or manual redeployment.

Use a safe cache invalidation strategy.

---

# 13. DEVELOPMENT WORKFLOW

Work in phases.

**Phase 1 — Planning**
1. Inspect the repository.
2. Review all attached design images.
3. Produce a technical architecture.
4. Define routes and components.
5. Design the database.
6. Create an implementation plan.

**Phase 2 — Foundation**
1. Initialize the project.
2. Configure TypeScript and Tailwind.
3. Create the design system.
4. Set up Supabase integration.
5. Add authentication.
6. Create reusable layouts.

**Phase 3 — Public Website**
Implement the homepage and all public pages using CMS-rendered components.

**Phase 4 — Admin CMS**
Build the dashboard, visual page builder, media library, content managers and publishing workflow.

**Phase 5 — Business Features**
Implement live event management, products, bookings, enquiries and orders.

**Phase 6 — Integration**
Connect every public page and component to the CMS and database.

**Phase 7 — Testing**
Test:
- Authentication
- Authorization
- CRUD operations
- Media uploads
- Draft/publish
- Live event links
- Forms
- Responsive layouts
- Tamil rendering
- SEO
- Performance
- Security

**Phase 8 — Deployment**
Prepare Vercel deployment, a portable Node.js server deployment for a future host, environment variable documentation, and database migration instructions.

---

# 14. DEFINITION OF DONE

The project is complete only when:

1. All public pages are responsive and functional.
2. Every editable section is controlled through admin.
3. Admin can create and manage pages without code.
4. Navigation is editable.
5. Images and videos are manageable.
6. Live events and channels are manageable.
7. Products and prices are editable.
8. Bookings and enquiries are stored.
9. Orders can be managed.
10. Tamil and English work correctly.
11. Role-based access is enforced.
12. Draft, preview and publish work.
13. Content survives deployment.
14. Core workflows have automated tests.
15. Deployment instructions are complete.

---

# 15. IMPORTANT EXECUTION INSTRUCTIONS

Do not attempt to implement the entire application in one enormous code generation step.

First:
- Analyze the reference images.
- Inspect the current project.
- Propose the architecture.
- Generate a complete phased task list.
- Identify required credentials and external dependencies.
- Explain the database and CMS strategy.

Then implement one phase at a time.

For each phase:
- Write actual working code.
- Avoid unnecessary dependencies.
- Run type checking.
- Run linting.
- Run relevant tests.
- Fix errors.
- Summarize completed work.
- Identify remaining tasks.

Do not claim features are finished unless they have been implemented and verified.

Use sensible defaults when details are missing, but clearly distinguish placeholders from verified business information.

**Final objective:**

Deliver a premium, cinematic, Tamil-inspired, fully dynamic Oliyaruvi Digital Colour Lab website where the business owner can control the entire public website through one secure, professional admin CMS.
