import React from 'react';
import Li from './Li';
import Nav from './Nav';
import NavInner from './NavInner';
import Ul from './Ul';
import Link from './Link';
import Underline from './Underline';
import { withRouter } from 'react-static';

export default withRouter(props => {
  return (
    <Nav>
      <NavInner>
        <Ul>
          <Li active={props.location.pathname === '/'}>
            <Link exact to="/">
              Me
            </Link>
          </Li>
          <Li active={props.location.pathname === '/projects'}>
            <Link to="/projects">Projects</Link>
          </Li>
          <Li active={/blog/.test(props.location.pathname)}>
            <Link to="/blog">Blog</Link>
          </Li>
          <Underline />
        </Ul>
      </NavInner>
    </Nav>
  );
});
