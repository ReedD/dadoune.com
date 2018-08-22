import styled from 'styled-components';
import { menuBreakWidth } from '../../style';

export default styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;

  @media (max-width: ${menuBreakWidth}) {
    display: block;
    margin: 0 auto;
  }
`;
