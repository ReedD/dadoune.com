import styled from 'styled-components';

export interface IDotProps {
  color: string;
}

const Dot = styled.div<IDotProps>`
  background-color: ${props => props.color};
  border-radius: 50%;
  display: inline-block;
  height: 0.85rem;
  position: relative;
  top: 1px;
  width: 0.85rem;
`;
export default Dot;
