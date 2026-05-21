import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <section className="notfound-page">
      <h1>Page Not Found</h1>
      <p>The route you requested does not exist.</p>
      <p>
        Return <Link to="/">home</Link>.
      </p>
    </section>
  )
}
