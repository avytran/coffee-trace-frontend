import { Link } from 'react-router-dom'
import './Navigation.css'

export default function Navigation() {
  return (
    <header className="navigation-header">
      <nav className="navigation-nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  )
}
