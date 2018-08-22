import React from 'react';
import { Head } from 'react-static';
import H1 from '../../components/H1';
import H2 from '../../components/H2';
import Section from '../../components/Section';
import Inner from './Inner';

export default () => (
  <Section>
    <Head>
      <title>404 Not Found | dadoune.com</title>
    </Head>
    <Inner>
      <H1>404</H1>
      <H2>Sorry page cannot be found.</H2>
    </Inner>
  </Section>
);
