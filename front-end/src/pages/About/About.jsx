import './About.css'

export default function About() {
  return (
    <section className="about-page">
      <h1>About Coffee Trace</h1>
      <p>
        This project is set up with client-side routing using React Router and remote requests through Axios.
      </p>
      <p>
        Configure the API base URL in <code>.env</code> by copying <code>.env.example</code>.
      </p>
    </section>
  )
}
