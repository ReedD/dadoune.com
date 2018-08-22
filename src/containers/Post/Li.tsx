import styled from 'styled-components';

export default styled.li`
  border-left: solid 1px rgba(0, 0, 0, 0.1);
  display: inline-block;
  flex-basis: auto;
  flex-grow: 1;
  margin: 0.25rem 0;
  padding: 0 0.25rem;
  text-align: center;

  :first-child {
    border-left: none;
  }

  :not(:last-child) {
    margin-right: 0;
  }
`;
