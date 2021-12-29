import dark from '@/themes/dark';

const lightTheme = {
  ...dark,

  name: 'light',
  palette: {
    type: 'light',
    background: {
      default: '#fff',
      paper: '#ccc',
      sidebarItemActive: '#fff',
    },
  },
};

export default lightTheme;
