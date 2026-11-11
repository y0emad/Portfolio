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
    role: 'Solo: 3D client, API, tests and deploy',
    deploy: 'Docker · Docker Hub · AWS EC2 · Caddy · GitHub Actions',
    layers: [
      {
        name: 'Launch',
        tech: 'three.js · react-three-fiber · Web Audio',
        title: 'A launch that waits for the server',
        problem:
          'A launch animation that plays no matter what would show a rocket flying even when the API rejects the mission, and a slow response would leave the user staring at a frozen screen.',
        decision:
          'The request starts with the countdown. If the API has not answered by T-2 the count holds, and if it rejects the data the launch is scrubbed before ignition with the reasons the API returned. The flight goes on past the second stage: the fairing halves fall away, the engine cuts off, and the spacecraft separates and unfolds its solar panels over a textured Earth turned so the pad sits on Florida. Smoke and flames are particle systems, the plume is a shader with Mach diamonds, and the engine sound is made live in the Web Audio API.',
      },
      {
        name: 'Realism',
        tech: 'Canvas textures · PBR · postprocessing',
        title: 'A rocket that looks built, not modelled',
        problem:
          'Plain coloured shapes look like a toy, and downloading photo textures and models for every part would make the launch slow to open.',
        decision:
          'Every surface is drawn in code when the launch opens: painted panels with weld lines and rivets, frost on the oxygen tank that melts after liftoff, carbon fibre, engine bells, grid fins, gold foil and solar cells, each with its own roughness and normal map. The pad has a flame trench, a launch mount, a service tower, lightning masts and a water tower under a physically based dusk sky, with shadows and bloom on devices that can afford them.',
      },
      {
        name: 'Exoplanets',
        tech: 'Express API · three.js shaders',
        title: 'Turning a CSV row into a solar system',
        problem:
          'The Kepler data has the star temperature and size and how much starlight a planet gets, but not how big the orbit is or what the star looks like.',
        decision:
          'The API works out the star brightness from its size and temperature, the orbit size from that brightness and the starlight, and the colour and class of the star. The client draws each of the 7 planets around its star inside the zone where liquid water could exist, with a surface picked from its temperature and size. After a launch, Fly to opens the planet the mission is heading for.',
      },
      {
        name: 'Speed',
        tech: 'Shader warm-up · Lighthouse',
        title: 'From a 7 second freeze to a running countdown',
        problem:
          'Profiling showed the page froze for about 6 of the 7.5 seconds before the countdown started, compiling shaders, and every material was compiled twice: once for the screen and once for the bloom pass.',
        decision:
          'The scene is compiled once, for the render target it is drawn into, and polled without blocking the page. The countdown starts straight away and the pad fades in after about 2 seconds. Hashed assets are cached for a year, responses are gzipped, the background went from 778 KB to 38 KB as WebP, and weaker devices get fewer particles and a simpler sky.',
      },
      {
        name: 'Testing',
        tech: 'Playwright · Jest · Supertest',
        title: 'Tests that drive the real app',
        problem:
          'The launch depends on timing and on what the server answers, which unit tests do not see.',
        decision:
          '18 Playwright tests run the built app in Chromium with the API mocked: a launch that reaches orbit, one that holds while the server is slow, one the server rejects, the exoplanet explorer, Watch on the Upcoming page, reduced motion and phones. They found a real bug: after a slow answer the launch stayed on Hold until the end of the flight. Jest and Supertest cover the API on Node 20 and 22.',
      },
      {
        name: 'Deploy',
        tech: 'Docker · EC2 · Caddy',
        title: 'One image, deployed on every merge',
        problem: 'Running the client and the API separately means two deploys that can get out of sync.',
        decision:
          'A multi-stage Docker image ships the React build with the compiled API. Every merge to main runs both test suites, publishes the image to Docker Hub, and the EC2 server pulls it within two minutes, behind Caddy with HTTPS.',
      },
    ],
    results: [
      'Live at nasa-dev.duckdns.org with HTTPS',
      'Launch from pad to spacecraft separation that holds or scrubs on the real API response',
      '7 habitable exoplanets and the solar system in 3D',
      'Launch view starts in about 2 seconds instead of 7.5',
      '18 Playwright tests plus API tests, deployed on every merge',
    ],
    screenshots: [
      {
        src: '/projects/nasa/launch-liftoff.jpg',
        alt: 'A white two-stage rocket lifting off at dusk beside a red service tower, with lightning masts, floodlights and a water tower around the pad and the clock at T+00:01',
        caption: 'Liftoff: the request to the API ran during the countdown',
      },
      {
        src: '/projects/nasa/launch-maxq.jpg',
        alt: 'The rocket climbing at an angle through a dusk sky with a bright exhaust plume, the coast and ocean below',
        caption: 'Max Q, with live altitude and speed',
      },
      {
        src: '/projects/nasa/launch-fairing.jpg',
        alt: 'The second stage firing a wide blue plume above the curve of the Earth, with the spacecraft showing where the fairing came off',
        caption: 'Fairing separation above the atmosphere',
      },
      {
        src: '/projects/nasa/launch-spacecraft.jpg',
        alt: 'A gold-foil spacecraft unfolding long solar panels above the dark curve of the Earth and its blue atmosphere',
        caption: 'The spacecraft separates and unfolds its solar panels',
      },
      {
        src: '/projects/nasa/watch-in-flight.jpg',
        alt: 'The spacecraft in deep space with the Earth behind it and a mission clock reading three days since launch',
        caption: 'Watch joins a mission that already launched, in flight',
      },
      {
        src: '/projects/nasa/exoplanets.jpg',
        alt: 'A close-up of Kepler-452 b drawn as a dry orange world, next to a panel comparing its size with Earth and listing its orbit and star',
        caption: 'Each habitable Kepler planet around its own star',
      },
      {
        src: '/projects/nasa/solar-overview.jpg',
        alt: 'The 3D solar system with labelled orbits around the Sun and a simulation panel on the right',
        caption: 'The solar system, placed where the planets are today',
      },
      {
        src: '/projects/nasa/space-today.jpg',
        alt: 'The launch form above a section showing the Astronomy Picture of the Day, a dwarf galaxy, with its explanation',
        caption: 'NASA’s picture of the day on the launch page',
      },
      {
        src: '/projects/nasa/history-mobile.jpg',
        alt: 'The launch history on a phone, with each launch shown as a card',
        caption: 'On phones the tables turn into cards',
        mobile: true,
      },
    ],
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
    designUrl:
      'https://www.figma.com/proto/bGBTAIQzYMPVlic3mJnec5/FinalPro?node-id=34-444&p=f&page-id=0%3A1&starting-point-node-id=34%3A444',
    designPreview: '/projects/printing-press/home.jpg',
  },
}
