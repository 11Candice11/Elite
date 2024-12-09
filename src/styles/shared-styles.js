import { css } from 'lit';

export const sharedStyles = css`
  :host {
    font-family: Arial, sans-serif;
  }
  body {
    font-family: Arial, sans-serif;
  }
    /* Buttons and hover effects */
    .my-button {
      padding: 10px 20px;
      background-color: #5e3c87;
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 12px;
    }

    .my-button:hover {
    background-color: #4e2f6f;
    }
  .profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .back-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    margin-right: 10px;
  }
  h3{
    margin: 0px;
    // margin-right: 20px;
  }
  h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 20px;
  }
  .header {
    height: 50px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
`;
