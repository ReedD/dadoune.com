import React from 'react';
import { Head, withRouteData } from 'react-static';
import H1 from '../../components/H1';
import H2 from '../../components/H2';
import { ForkIcon, StarIcon } from '../../components/Icon';
import { A } from '../../components/Link';
import Section from '../../components/Section';
import toDateString from '../../lib/toDateString';
import { IRepo } from '../../types';
import Dot from './Dot';
import Li from './Li';
import Meta from './Meta';
import Ul from './Ul';

interface IProps {
  repos: IRepo[];
}

export default withRouteData(({ repos }: IProps) => {
  return (
    <Section>
      <Head>
        <title>Projects | dadoune.com</title>
      </Head>
      <Ul>
        {repos.map(repo => {
          return (
            <Li key={repo.name}>
              <H1>
                <A href={repo.html_url}>{repo.name}</A>
              </H1>
              <H2>{repo.description}</H2>
              <Meta>
                <span>
                  <Dot color={repo.language_color} /> {repo.language}
                </span>
                <A muted={true} href={`${repo.html_url}/stargazers`}>
                  <StarIcon /> {repo.stargazers_count}
                </A>
                <A muted={true} href={`${repo.html_url}/network`}>
                  <ForkIcon /> {repo.forks_count}
                </A>
                <time>Updated {toDateString(repo.pushed_at)}</time>
              </Meta>
            </Li>
          );
        })}
      </Ul>
    </Section>
  );
});
