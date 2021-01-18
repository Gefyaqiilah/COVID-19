import React, { Component, createRef } from 'react'
import axios from 'axios'
import { Bar, Doughnut, Line  } from 'react-chartjs-2';
import moment from 'moment';
import './Home.css'
import {Link} from 'react-router-dom'
export default class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      chart: {
        comparePopulation: {
          labels: ['AKTIF', 'SEMBUH', 'MENINGGAL'],
          datasets: [{
            label: '# COVID-19 Statistik di Indonesia',
            data: [12, 19, 3, 5],
            fill: false,
            backgroundColor: [
              'rgba(206, 181, 70, 0.9)',
              'rgba(16, 150, 87, 0.8)',
              'rgba(162, 14, 14, 0.9)'
            ]
          },
        ],
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: true
                      }
                  }]
              },
              responsive: true
          }
      },
        perProvince: {
          labels: [],
          datasets: [{
            label: '# COVID-19 Statistik Per Provinsi',
            data: [],
            backgroundColor: [
            ],
            borderColor: [
            ],
            borderWidth: 1
          },
        ],
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: true
                      }
                  }]
              },
              responsive: true
          }
      },
        compareWithPreviousData: {
          labels: ['Selumbari', 'Kemarin', 'Sekarang'],
          datasets: [{
            label: 'Live Data',
            data: [],
            backgroundColor: [
            ],
            borderColor: [
              'rgba(123,21,123, 1)',
              'rgba(45,21,21, 1)',
              'rgba(75,34,92, 1)'
            ],
            borderWidth: 1,
            fill: 'none',
            pointRadius: 2,
            lineTension: 0
          },
        ],
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: true
                      }
                  }]
              },
              responsive: true,
              maintainAspectRatio: true
          }
      } 
    },
      data: {
        indonesia: [],
        ranking: null
      },
      isLoading: {
        isFetching: false
      }
    }
    this.chartReference = createRef();
  }

  getDataCovidIndonesia = async () => {
    return new Promise((resolve, reject) => {
      this.setState({isLoading: {...this.state.isLoading, isFetching: true}})
      axios.get(`${process.env.REACT_APP_API_DISEASE}/countries/ID?yesterday=false&twoDaysAgo=false&allowNull=true`)
      .then((result) => {
          console.log('result', result)
          this.setState({isLoading: {...this.state.isLoading, isFetching: false}})
          this.setState({...this.state,data: {...this.state.data, indonesia: result.data}})
          this.setState(prevState => ({
            chart: {
              ...prevState.chart,
              comparePopulation: {
                ...prevState.chart.comparePopulation,
                datasets: [{
                  ...prevState.chart.comparePopulation.datasets[0],
                  data: [result.data.active, result.data.recovered, result.data.deaths]
                }]
              }
            }
          }))
          resolve(result)
      }).catch((err) => {
        console.log('err :>> ', err);
        reject(err)
      });
    });
  }
  getDataPerProvince = async () => {
    try{
      const result = await axios.get('https://indonesia-covid-19.mathdro.id/api/provinsi')
      const dataResult = result.data.data.filter(el=>el.provinsi!=='Indonesia')
      const randomColor = result.data.data.map(el=> {
        const r = Math.round
        const o = Math.random
        const max = 255
        let rgba = `rgba(${r(o()*max)}, ${r(o()*max)},${r(o()*max)}, 1)`
        return rgba
      })
      this.setState(prevState => ({
        chart: {
          ...prevState.chart,
          perProvince: {
            ...prevState.chart.perProvince,
            labels: dataResult.map(el=>el.provinsi),
            datasets: [{
              ...prevState.chart.perProvince.datasets[0],
              data: dataResult.map(el=>el.kasusPosi),
              backgroundColor: randomColor.map(el=>el),
              borderColor:randomColor.map(el=>el)
            }]
          }
        }
      }))
    } catch(error) {
      console.log('error get data per province:>> ', error);
    }
  }
  getPreviousData = async (now) => {
    try{
      const beforeYesterday = await axios.get(`${process.env.REACT_APP_API_DISEASE}/countries/ID?yesterday=false&twoDaysAgo=true&allowNull=true`)
      const yesterday = await axios.get(`${process.env.REACT_APP_API_DISEASE}/countries/ID?yesterday=true&twoDaysAgo=false&allowNull=true`)
      const allCountries = await axios.get(`${process.env.REACT_APP_API_DISEASE}/countries?yesterday=false&twoDaysAgo=false&sort=cases&allowNull=true`)
      const ranking = allCountries.data.findIndex(el=>el.country === "Indonesia")
      const beforeYesterdayResult = beforeYesterday.data
      const yesterdayResult = yesterday.data
      const nowResult = now.data
      this.setState(prevState => ({
        ...prevState,
        data: {
          indonesia: {
            ...prevState.data.indonesia,
            deathPercent: (nowResult.deaths/nowResult.cases*100).toFixed(1),
            recoveredPercent: (nowResult.recovered/nowResult.cases*100).toFixed(1),
            activePercent: (nowResult.deaths/nowResult.cases*100).toFixed(1),
            deathYesterday: yesterdayResult.deaths,
            caseYesterday: yesterdayResult.cases,
            recoveredYesterday: yesterdayResult.recovered,
            activeYesterday: yesterdayResult.active
          },
          ranking: ranking+1
        },
        chart: {
          ...prevState.chart,
          compareWithPreviousData: {
            ...prevState.chart.compareWithPreviousData,
            datasets: [{
              ...prevState.chart.compareWithPreviousData.datasets[0],
              data: [beforeYesterdayResult.cases, yesterdayResult.cases, nowResult.cases]
            }]
          }
        }
      }))
          } catch(error) {
      console.log('error get data per province:>> ', error);
    }
  }
   async componentDidMount () {
    const resultDataCovid = await this.getDataCovidIndonesia()
    this.getDataPerProvince()
    this.getPreviousData(resultDataCovid)
  }
  render() {
    return (
      <div className="bg">
          <div className="container-fluid m-0 p-lg-5 mx-auto">
            <div className="information d-flex justify-content-between mx-auto">
                <div className="img">
                  <img src="/img/Survei Vaksin.jpeg" alt=""/>
                </div>
                <div className="contact d-flex flex-column justify-content-between">
                  <div className="hotline d-flex justify-content-between m-0 p-0">
                    <div className="card card-call-center p-4">
                      <p className="text-16 m-0">Call Center</p>
                      <p class="text-gray text-14 m-0">Nomor Darurat</p>
                      <p className="text-green text-24 m-0 mt-3"><i className="fa fa-phone"></i> <span className="font-weight-bold">199</span></p>
                    </div>
                    <div className="card card-wa p-4">
                      <p className="text-16 m-0">Hotline Pikovid</p>
                      <p className="text-gray text-14 m-0">Chat WA seputar COVID-19</p>
                      <p className="text-green text-24 m-0 mt-3"><i className="fa fa-whatsapp"></i> <span className="font-weight-bold">Klik untuk chat</span></p>
                    </div>
                  </div>
                  <div className="card card-social-media p-4 d-flex flex-lg-row justify-content-between">
                    <p className="desc m-0 text-18">Ikuti perkembangan terkini seputar Covid-19 dengan mengikuti kanal sosial media kami.</p>
                    <div className="icon text-green text-36 d-flex align-items-center">
                      <i className="fa fa-instagram"></i>
                      <i className="fa fa-twitter ml-3"></i>
                    </div>
                  </div>
                </div>
            </div>
              <div className="header padding-20 mt-5">
                <p className=" text-24 font-weight-bold m-0">Jumlah Kasus di Indonesia Saat Ini</p>
                <p className=" text-19 font-weight-bold text-gray">Update Terakhir: { moment(this.state.data.indonesia.updated).format('MMMM Do YYYY, h:mm:ss')}</p>
              </div>
              { this.state.data.indonesia && this.state.chart.comparePopulation && this.state.chart.perProvince && this.state.chart.compareWithPreviousData &&
              <>
              <div className="row padding-20 justify-content-around mt-lg-4">
                <div className="col-lg-3 col-sm-12 case">
                  <div className="card-case confirmation p-4">
                    <p className="text-center font-weight-bold text-light-gray m-0">TOTAL TERKONFIRMASI</p>
                    <h1 className="text-center text-white font-weight-bold text-30 m-0 overflow">{this.state.data.indonesia.cases}</h1>
                    <p className="text-center font-weight-bold m-0">
                   <i className="fa fa-angle-double-up bg-white up-icon text-black text-19"></i> <span className="text-19 text-white">{ this.state.data.indonesia.cases - this.state.data.indonesia.caseYesterday}</span>
                  </p>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-12 case">
                <div className="card-case in-treated p-2 p-4">
                  <p className="text-center font-weight-bold m-0">KASUS AKTIF</p>
                  <h1 className="text-center text-orange font-weight-bold text-orange text-30 m-0 overflow">{this.state.data.indonesia.active}</h1>
                  <p className="text-center font-weight-bold m-0">
                   <i className="fa fa-angle-double-up bg-orange up-icon text-white text-19"></i> <span className="text-19 text-orange">{ this.state.data.indonesia.active - this.state.data.indonesia.activeYesterday}</span>
                  </p>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-12 case">
                <div className="card-case p-2 p-4">
                  <p className="text-center font-weight-bold m-0">SEMBUH</p>
                <h1 className="text-center font-weight-bold text-green text-30 m-0 overflow">{this.state.data.indonesia.recovered}</h1>
                <p className="text-center font-weight-bold m-0">
                   <i className="fa fa-angle-double-up bg-green up-icon text-white text-19"></i> <span className="text-19 text-green">{ this.state.data.indonesia.recovered - this.state.data.indonesia.recoveredYesterday}</span>
                  </p>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-12 case">
                <div className="card-case p-2 p-4">
                  <p className="text-center font-weight-bold m-0">MENINGGAL</p>
                <h1 className="text-center text-orange font-weight-bold text-maroon text-30 m-0 overflow">{this.state.data.indonesia.deaths}</h1>
                <p className="text-center font-weight-bold m-0">
                   <i className="fa fa-angle-double-up bg-maroon up-icon text-white text-19"></i> <span className="text-19 text-maroon">{ this.state.data.indonesia.deaths - this.state.data.indonesia.deathYesterday}</span>
                  </p>
                  </div>
                </div>
              </div>
              <div className="row padding-20 justify-content-around medium m-0 mt-lg-4">
                <div className="col-lg-3 col-sm-12 card-case-medium p-4">
                  <p className="text-center text-16 font-weight-bold">KASUS HARI INI</p>
                  <div className="row">
                    <div className="col-12">
                      <p className="text-center text-30 font-weight-bold text-light-black m-0">{this.state.data.indonesia.todayCases || 0 }</p>
                      <p className="text-center m-0 text-light-black font-weight-bold">KASUS</p>
                    </div>
                    <div className="col-6">
                      <p className="text-center text-30 text-orange font-weight-bold">{this.state.data.indonesia.todayRecovered || 0 }</p>
                      <p className="text-center font-weight-bold">SEMBUH</p>
                    </div>
                    <div className="col-6">
                      <p className="text-center text-30 text-maroon font-weight-bold">{this.state.data.indonesia.todayDeaths || 0 }</p>
                      <p className="text-center font-weight-bold">MENINGGAL</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-sm-12 card-case-medium p-4">
                  <div className="row">
                    <div className="col-12">
                  <p className="text-center text-16 font-weight-bold">TEST SWAB</p>
                      <p className="text-center text-50 font-weight-bold text-light-black mt-lg-4">{this.state.data.indonesia.tests}</p>
                      <p className="text-center m-0 text-light-black font-weight-bold">JUMLAH TEST SWAB</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-12 card-case-medium p-4">
                <div className="row">
                    <div className="col-12">
                      <p className="text-center font-weight-bold">RANKING</p>
                    <p className="text-center text-50 font-weight-bold text-maroon m-0">{this.state.data.ranking}</p>
                      <p className="text-center font-weight-bold">SEDUNIA</p>
                    <p className="text-center m-0  font-weight-bold text-14 text-maroon">{'(Berdasarkan jumlah kasus terbanyak)'}</p>
                    </div>
                 </div>
                </div>
              </div>
              
              <div className="row padding-20 chart justify-content-between mt-lg-5 mt-sm-4 p-4">
                <div className="col-lg-5 card-chart card p-0">
                  <div className="card-header pl-3 pt-3 pb-0 bg-green">
                    <p className="text-20 font-weight-bold text-white">Data Kasus</p>
                  </div>
                  <div className="card-body">
                    <Doughnut ref={this.chartReference} data={this.state.chart.comparePopulation}/>
                  </div>
                </div>
                <div className="col-lg-6 card card-chart p-0">
                  <div className="card-header bg-green pl-3 pt-3 pb-0">
                  <p className="text-20 font-weight-bold text-white">Data Sebaran Kasus Per Hari</p>
                  </div>
                  <div className="card-body p-3">
                <Line ref={this.chartReference} data={this.state.chart.compareWithPreviousData}/>
                  </div>
                </div>
              </div>
              <div className="row padding-20">
              <div className="col-lg-12 card card-chart-province mt-lg-5 p-0 ">
                  <div className="card-header bg-green pl-3 pt-3 pb-0">
                  <p className="text-20 text-white font-weight-bold">Data Sebaran Kasus Per Provinsi</p>
                  </div>
                  <div className="card-body pl-lg-5 pr-lg-5 m-0">
                <Bar ref={this.chartReference} data={this.state.chart.perProvince}/>
                  </div>
                </div>
              <p className="text-30 text-center mx-auto mt-5 font-weight-bold">Apa yang Harus Dilakukan</p>
              </div>
              <div className="row p-lg-4 p-0 mx-auto justify-content-center">
                <div className="col-lg-12 card-covid19-desc bg-green p-4 row">
                  <div className="left col-lg-8">
                  <p className="text-white text-24 font-weight-bold text-ketahui">
                  Ketahui Risiko dari COVID-19
                  </p>
                  <p className="text-white text-18 text-justify font-weight-normal">
                  Coronavirus adalah kumpulan virus yang bisa menginfeksi sistem pernapasan. Pada banyak kasus, virus ini hanya menyebabkan infeksi pernapasan ringan, seperti flu. Namun, virus ini juga bisa menyebabkan infeksi pernapasan berat, seperti infeksi paru-paru (pneumonia).<br/>
                  Ketika anda merasakan gejala-gejala covid-19 diharapkan langsung menelepon hotline/callcenter rumah sakit terdekat anda.
                  <br/><br/>
                  Maka dari itu pentingnya kita mengetahui dan mengecek kondisi mandiri. klik tombol dibagian kanan sekarang juga !
                  
                  </p>
                  </div>
                  <div className="right col-lg-4 d-flex justify-content-end align-items-center">
                    <a href="https://covid19.prixa.ai/partner/80b47a20-1353-49e9-af91-a0a5995ca89f/app/52b7d983-3e5d-49cc-9c99-508dc779aad3" className="btn-periksa d-flex justify-content-center align-items-center">Periksa diri anda</a>
                  </div>
                </div>
              <p className="text-30 text-center mx-auto mt-5 font-weight-bold">Apa yang Harus Diketahui</p>
              </div>
              <div className="row">
                <div className="col-lg-6 left-image">
                  <img src="/img/img-waspada.svg" alt=""/>
                </div>
                <div className="col-lg-6">
                  <div className="what-is-covid mt-lg-4 p-2">
                    <div className="title text-20 font-weight-bold">Apa Itu COVID-19?</div>
                    <div className="desc text-16">
                    COVID-19 adalah penyakit yang disebabkan oleh Novel Coronavirus (2019-nCoV), jenis baru coronavirus yang pada manusia menyebabkan penyakit mulai flu biasa hingga penyakit yang serius seperti Middle East Respiratory Syndrome (MERS) dan Sindrom Pernapasan Akut Berat/ Severe Acute Respiratory Syndrome (SARS).

                    <br/><br/>Pada 11 Februari 2020, World Health Organization (WHO) mengumumkan nama penyakit yang disebabkan 2019-nCov, yaitu <span class="font-weight-bold">Coronavirus Disease (COVID-19) </span>.
                    </div>
                  </div>
                  <div className="gejala mt-lg-4">
                    <div className="title text-20 font-weight-bold">Gejala</div>
                    <div className="desc text-16">
                    Gejala umum berupa demam ≥38°C, batuk kering, dan sesak napas. Jika ada orang yang dalam 14 hari sebelum muncul gejala tersebut pernah melakukan perjalanan ke negara terjangkit, atau pernah merawat/kontak erat dengan penderita COVID-19, maka terhadap orang tersebut akan dilakukan pemeriksaan laboratorium lebih lanjut untuk memastikan diagnosisnya.
                    </div>
                  </div>
                  <div className="penularan mt-lg-4">
                    <div className="title text-20 font-weight-bold">Penularan</div>
                    <div className="desc text-16">
                    Seseorang dapat terinfeksi dari penderita COVID-19. Penyakit ini dapat menyebar melalui tetesan kecil (droplet) dari hidung atau mulut pada saat batuk atau bersin. Droplet tersebut kemudian jatuh pada benda di sekitarnya. Kemudian jika ada orang lain menyentuh benda yang sudah terkontaminasi dengan droplet tersebut, lalu orang itu menyentuh mata, hidung atau mulut (segitiga wajah), maka orang itu dapat terinfeksi COVID-19. Seseorang juga bisa terinfeksi COVID-19 ketika tanpa sengaja menghirup droplet dari penderita. Inilah sebabnya mengapa kita penting untuk menjaga jarak hingga kurang lebih satu meter dari orang yang sakit.
                    </div>
                  </div>
                </div>
              </div>
              <div className="wrapper-card-to-contact p-3">
              <div className="card-to-contact row mt-5">
                  <div className="left col-lg-6 d-flex align-items-center">
                    <div>
                    <p className="text-24 font-weight-bold">Ketahui informasi lebih lengkap mengenai <br/>Rumah Sakit rujukan di Indonesia </p>
                    <div>
                      <Link className="btn-to-contact p-2"to="/contact">Cek sekarang juga <i className="fa fa-chevron-right"></i> </Link>
                    </div>
                    </div>
                  </div>
                  <div className="right col-lg-6 p-0">
                    <img src="/img/eaf6002.png"/>
                  </div>
              </div>
              </div>
              </>
        }
         </div>

    </div>
    )
  }
}
