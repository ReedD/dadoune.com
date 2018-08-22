import styled from 'styled-components';
import { colorGrey200, colorPrimary, menuBreakWidth } from '../../style';

export default styled.li`
  background: rgb(${colorPrimary});
  border: 1px solid rgb(${colorGrey200});
  border-width: 0 45px;
  height: 2px;
  left: 0;
  margin-top: -2px;
  pointer-events: none;
  position: absolute;
  top: 100%;
  transition: transform 0.5s;
  transition-timing-function: cubic-bezier(1, 0.01, 0, 1.22);
  width: 120px;

  @media (max-width: ${menuBreakWidth}) {
    border: 0;
    left: 0;
    margin: auto;
    margin-left: auto;
    margin-right: auto;
    position: absolute;
    right: 0;
    top: 48px;
    width: 30px;
  }
`;
