import React, { Component } from 'react'
import { Link, BrowserRouter as Router } from 'react-router-dom'
import './css/Navbar.css'

export default class Navbar extends Component {
  render() {
    return (
      <div className="p-0 m-0 sticky-top">
        <div className="hotline-info d-flex p-1">
          <p className="m-0 ml-lg-5 text-white font-weight-bold">LAYANAN DARURAT COVID-19</p>
          <p className="m-0 ml-lg-5 text-white font-weight-bold telp">
           <i className="fa fa-phone"></i> 112
          </p>
          <p className="m-0 ml-lg-5 text-white font-weight-bold telp">
          <i className="fa fa-phone"></i> 0811 1211 2112
            </p>
          <p className="m-0 ml-lg-5 text-white font-weight-bold telp">
          <i className="fa fa-phone"></i> 0813 8837 6955
            </p>
        </div>
    <nav id="navbar" className="navbar navbar-light bg-light navbar-expand-lg">
      <a className="navbar-brand d-flex ml-lg-5">
          <img src="/img/pikovid.png" className="logo d-inline-block align-top mr-2" alt=""/>
          <div className="logo-text align-self-center">
          <p className=" logo-text m-0 p-0">Pusat Informasi Dan Koordinasi COVID-19</p>
          <p className=" logo-text m-0 p-0 text-gray">Indonesia</p>
          </div>
      </a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse justify-content-end mr-lg-5" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/home">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/databycountry">Data Global</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/contact">Kontak</Link>
          </li>
        </ul>
      </div>
    </nav>
    </div>
    )
  }
}
