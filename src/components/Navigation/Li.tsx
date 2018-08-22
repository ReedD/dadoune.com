import styled, { css } from 'styled-components';
import { colorPrimary, menuBreakWidth } from '../../style';
import NavLink from './Link';
import Underline from './Underline';

export interface ILiProps {
  active?: boolean;
}

export default styled.li<ILiProps>`
  display: block;
  margin: 0;

  ${props =>
    props.active &&
    css`
      ${NavLink} {
        color: rgb(${colorPrimary});
        transition: color 0.5s;
      }

      &:nth-child(1) ~ ${Underline} {
        transform: translate3d(0, 0, 0);

        @media (max-width: ${menuBreakWidth}) {
          transform: translate3d(0, 0, 0);
        }
      }

      &:nth-child(2) ~ ${Underline} {
        transform: translate3d(100%, 0, 0);

        @media (max-width: ${menuBreakWidth}) {
          transform: translate3d(0, 3rem, 0);
        }
      }

      &:nth-child(3) ~ ${Underline} {
        transform: translate3d(200%, 0, 0);

        @media (max-width: ${menuBreakWidth}) {
          transform: translate3d(0, 6rem, 0);
        }
      }

      &:nth-child(4) ~ ${Underline} {
        transform: translate3d(300%, 0, 0);

        @media (max-width: ${menuBreakWidth}) {
          transform: translate3d(0, 9rem, 0);
        }
      }

      &:nth-child(5) ~ ${Underline} {
        transform: translate3d(400%, 0, 0);

        @media (max-width: ${menuBreakWidth}) {
          transform: translate3d(0, 12rem, 0);
        }
      }
    `};
`;

