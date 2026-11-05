import type { CaseStudy } from './schema.js'

export const CASE_STUDIES: Record<string, CaseStudy> = {
  clinicflow: {
    role: 'Solo: design, front end, API, database and deploy',
    deploy: 'Docker · AWS EC2 · Caddy · GitHub Actions',
    layers: [
      {
        name: 'Client',
        tech: 'React · Ant Design · Tailwind',
        title: 'Showing the right slots to every patient',
        problem:
          'Patients open the site from phones set to any timezone, but the clinic works in Cairo time. A slot shown as 4:15 on one phone could mean a different hour on another, and the page had to work in Arabic (RTL) and English.',
        decision:
          'Every date is converted to Africa/Cairo with dayjs before it is shown, whatever the device says. React Query caches the free slots and refetches them right after a booking, so the calendar never offers a slot that was just taken. Pages are lazy loaded, with RTL and dark mode built into the theme.',
      },
      {
        name: 'Server',
        tech: 'Express 5 + TypeScript',
        title: 'Two patients, one slot, the same second',
        problem:
          'Checking "is this slot free?" and then inserting the booking leaves a gap. Two requests that arrive together can both pass the check and both book the same time.',
        decision:
          'The API does not try to win that race in code. It inserts the booking and lets the database reject the second one, then turns that rejection into a clear 409 "this slot was just booked". Free slots come from one function shared by the availability endpoint and the booking endpoint, so they can never disagree.',
      },
      {
        name: 'Database',
        tech: 'PostgreSQL · Drizzle ORM',
        title: 'Making double booking impossible',
        problem:
          'Appointments, working hours and days off all overlap in time, and a rule written only in the API can be skipped by a bug or a second server.',
        decision:
          'An exclusion constraint on the appointment time range blocks two BOOKED appointments from overlapping, at the database level. 30 integration tests run with Vitest and Supertest against a real PostgreSQL database, including the double-booking case.',
      },
      {
        name: 'Deploy',
        tech: 'Docker · EC2 · Caddy',
        title: 'From a merge to a live server, with no manual steps',
        problem:
          'Uploading a Docker image from home was slow and kept timing out, and every release needed someone to log in to the server.',
        decision:
          'GitHub Actions tests every pull request and, on merge to main, builds one image (API + React build) and pushes it to Docker Hub. The EC2 server pulls new images on its own, restarts the app and waits for /health. Caddy serves it with automatic HTTPS, with Neon for PostgreSQL and Brevo for email.',
      },
    ],
    results: [
      'Live at clinicflow-eg.duckdns.org with HTTPS',
      'Double booking blocked by the database, not just the API',
      '30 integration tests on every pull request',
      'Every merge to main is deployed automatically',
    ],
    screenshots: [
      {
        src: '/projects/clinicflow/book-en.png',
        alt: 'ClinicFlow booking page: a calendar on the left and the free time slots for Saturday on the right',
        caption: 'Booking: pick a day, then one of the free slots, all in clinic time',
      },
      {
        src: '/projects/clinicflow/book-ar-dark.png',
        alt: 'The same booking page in Arabic, right to left, in dark mode',
        caption: 'The same page in Arabic (RTL) and dark mode',
      },
      {
        src: '/projects/clinicflow/services-ar-dark.png',
        alt: 'ClinicFlow services list in Arabic with the opening hours on the side',
        caption: 'Services and opening hours',
      },
      {
        src: '/projects/clinicflow/book-mobile.png',
        alt: 'ClinicFlow booking page on a phone',
        caption: 'Built mobile first',
        mobile: true,
      },
    ],
  },

  'contract-review-pipeline': {
    role: 'Solo: workflows, API and review console',
    deploy: 'Temporal server · systemd on Linux',
    layers: [
      {
        name: 'Client',
        tech: 'React · TypeScript · Vite',
        title: 'Following a run that can take days',
        problem:
          'A review moves through extracting, analyzing and awaiting review, and can sit waiting for a person for days. The reviewer needs to see where each run is and act on it.',
        decision:
          'The console polls the run status and shows each stage live, then lets the reviewer approve the report or send it back with feedback. It supports RTL and light/dark themes.',
      },
      {
        name: 'API',
        tech: 'FastAPI',
        title: 'A thin front door to Temporal',
        problem:
          'The browser should never talk to Temporal directly, and the API must not hold run state itself, or a restart would lose it.',
        decision:
          'A stateless FastAPI service starts workflows, sends signals and updates, and reads queries. All state stays in Temporal, so the API can restart at any time.',
      },
      {
        name: 'Worker',
        tech: 'Temporal · Python',
        title: 'Surviving restarts while waiting for a human',
        problem:
          'Each contract has to be summarized by an LLM, one failure should not sink the whole batch, and the run then has to wait up to 3 days for review without holding memory.',
        decision:
          'One child workflow per contract runs in parallel, then an LLM step writes one cross-contract risk report. The run waits on a timer that costs nothing, and a Temporal update with a server-side validator handles approve or send back. Workers can restart mid-review and lose nothing.',
      },
      {
        name: 'Deploy',
        tech: 'systemd · Linux',
        title: 'Four processes that only talk through Temporal',
        problem: 'The Temporal server, the worker, the API and the console all have to run and recover on their own.',
        decision:
          'The Temporal server runs as a systemd service on Linux, and the other parts only ever talk to each other through it, so any one of them can be restarted alone.',
      },
    ],
    results: [
      'A run can wait 3 days for review without holding resources',
      'Workers restart mid-review without losing state',
      'One failed contract does not stop the others',
    ],
  },

  'nasa-mission-control': {
    role: 'Solo: client, API and deploy',
    deploy: 'Docker · AWS EC2 · GitHub Actions',
    layers: [
      {
        name: 'Client',
        tech: 'React',
        title: 'Scheduling and aborting launches',
        problem: 'Users need to schedule a launch to a target planet, see upcoming and past launches, and abort one.',
        decision:
          'A React client talks only to the REST API. In production it is built and served by Express from the same image, so there is one origin and no CORS setup.',
      },
      {
        name: 'Server',
        tech: 'Express + TypeScript',
        title: 'A typed REST API with real tests',
        problem: 'Launch data comes in from the browser and has to be checked before it is saved.',
        decision:
          'A REST API in Node.js, Express and TypeScript validates every request. Jest and Supertest integration tests run in GitHub Actions on Node 20 and 22.',
      },
      {
        name: 'Database',
        tech: 'MongoDB Atlas · Mongoose',
        title: 'Launches and planets in the cloud',
        problem: 'The data has to live outside the server so a new deploy does not lose it.',
        decision: 'MongoDB Atlas holds launches and planets, with Mongoose schemas defining their shape.',
      },
      {
        name: 'Deploy',
        tech: 'Docker · EC2',
        title: 'One image for the whole app',
        problem: 'Running the client and the API separately means two deploys that can get out of sync.',
        decision: 'The React build and the API ship together as one Docker image, deployed on AWS EC2.',
      },
    ],
    results: ['Integration tests on Node 20 and 22 in CI', 'Client and API shipped as one Docker image on EC2'],
  },

  'food-delivery-api': {
    role: 'Solo: API and data',
    deploy: 'Node.js · MongoDB · Redis',
    layers: [
      {
        name: 'Server',
        tech: 'Express + TypeScript',
        title: 'Sessions that stay secure',
        problem: 'Users need to stay logged in, but a long-lived token that leaks is a long-lived problem.',
        decision:
          'Short-lived JWT access tokens with refresh tokens to get new ones, covering auth, orders and sessions.',
      },
      {
        name: 'Database',
        tech: 'MongoDB · Redis',
        title: 'Caching without running out of connections',
        problem:
          'The app was opening a new Redis connection on every request, which caused connection problems under load.',
        decision:
          'The Redis client was rewritten as a singleton that the whole app shares. MongoDB holds the data and Redis caches the hot reads.',
      },
    ],
    results: ['JWT access and refresh tokens', 'One shared Redis connection instead of one per request'],
  },

  'printing-press': {
    role: 'Design and front end (graduation project)',
    deploy: 'React · Figma',
    layers: [
      {
        name: 'Design',
        tech: 'Figma',
        title: 'Two apps, one design',
        problem:
          "Helwan University's printing press needed one app for students and staff, and another for its admins.",
        decision: 'I designed the full user and admin UI in Figma first, so both apps share the same look and flows.',
      },
      {
        name: 'Client',
        tech: 'React',
        title: 'From the design to working apps',
        problem: 'The design had to become two separate apps without drifting apart.',
        decision:
          'Both apps are built in React from the same Figma files. The admin app lives in its own repo: github.com/y0emad/FrontEndAdmin',
      },
    ],
    results: ['User and admin apps designed in Figma and built in React'],
    designUrl: 'https://www.figma.com/design/bGBTAIQzYMPVlic3mJnec5/FinalPro?node-id=0-1',
  },
}
