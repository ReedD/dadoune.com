import React from 'react';
import { hot } from 'react-hot-loader';
import { Head, Route, Router, withSiteData } from 'react-static';
import Routes from 'react-static-routes';
import styled from 'styled-components';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import { ISiteData } from './types';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const App: React.SFC<ISiteData> = ({ author, siteName, googleAnalytics }) => {
  const description = `${author}'s blog and project portfolio`;
  const addAnalytics = /node|production/i.test(process.env.REACT_STATIC_ENV);
  return (
    <div>
      <Head>
        <meta charSet="UTF-8" />
        <link rel="manifest" href="manifest.json" />
        <meta name="author" content={author} />
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/icon-512x512.png" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:title" content={siteName} />
        <meta property="og:type" content="website" />
        <title>{siteName}</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700"
          type="text/css"
        />
        {addAnalytics && (
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalytics}`}
          />
        )}
        {addAnalytics && (
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalytics}');
            `}
          </script>
        )}
      </Head>
      <Router>
        <Content>
          <Route
            path="/"
            render={({ location }) => {
              const gtag =
                typeof window !== 'undefined' && (window as any).gtag;
              if (addAnalytics && gtag) {
                gtag('config', googleAnalytics, {
                  page_path: location.pathname + location.search,
                });
              }
              return null;
            }}
          />
          <Navigation />
          <Routes />
          <Footer />
        </Content>
      </Router>
    </div>
  );
};

export default hot(module)(withSiteData(App));
