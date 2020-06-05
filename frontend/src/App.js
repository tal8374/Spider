import React, { Component } from 'react';

import {
  BrowserRouter,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

import SiteGraph from './components/SiteGraph/SiteGraph';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/graph" render={(props) => <SiteGraph {...props} />}></Route>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
