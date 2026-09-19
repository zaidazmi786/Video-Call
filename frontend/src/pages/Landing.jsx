import React from 'react'
import "../App.css";
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className='landingPageContent'>
      <nav className='nav'>
        <div className='navHeader'><h2>Video Call</h2></div>
        <div className='navlist'>
          <Link to="/auth" style={{ textDecoration: "none", color: "inherit" }}>
            <p>Join as Guest</p>
          </Link>
          <Link to="/auth" style={{ textDecoration: "none", color: "inherit" }}>
            <p>Register</p>
          </Link>
          <div roll="button">
            <Link to="/auth" style={{ textDecoration: "none", color: "inherit" }}>
              <p>Login</p>
            </Link>
          </div>

        </div>
      </nav>
      <div className='imgContainer'>
        <div className='text'>
          <h1> <span style={{ color: "orange" }}> Connect</span> with your <br /> Loved Ones</h1>
          <p>Cover a distance by video call</p>
          <br />
          <div roll="button">
            <Link style={{
              textDecoration: "none",
              color: "white",
              borderRadius: "6px ",
              fontSize: "1rem",
              backgroundColor: "orange",
              padding: "6px",

            }}
              to={"/auth"}>Get Started</Link>
          </div>


        </div>
        <div className='image'>
          <img src="/images/mobile.png" alt="" />
        </div>
      </div>



    </div>
  )
}