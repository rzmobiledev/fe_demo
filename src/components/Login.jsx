import { useRef, useEffect, useState } from 'react'
import axios from '../api/axios'
import useAuth from '../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import useInput from '../hooks/useInput'
import useToggle from '../hooks/useToggle'

const LOGIN_URL = '/auth'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const { setAuth } = useAuth()
  const userRef = useRef()
  const errRef = useRef()

  // const [user, setUser] = useState('')
  const [user, resetUser, userAttribs] = useInput('user', '')
  const [pwd, setPwd] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [check, toggleCheck] = useToggle('persist', false)

  useEffect(() => {
    userRef.current.focus()
  }, [])

  useEffect(() => {
    setErrMsg('')
  }, [user, pwd])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ user, pwd }),
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )

      const accessToken = response?.data?.accessToken
      const roles = response?.data?.roles
      setAuth({ user, roles, accessToken })
      resetUser('')
      setPwd('')
      navigate(from, { replace: true })
    } catch (err) {
      if (!err?.response) setErrMsg('No Server Response')
      else if (err.response?.status === 400)
        setErrMsg('Missing username or password')
      else if (err.response?.status === 401) setErrMsg('Unauthorized')
      else setErrMsg('Login Failed')
      errRef.current.focus()
    }
  }

  // const togglePersist = () => {
  //   setPersist((prev) => !prev)
  // }

  // useEffect(() => {
  //   localStorage.setItem('persist', persist)
  // }, [persist])

  return (
    <section>
      <p
        ref={errRef}
        className={errMsg ? 'errmsg' : 'offscreen'}
        aria-live="assertive"
      >
        {errMsg}
      </p>
      <h1>Sign In</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          ref={userRef}
          autoComplete="off"
          {...userAttribs}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          onChange={(e) => setPwd(e.target.value)}
          value={pwd}
          required
        />

        <button>Sign In</button>
        <div className="persistCheck">
          <input
            type="checkbox"
            id="persist"
            onChange={toggleCheck}
            checked={check}
          />
          <label htmlFor="persist">Trust this device</label>
        </div>
      </form>
      <p>
        Need an Account?
        <br />
        <span className="line">
          <a href="#">Sign Up</a>
        </span>
      </p>
    </section>
  )
}
