// make sure react-hot-loader is required before react and react-dom
// eslint-disable-next-line import/order
import { hot } from 'react-hot-loader/root';

import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { StylesProvider, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { store } from '@/redux';
import AppRouter from '@/routes';
import { getTheme } from '@/themes';

const App = () => {
    const { theme, GlobalStyle } = getTheme('light');

    return (
      <Provider store={store}>
        <BrowserRouter>
          <StylesProvider injectFirst>
            <MuiThemeProvider theme={theme}>
              <ThemeProvider theme={theme}>
                <GlobalStyle />
                <CssBaseline />
                <AppRouter />
              </ThemeProvider>
            </MuiThemeProvider>
          </StylesProvider>
        </BrowserRouter>
      </Provider>
    );
};

export default hot(App);