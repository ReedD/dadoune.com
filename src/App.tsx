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

const title = 'Reed Dadoune | www.dadoune.com';
const description = "Reed Dadoune's blog and project portfolio";

const App = () => (
  <div>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content="#ffffff" />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="/icon-512x512.png" />
      <meta property="og:site_name" content="Reed Dadoune" />
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <link rel="manifest" href="manifest.json" />
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
