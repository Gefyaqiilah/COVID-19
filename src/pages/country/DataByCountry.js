import React, { Component, createRef } from 'react'
import axios from 'axios'
import moment from 'moment';
import '../home/Home.css'
import './DataByCountry.css'

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
        selected: [],
        ranking: null,
        listCountry: ['awdawd'],
        allCountries: []
      },
      isLoading: {
        isFetching: false
      },
      input: {
        selectCountry: ''
      }
    }
    this.chartReference = createRef();
  }

  getDataCovidPerCountry = () => {
    return new Promise(async(resolve, reject) => {
      const iso2 = await this.getAllData()
      this.setState({isLoading: {...this.state.isLoading, isFetching: true}})
      axios.get(`${process.env.REACT_APP_API_DISEASE}/countries/${iso2}?yesterday=false&twoDaysAgo=false&allowNull=true`)
      .then((result) => {
          this.setState({isLoading: {...this.state.isLoading, isFetching: false}})
          this.setState({...this.state,data: {...this.state.data, selected: result.data}})
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
          ...prevState.data,
          indonesia: {
            ...prevState.data.selected,
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
  getAllData = () => {
    return new Promise(async (resolve, reject) => {
      try{
        const allData = await axios.get(`${process.env.REACT_APP_API_DISEASE}/countries?yesterday=false&twoDaysAgo=false&sort=cases&allowNull=true`)
        this.setState(prevState => ({
          ...prevState,
          data: {
            ...prevState.data,
            listCountry: allData.data.map(el=> {
              return {name: el.country, iso2: el.countryInfo.iso2}
            }),
            allCountries: allData.data
          }
        }))
        this.setState(prevState=> ({
          ...prevState,
          input: {
            ...prevState.input,
            selectCountry: allData.data[0].countryInfo.iso2 
          }
        }))
        this.selectCountry() 
        resolve(allData.data[0].countryInfo.iso2)
      } catch(error) {
        console.log('erro :>> ', error);
        reject(error)
      }
    });
  }

  selectCountry = async () => {
    const now = await axios.get(`${process.env.REACT_APP_API_DISEASE}/countries/${this.state.input.selectCountry}?yesterday=false&twoDaysAgo=false&allowNull=true`)
    // const beforeYesterday = await axios.get(`${process.env.REACT_APP_API_DISEASE}/countries/${this.state.input.selectCountry}?yesterday=false&twoDaysAgo=true&allowNull=true`)
    const yesterday = await axios.get(`${process.env.REACT_APP_API_DISEASE}/countries/${this.state.input.selectCountry}?yesterday=true&twoDaysAgo=false&allowNull=true`)
    const allCountries = await axios.get(`${process.env.REACT_APP_API_DISEASE}/countries?yesterday=false&twoDaysAgo=false&sort=cases&allowNull=true`)
    const ranking = allCountries.data.findIndex(el=>el.countryInfo.iso2 === this.state.input.selectCountry)

    const nowResult = now.data
    // const beforeYesterdayResult = beforeYesterday.data
    const yesterdayResult = yesterday.data

    this.setState(prevState=> ({
      ...prevState,
      data: {
        ...prevState.data,
        selected: {
          ...now.data,
          deathPercent: (nowResult.deaths/nowResult.cases*100).toFixed(1),
          recoveredPercent: (nowResult.recovered/nowResult.cases*100).toFixed(1),
          activePercent: (nowResult.deaths/nowResult.cases*100).toFixed(1),
          deathYesterday: yesterdayResult.deaths,
          caseYesterday: yesterdayResult.cases,
          recoveredYesterday: yesterdayResult.recovered,
          activeYesterday: yesterdayResult.active,
          ranking: ranking + 1
        }
      }
    }))
  }
  handleOnChange = (e) => {
    this.setState(prevState=> ({
      ...prevState,
      input: {
        ...prevState.input,
        [e.target.name]: e.target.value 
      }
    }))
  }
   async componentDidMount () {
    const resultDataCovid = await this.getDataCovidPerCountry()
    this.getDataPerProvince()
    this.getPreviousData(resultDataCovid)
  }
  render() {
    return (
      <div className="bg">
          <div className="container-fluid m-0 p-lg-5 mx-auto">
            <div className="card card-cases">
              <div className="card-header bg-green border-none d-flex justify-content-between align-items-center">
                <div className="left">
                  <p className=" text-24 font-weight-bold m-0 text-white">Data Kasus {this.state.data.selected.country} Saat Ini</p>
                  <p className=" text-16 font-weight-bold text-white">Update Terakhir: { moment(this.state.data.selected.updated).format('MMMM Do YYYY, h:mm:ss')}</p>
                </div>
                { this.state.data.listCountry.length > 0 &&
                <div className="right d-flex">
                  <select name="selectCountry" onChange={this.handleOnChange} value={this.state.input.selectCountry} className="select-country form-control" id="">
                    <option value="" disabled selected >Pilih Negara</option>
                    {this.state.data.listCountry.map((el, index) => 
                     index === 0 ? <option value={el.iso2} selected key={index}>{el.name}</option> : <option value={el.iso2} key={index}>{el.name}</option>

                  )}
                  </select>
                  <button className="btn btn-primary" onClick={this.selectCountry}>Cari</button>
                </div>
                  }
              </div>
              <div className="card-body p-lg-5 p-sm-5">
              { this.state.data.selected && this.state.chart.comparePopulation && this.state.chart.perProvince && this.state.chart.compareWithPreviousData &&
              <>
              <div className="row justify-content-around">
                <div className="col-lg-3 col-sm-12 case">
                  <div className="card-case confirmation p-4">
                    <p className="text-center font-weight-bold text-light-gray m-0">TOTAL TERKONFIRMASI</p>
                    <h1 className="text-center text-white font-weight-bold text-30 m-0 overflow">{this.state.data.selected.cases}</h1>
                    <p className="text-center font-weight-bold m-0">
                   <i className="fa fa-angle-double-up bg-white up-icon text-black text-19"></i><span className="text-19 text-white">{ this.state.data.selected.cases - this.state.data.selected.caseYesterday}</span>
                  </p>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-12 case">
                <div className="card-case in-treated p-2 p-4">
                  <p className="text-center font-weight-bold m-0">KASUS AKTIF</p>
                  <h1 className="text-center text-orange font-weight-bold text-orange text-30 m-0 overflow">{this.state.data.selected.active}</h1>
                  <p className="text-center font-weight-bold m-0">
                   <i className="fa fa-angle-double-up bg-orange up-icon text-white text-19"></i> <span className="text-19 text-orange">{ this.state.data.selected.active - this.state.data.selected.activeYesterday}</span>
                  </p>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-12 case">
                <div className="card-case p-2 p-4">
                  <p className="text-center font-weight-bold m-0">SEMBUH</p>
                <h1 className="text-center font-weight-bold text-green text-30 m-0 overflow">{this.state.data.selected.recovered}</h1>
                <p className="text-center font-weight-bold m-0">
                   <i className="fa fa-angle-double-up bg-green up-icon text-white text-19"></i> <span className="text-19 text-green">{ this.state.data.selected.recovered - this.state.data.selected.recoveredYesterday}</span>
                  </p>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-12 case">
                <div className="card-case p-2 p-4">
                  <p className="text-center font-weight-bold m-0">MENINGGAL</p>
                <h1 className="text-center text-orange font-weight-bold text-maroon text-30 m-0 overflow">{this.state.data.selected.deaths}</h1>
                <p className="text-center font-weight-bold m-0">
                   <i className="fa fa-angle-double-up bg-maroon up-icon text-white text-19"></i> <span className="text-19 text-maroon">{ this.state.data.selected.deaths - this.state.data.selected.deathYesterday}</span>
                  </p>
                  </div>
                </div>
              </div>
              <div className="row justify-content-around medium m-0 mt-lg-4 mt-sm-4">
                <div className="col-lg-3 col-sm-12 card-case-medium p-4">
                  <p className="text-center text-16 font-weight-bold">KASUS HARI INI</p>
                  <div className="row">
                    <div className="col-12">
                      <p className="text-center text-30 font-weight-bold text-light-black m-0">{this.state.data.selected.todayCases || 0}</p>
                      <p className="text-center m-0 text-light-black font-weight-bold">KASUS</p>
                    </div>
                    <div className="col-6">
                      <p className="text-center text-30 text-orange font-weight-bold">{this.state.data.selected.todayRecovered || 0}</p>
                      <p className="text-center font-weight-bold">SEMBUH</p>
                    </div>
                    <div className="col-6">
                      <p className="text-center text-30 text-maroon font-weight-bold">{this.state.data.selected.todayDeaths || 0}</p>
                      <p className="text-center font-weight-bold">MENINGGAL</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-sm-12 card-case-medium p-4">
                  <div className="row">
                    <div className="col-12">
                  <p className="text-center text-16 font-weight-bold">TEST SWAB</p>
                      <p className="text-center text-50 font-weight-bold text-light-black mt-lg-4">{this.state.data.selected.tests}</p>
                      <p className="text-center m-0 text-light-black font-weight-bold">JUMLAH TEST SWAB</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-12 card-case-medium p-4">
                <div className="row">
                    <div className="col-12">
                      <p className="text-center font-weight-bold">RANKING</p>
                    <p className="text-center text-50 font-weight-bold text-maroon m-0">{this.state.data.selected.ranking}</p>
                      <p className="text-center font-weight-bold">SEDUNIA</p>
                    <p className="text-center m-0  font-weight-bold text-14 text-maroon">{'(Berdasarkan jumlah kasus terbanyak)'}</p>
                    </div>
                 </div>
                </div>
              </div>
              </>
        } 
              </div>
            </div>
         </div>

    </div>
    )
  }
}
