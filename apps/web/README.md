# Sitecast Web

The documentation and landing page for Sitecast.

## Tech Stack

- Framework: Next.js 14
- Styling: Tailwind CSS v4
- Components: Base UI Components
- Icons: Tabler Icons & React Icons

## Development

First, ensure you have dependencies installed from the repository root:

```bash
# from the root of the turborepo
pnpm install
```

Then, run the development server for the web app:

```bash
# from apps/web
pnpm dev
# or from the root
turbo run dev --filter=web
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The documentation content can be found in `app/docs/page.tsx`.

## Building for Production

To build the application for production:

```bash
# from apps/web
pnpm build
```

The app is configured to be deployed on platforms like Vercel.

## Documentation Structure

The main CLI manual and documentation is located at `/docs` (`app/docs/page.tsx`). It covers:
- Quickstart guide
- System Requirements
- Command Reference (`render`, `doctor`, `setup`)
- Options & Flags
- Troubleshooting common issues
