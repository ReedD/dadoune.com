import styled from 'styled-components';
import { colorGrey700 } from '../../style';

export default styled.div`
  color: rgb(${colorGrey700});
  font-size: 0.85rem;
  margin: 0.5rem 0 0;

  & > * {
    margin-right: 1rem;
  }
`;
