import { useEffect, useState } from 'react'
import apiClient from '../../api/client.js'
import './Home.css'

export default function Home() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    apiClient
      .get('/status')
      .then((response) => {
        setMessage(response.data?.message ?? 'API is available')
      })
      .catch(() => {
        setMessage('Unable to reach API. Update .env file or check network.')
      })
  }, [])

  return (
    <section className="home-page">
      <h1>Coffee Trace Dashboard</h1>
      <p>{message}</p>
      <p>
        This app uses React Router for page navigation and Axios for API calls powered by{' '}
        <code>import.meta.env.VITE_API_BASE_URL</code>.
      </p>
    </section>
  )
}
