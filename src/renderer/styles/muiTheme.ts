import { createTheme } from '@mui/material/styles';

export default createTheme({
    palette: {
        primary: {
            main: '#123262',
        },
        secondary: {
            main: '#2c7df7',
        },
        error: {
            main: '#ea776c',
        },
    },
    components: {
        MuiInput: {
            styleOverrides: {
                underline: {
                    '&:hover:not(.Mui-disabled):before': {
                        borderBottomColor: '#5395f8',
                    },
                    '&:after': {
                        borderBottomColor: '#5395f8',
                    },
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    textTransform: 'capitalize',
                    fontSize: '16px',
                    fontWeight: 300,
                    '&$disabled': {
                        color: '#fff',
                        backgroundColor: '#2c7df7',
                        opacity: 0.5,
                    },
                },
                secondary: {
                    '&:hover': {
                        backgroundColor: '#5395f8',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'capitalize',
                    fontSize: '16px',
                    fontWeight: 300,
                },
                outlined: {
                    fontSize: '16px',
                },
                outlinedSecondary: {
                    color: '#7691c4',
                    border: '2px solid #7691c4',
                    '&:hover': {
                        border: '2px solid #bdcae3',
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
    },
});
