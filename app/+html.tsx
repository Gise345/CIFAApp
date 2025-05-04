import { ScrollViewStyleReset } from 'expo-router/html';

// This file controls the HTML used by Expo Router in the web build.
// It's used to customize the HTML that wraps your app.

// The default export is a function that returns an HTML string.
// It's used to wrap your app when it's rendered in a web browser.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ScrollViewStyleReset />
        <title>CIFA Mobile App</title>
      </head>
      <body>
        {/* The children prop contains the page content that will be rendered in the browser */}
        {children}
      </body>
    </html>
  );
}