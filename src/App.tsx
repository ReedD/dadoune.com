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
      <script>
        {`
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
          ga('create', 'UA-48078670-1', 'auto');
          ga('send', 'pageview');
        `}
      </script>
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
