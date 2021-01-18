import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Home from '../pages/home/Home'
import DataByCountry from '../pages/country/DataByCountry'
import { BrowserRouter as Router } from 'react-router-dom'
import Navbar from '../components/module/Navbar'
import Footer from '../components/module/Footer'
import Contact from '../pages/contact/Contact'
const Routes = () => {
  return (
    <Router>
      <Navbar/>
      <Switch>
        <Route exact path="/">
          <Home/>
        </Route>
        <Route path="/home" exact>
          <Home/>
        </Route>
        <Route path="/databycountry">
          <DataByCountry/>
        </Route>
        <Route path="/contact">
          <Contact/>
        </Route>
        <Route path="*">
          <Redirect to="/home"/>
        </Route>
      </Switch>
      <Footer/>
    </Router>
  )
}

export default Routes