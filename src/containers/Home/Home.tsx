import React from 'react';
import { Head, withSiteData } from 'react-static';
import reedImg from '../../assets/images/reed.jpg';
import H1 from '../../components/H1';
import H2 from '../../components/H2';
import Section from '../../components/Section';
import { ISiteData } from '../../types';
import Img from './Img';
import Inner from './Inner';
import Meta from './Meta';

const Home: React.SFC<ISiteData> = ({ siteName }) => (
  <Section>
    <Head>
      <title>{siteName}</title>
    </Head>
    <Inner>
      <Img alt="Reed Dadoune" src={reedImg} />
      <Meta>
        <H1>Reed Dadoune</H1>
        <H2>Code Enthusiast</H2>
      </Meta>
    </Inner>
  </Section>
);

export default withSiteData(Home);
