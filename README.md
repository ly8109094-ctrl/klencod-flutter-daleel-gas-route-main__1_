# Daleel Gas Route

Build a responsive Arabic RTL web app called "Daleel Al-Gas" to manage household gas cylinder distribution in Abyan, Yemen.

Tech: React, TypeScript, Tailwind CSS. Create all pages and components from scratch. Use consistent mock data only. Do not configure Supabase, authentication, or a real database yet.

Design: Mobile-first for Android, Arabic UI, dark green and white with gold accents, clean dashboard, simple navigation, and reusable components.

1. Factory Portal

Dashboard: agent count, allocated, distributed, and remaining quotas.

Manage agents and their areas.

Create gas batches and assign quotas per agent.

Reports and archived batches.

Settings toggle for citizen ID collection, OFF by default.

Factory login page mockup.

2. Agent Portal

Dashboard showing received, distributed, and remaining quota.

Mock agent login page.

Delivery form: recipient name, quantity, date, and time.

Show the optional citizen ID field only when enabled by factory settings.

Agents cannot edit factory-assigned quotas.

3. Public Portal

List agents, areas, quotas, and distribution progress.

Agent details with recipient names, delivery dates, and quantities.

Search recipient names.

Never display citizen IDs or phone numbers publicly.

Business Rules

Remaining quota = received quota - approved deliveries + documented adjustments.

Never delete old batches; close and archive them.

Separate factory, agent, and public interfaces.

Use consistent mock data and functional navigation.

Clearly label demo data and mock login screens.

UI visibility is not security; real database permissions will be implemented later.

Important: No phone number fields anywhere. Build the complete frontend and user experience only. Keep the code modular and lightweight. Do not add backend integrations or claim security features are implemented.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/423be6ce-2647-42de-a429-09c65469c0f7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
