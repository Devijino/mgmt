import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProjectProvider } from '@/context/ProjectContext';
import Layout from '@/components/layout/Layout';

// Create a client for react-query
const queryClient = new QueryClient();

// Extend the Chakra UI theme
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  colors: {
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <ThemeProvider>
          <ProjectProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ProjectProvider>
        </ThemeProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
} 