import React from 'react';
import { Head, withSiteData } from 'react-static';
import H1 from '../../components/H1';
import H2 from '../../components/H2';
import Section from '../../components/Section';
import { ISiteData } from '../../types';
import Inner from './Inner';

const NotFound: React.SFC<ISiteData> = ({ siteName }) => (
  <Section>
    <Head>
      <title>404 Not Found | {siteName}</title>
    </Head>
    <Inner>
      <H1>404</H1>
      <H2>Sorry page cannot be found.</H2>
    </Inner>
  </Section>
);

export default withSiteData(NotFound);
