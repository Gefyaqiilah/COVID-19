import React, { Component } from 'react'
import './Contact.css'
import axios from 'axios'
export default class Contact extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        hospitals: []
      }
    }
  }
  getAllHospitals = () => {
    return new Promise(async(resolve, reject) => {
      try{
        const Resulthospitals = await axios.get(`${process.env.REACT_APP_API_DEKONTAMINASI}/id/covid19/hospitals`, { headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
        } ,crossdomain: true})
        console.log('hospitals :>> ', Resulthospitals);
        this.setState(prevState=> ({
          ...prevState,
          data: {
            ...prevState,
            hospitals: Resulthospitals.data
          }
        }))
        resolve(Resulthospitals)
      } catch(error) {
        reject(error)
      }
    });
  }
  async componentDidMount () {
   await this.getAllHospitals()   
  }
  render() {
    return (
      <div>
          <div className="headline bg-light-green pm">
            <p className="text-24 font-weight-bold text-white m-0">Kontak Rumah Sakit Terdekat anda</p>
            <p className="text-16 text-white m-0">Informasi dan nomor alamat rumah sakit yang menjadi rujukan pemeriksaan gejala COVID-19</p>
          </div>
          <div className="body p-5">
          <div className="card-hospital p-2">
            <div className="card-header bg-white">
              <p className="text-24 font-weight-bold">Daftar Rumah Sakit Rujukan</p>
              <p className="text-16">Berikut ini adalah rumah sakit yang menjadi rujukan untuk pasien dengan status Pasien dalam Pengawasan. Anda harus mengunjungi fasilitas kesehatan terdekat terlebih dahulu seperti klinik/rumah sakit umum sebelum akhirnya dapat dirujuk ke rumah sakit di bawah ini.</p>
            </div>
            <div className="card-body">
              <div className="row">
                {
                  this.state.data.hospitals.length > 0 &&
                <>
                  {
                    this.state.data.hospitals.map(el=>
                      <div className="col-lg-6 card-list-hospital">
                          <p className="font-weight-bold  text-18 m-0">{el.name}</p>
                          <p className="text-16 m-0">{el.address}</p>
                          <div className="phone">
                            <p className="m-0 p-2">{el.phone}</p>
                          </div>
                      </div>
                      )

                  }
                </>
                }
              </div>
            </div>
          </div>
          </div>
      </div>
    )
  }
}
