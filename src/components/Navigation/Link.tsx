import { Link } from 'react-static';
import styled from 'styled-components';
import { colorGrey900, colorGrey800 } from '../../style';

export default styled(Link)`
  color: rgb(${colorGrey900});
  cursor: pointer;
  display: block;
  font-size: 1rem;
  font-weight: bold;
  height: 48px;
  padding: 1rem;
  text-align: center;
  text-decoration: none;
  transition: color 0.3s;
  user-select: none;
  width: 120px;

  &:hover,
  &:focus {
    color: rgb(${colorGrey800});
    outline: none;
    text-decoration: none;
  }
`;
