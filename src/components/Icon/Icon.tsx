import styled from 'styled-components';

const Icon = styled.i`
  &:before {
    display: inline-block;
    font-family: 'fontello';
    font-style: normal;
    font-variant: normal;
    font-weight: normal;
    line-height: 1em;
    margin-left: 0.2em;
    margin-right: 0.2em;
    speak: none;
    text-align: center;
    text-decoration: inherit;
    text-transform: none;
    width: 1em;
  }
`;

export const StarIcon = Icon.extend`
  &:before {
    content: '\\e801';
  }
`;

export const GitHubIcon = Icon.extend`
  &:before {
    content: '\f09b';
  }
`;

export const MailIcon = Icon.extend`
  &:before {
    content: '\f0e0';
  }
`;

export const LinkedInIcon = Icon.extend`
  &:before {
    content: '\f0e1';
  }
`;

export const ForkIcon = Icon.extend`
  &:before {
    content: '\f126';
  }
`;

export const StackOverflowIcon = Icon.extend`
  &:before {
    content: '\f16c';
  }
`;
