Faculty Palace is a Next.js assessment auditing workspace with Supabase-backed role authentication.

## Run locally

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and add the project URL and anon key.
3. Run `database/supabase.sql` in Supabase Dashboard > SQL Editor.
4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

Supabase Auth stores credentials and sessions. The `profiles` table stores the Faculty Palace role. New public registrations create Course Instructor accounts; Department Head and External Examiner roles should be assigned by an administrator in Supabase.

To create the optional demo accounts, open Supabase Dashboard > Authentication > Users and create these users with password `AssessIQDemo123!`:

| Role | Email |
| --- | --- |
| Department Head | `sarah.rahman@institution.edu` |
| Course Instructor | `arjun.mehta@institution.edu` |
| External Examiner | `david.chen@external-board.edu` |

After creating them, run this in the Supabase SQL Editor to assign their roles:

```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'sarah.rahman@institution.edu');
update public.profiles set role = 'faculty' where id = (select id from auth.users where email = 'arjun.mehta@institution.edu');
update public.profiles set role = 'reviewer' where id = (select id from auth.users where email = 'david.chen@external-board.edu');
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
