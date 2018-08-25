import { injectGlobal } from 'styled-components';
import styledNormalize from 'styled-normalize';
import fontelloEot from '../assets/fonts/fontello.eot';
import fontelloSvg from '../assets/fonts/fontello.svg';
import fontelloTtf from '../assets/fonts/fontello.ttf';
import fontelloWoff from '../assets/fonts/fontello.woff';
import fontelloWoff2 from '../assets/fonts/fontello.woff2';
import * as variables from './variables';
import { colorPrimary, preferredFont } from './variables';
// import * as typography from './typography';

injectGlobal`
  ${styledNormalize};
  *, *:before, *:after {
    box-sizing: inherit;
  }
  html, body {
    font-family: ${preferredFont};
    box-sizing: border-box;
    font-weight: 300;
    font-size: 1rem;
    margin: 0;
    padding: 0;
  }
  a {
    color: rgb(${colorPrimary});
    text-decoration: none;
  }
  @font-face {
    font-family: 'fontello';
    src: url('${fontelloEot}');
    src: url('${fontelloEot}') format('embedded-opentype'),
      url('${fontelloWoff}') format('woff'),
      url('${fontelloWoff2}') format('woff2'),
      url('${fontelloTtf}') format('truetype'),
      url('${fontelloSvg}') format('svg');
    font-weight: normal;
    font-style: normal;
  }
`;

const theme = { ...variables };

export * from './variables';
// export * from './mixins';
// export * from './utils';
// export * from './fonts';
export default theme;
