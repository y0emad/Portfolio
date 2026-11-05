import { createBrowserRouter } from 'react-router'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { StatusPage } from './pages/StatusPage'
import { Layout } from './components/Layout'
import { ApiExplorerPage } from './pages/ApiExplorerPage'
import { CaseStudyPage } from './pages/CaseStudyPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'case/:slug', element: <CaseStudyPage /> },
      { path: 'api-explorer', element: <ApiExplorerPage /> },
      { path: 'status', element: <StatusPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
