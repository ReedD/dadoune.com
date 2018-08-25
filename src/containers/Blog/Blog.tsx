import React from 'react';
import { Head, withRouteData, withSiteData } from 'react-static';
import H1 from '../../components/H1';
import H2 from '../../components/H2';
import Link from '../../components/Link';
import Section from '../../components/Section';
import toDateString from '../../lib/toDateString';
import { IBlog, ISiteData } from '../../types';
import Li from './Li';
import Time from './Time';
import Ul from './Ul';

interface IBlogsProps extends ISiteData {
  blogs: IBlog[];
}

const Blog: React.SFC<IBlogsProps> = ({ blogs, siteName }) => (
  <Section>
    <Head>
      <title>Blogs | {siteName}</title>
    </Head>
    <Ul>
      {blogs.map(blog => {
        return (
          <Li key={blog.slug}>
            <div>
              <H1>
                <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
              </H1>
              <H2>{blog.subTitle}</H2>
            </div>
            <Time>{toDateString(blog.publishedAt)}</Time>
          </Li>
        );
      })}
    </Ul>
  </Section>
);

export default withSiteData(withRouteData(Blog));
