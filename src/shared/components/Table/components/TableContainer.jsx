import styled from 'styled-components';

export default styled.div `
  .rt-thead.-header {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 2.625em;
    font-weight: bold;
    background: #C7C7C9;
    user-select: none;
    
    .rt-resizable-header {
      padding: 0 0.563em;
      justify-self: flex-start;

      .MuiCheckbox-root {
        margin-left: 0.235em;
      }
      
      &.sortable {
        .rt-resizable-header-content::after {
          content: '\\2013';
        }
        .rt-resizable-header-content:not(:empty)::after {
          padding-left: 0.563em;
        }
      }

      &.-sort-asc {
        .rt-resizable-header-content::after {
          content: '\\2191';
        }
        .rt-resizable-header-content:not(:empty)::after {
          padding-left: 0.563em;
        }
      }
      
      &.-sort-desc {
        .rt-resizable-header-content::after {
          content: '\\2193';
        }
        .rt-resizable-header-content:not(:empty)::after {
          padding-left: 0.563em;
        }
      }    
    }
  }
  
  .rt-thead.-filters * {
    box-sizing: border-box;
    overflow: hidden;
  }
  
  .rt-tbody {
    display: flex;
    flex-direction: column;
    position: relative;
    min-height: 2.625em;
    .rt-tr-group {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;
      
      >.rt-tr {
        min-height: 3.375em;
      }
      
      :nth-of-type(odd) {
        background: white;
      }
      :nth-of-type(even) {
        background: #F1F1F1;        
      }
      :only-child {
        margin: auto 0;
      }
    }
    .rt-td {
      display: flex;
      align-items: center;
      padding: 0 0.563em;
      justify-self: flex-start;

      .MuiCheckbox-root {
        margin-left: 0.235em;
      }
    }
  }

  .rt-tfoot.-footer {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 2.625em;
    font-weight: bold;
    background: #C7C7C9;
    user-select: none;

    .rt-resizable-footer {
      padding: 0 0.563em;
      justify-self: flex-start;
    }
  }
  
  .rt-noData {
    position: absolute;
    top: 50%;
    left: 50%;
    white-space: nowrap;
    transform: translate(-50%, -50%);
    padding: 1.250em;
  }
`;
