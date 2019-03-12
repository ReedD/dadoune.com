import React from 'react';
import { GitHubIcon, LinkedInIcon, MailIcon, StackOverflowIcon } from '../Icon';
import A from './A';
import Copyright from './Copyright';
import Foot from './Foot';
import Li from './Li';
import SourceLink from './SourceLink';
import Ul from './Ul';

export default () => {
  const socialNetworks = [
    {
      href: 'https://github.com/reedd',
      title: 'Github',
      Icon: GitHubIcon,
    },
    {
      href: 'http://stackoverflow.com/users/3322075/reedd',
      title: 'Stack Overflow',
      Icon: StackOverflowIcon,
    },
    {
      href: 'https://www.linkedin.com/in/reed-dadoune-a3604a91',
      title: 'LinkedIn',
      Icon: LinkedInIcon,
    },
    {
      href: 'mailto:reed@dadoune.com',
      title: 'Email',
      Icon: MailIcon,
    },
  ];
  return (
    <Foot>
      <Ul>
        {socialNetworks.map(({ title, href, Icon }) => (
          <Li key={title} className="list-inline-item mx-3">
            <A title={title} href={href}>
              <Icon />
            </A>
          </Li>
        ))}
      </Ul>
      <SourceLink href="https://github.com/ReedD/dadoune.com">
        This site is open source on GitHub!
      </SourceLink>
      <Copyright>&copy; 2012-2019 Reed Dadoune</Copyright>
    </Foot>
  );
};
