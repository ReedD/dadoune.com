import React from 'react';
import { Head, withSiteData } from 'react-static';
import reedImg from '../../assets/reed.jpg';
import H1 from '../../components/H1';
import H2 from '../../components/H2';
import Section from '../../components/Section';
import Img from './Img';
import Inner from './Inner';
import Meta from './Meta';

export default withSiteData(() => (
  <Section>
    <Head>
      <title>Reed Dadoune | dadoune.com</title>
    </Head>
    <Inner>
      <Img alt="Reed Dadoune" src={reedImg} />
      <Meta>
        <H1>Reed Dadoune</H1>
        <H2>Code Enthusiast</H2>
      </Meta>
    </Inner>
  </Section>
));
