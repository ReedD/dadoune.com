import React from 'react';
import { hot } from 'react-hot-loader';
import { Router, Head } from 'react-static';
import Routes from 'react-static-routes';
import styled from 'styled-components';
import Footer from './components/Footer';
import Navigation from './components/Navigation';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const App = () => (
  <div>
    <Head>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700"
        type="text/css"
      />
    </Head>
    <Router>
      <Content>
        <Navigation />
        <Routes />
        <Footer />
      </Content>
    </Router>
  </div>
);

export default hot(module)(App);
