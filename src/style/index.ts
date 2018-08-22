import { injectGlobal } from 'styled-components';
import styledNormalize from 'styled-normalize';
import { performanceFont, preferredFont } from './variables';
import * as variables from './variables';
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
  @font-face {
    font-family: 'fontello';
    src: url('/fonts/fontello.eot');
    src: url('/fonts/fontello.eot') format('embedded-opentype'),
      url('/fonts/fontello.woff') format('woff'),
      url('/fonts/fontello.woff2') format('woff2'),
      url('/fonts/fontello.ttf') format('truetype'),
      url('/fonts/fontello.svg') format('svg');
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
