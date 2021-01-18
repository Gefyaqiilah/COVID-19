import React, { Component } from 'react'
import './css/Footer.css'
export default class Footer extends Component {
  render() {
    return (
      <footer className="p-4 mt-5">
        <div className="desc p-0">
          <div className="row p-0 m-0">
            <div className="col-lg-12 p-0">
              <p className="m-0 text-center">
                <i className="icon text-white fa fa-phone"></i>
                <i className="icon text-white fa fa-instagram"></i>
                <i className="icon text-white fa fa-twitter"></i>
              </p>
              <p className="m-0 text-center text-white font-weight-normal">
                Pusat Informasi Dan Koordinasi COVID-19 <br/>
                <span className="text-14">Created by Gefy Aqiilah Aqshal</span><br/>
                <span className="text-14">Terinsipirasi dari <a href="https://pikobar.jabarprov.go.id/" className="text-decoration-none text-white">pikobar.jabarprov.go.id</a></span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    )
  }
}
