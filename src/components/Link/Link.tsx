import styled from 'styled-components';
import { Link as StaticLink } from 'react-static';
import linkStyles from './linkStyles';

export const Link = styled(StaticLink)`
  ${linkStyles};
`;

export default Link;
