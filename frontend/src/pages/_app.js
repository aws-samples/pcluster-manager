// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.
import Head from 'next/head';
import Script from 'next/script'
import { useCallback } from 'react'
import dynamic from 'next/dynamic';
import "@awsui/global-styles/index.css";
import './App.css';
import './index.css';

import { QueryClient, QueryClientProvider } from 'react-query'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { I18nextProvider } from 'react-i18next';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';

import i18n from '../i18n';
import { store } from '../store';

const queryClient = new QueryClient();

const theme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontSize: "14px",
                }
            }
        }
    },
    palette: {
        primary: {
            main: "rgb(236, 114, 17)",
        },
        default: {
            contrastText: '#fff',
            main: "rgb(84, 91, 100)"
        },
        dark: {
            main: "rgb(35, 47, 62)",
            contrastText: '#fff',
        },
    },
    shape: {
        borderRadius: "1px"
    },
    typography: {
        fontSize: 20,
        button: {
            fontWeight: "700",
            textTransform: "None"
        }
    }
});

/**
 * Disable SSR
 * 
 * This is only here because as of yet we are not
 * relying on NextJS routing and react-router-dom
 * does not play well with SSR.
 * 
 * While doing the transition to NextJS routing,
 * we need a way to support both ways of functioning.
 * 
 * Please note, this is only useful in the context of
 * local development (`npm run dev`), as this app is
 * currently being built as a static export,
 * thus SSR is not relevant.
 */
function SafeHydrate({ children }) {
    // return children
    return (
        <div suppressHydrationWarning>
            {typeof window === 'undefined' ? null : children}
        </div>
    )
}

function App({ Component, pageProps }) {
    const onAceLoad = useCallback(() => {
        window.editor = window.ace.edit('editor')
        window.ace.config.set('basePath', 'https://pagecdn.io/lib/ace/1.4.13/')
        window.ace.config.set('loadWorkerFromBlob', false);
        window.ace.config.set('showFoldWidgets', false);
        window.ace.config.set('showPrintMargin', false);
    }, [])


    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Pcluster Manager</title>
            </Head>
            <SafeHydrate>
                <QueryClientProvider client={queryClient}>
                    <I18nextProvider i18n={i18n}>
                        <Provider store={store}>
                            <ThemeProvider theme={theme}>
                                <SnackbarProvider>
                                    <Component {...pageProps} />
                                </SnackbarProvider>
                            </ThemeProvider>
                        </Provider>
                    </I18nextProvider>
                </QueryClientProvider>
                <div id="editor"></div>
                <Script
                    src="https://pagecdn.io/lib/ace/1.4.13/ace.min.js"
                    crossOrigin="anonymous"
                    integrity="sha256-GjtAsBCI/KPlEYQf0I8yNimcThRoWMnk7Vpi+dUt+GY="
                    onLoad={onAceLoad}
                />
            </SafeHydrate>
        </>
    )
}

export default dynamic(() => Promise.resolve(App), {
    ssr: false
});