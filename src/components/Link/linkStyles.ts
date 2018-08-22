import { css } from 'styled-components';
import { colorGrey700, colorPrimary } from '../../style';
import { ILinkProps } from './interface';

export default css<ILinkProps>`
  text-decoration: none;
  color: rgb(${props => (props.muted ? colorGrey700 : colorPrimary)});
`;
