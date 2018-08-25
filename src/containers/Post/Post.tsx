import React from 'react';
import { Head, withRouteData, withSiteData } from 'react-static';
import H1 from '../../components/H1';
import H2 from '../../components/H2';
import Link from '../../components/Link';
import Section from '../../components/Section';
import slugTag from '../../lib/slugTag';
import toDateString from '../../lib/toDateString';
import { IBlog, ISiteData } from '../../types';
import Article from './Article';
import './highlight';
import Li from './Li';
import Ul from './Ul';

interface IPostProps extends ISiteData {
  blog: IBlog;
}

const Post: React.SFC<IPostProps> = ({ blog, siteName }) => (
  <Section>
    <Head>
      <title>
        {blog.title} | {siteName}
      </title>
    </Head>
    <Article>
      <H1>{blog.title}</H1>
      <H2>{blog.subTitle}</H2>
      <time>{toDateString(blog.publishedAt)}</time>
      <Ul>
        {blog.tags.map(tag => (
          <Li key={tag}>
            <Link to={`/blog/tag/${slugTag(tag)}`}>{tag}</Link>
          </Li>
        ))}
      </Ul>
      <div dangerouslySetInnerHTML={{ __html: blog.body }} />
    </Article>
  </Section>
);

export default withSiteData(withRouteData(Post));
