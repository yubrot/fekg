import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../client/styles/globals.css';
import { FeedbackListProvider } from '../client/hooks/feedback-list';
import { FirebaseProvider } from '../client/hooks/infrastructure/firebase';
import { AccountProvider } from '../client/hooks/account';
import TitleBar from '../client/components/TitleBar';
import Footer from '../client/components/Footer';
import FeedbackOverlay from '../client/components/FeedbackOverlay';
import Notification from '../client/components/Notification';
import Progress from '../client/components/Progress';

export default function App({ Component, pageProps }: AppProps): React.ReactElement {
  return (
    <FeedbackListProvider
      progress={() => <Progress />}
      notify={(severity, message, resolve) => (
        <Notification severity={severity} message={message} resolve={resolve} />
      )}
    >
      <FirebaseProvider>
        <AccountProvider>
          <Head>
            <title>FEKG</title>
          </Head>
          <div className="absolute inset-0 flex flex-col">
            <TitleBar />
            <FeedbackOverlay />
            <div className="flex-grow">
              <Component {...pageProps} />
            </div>
            <Footer />
          </div>
        </AccountProvider>
      </FirebaseProvider>
    </FeedbackListProvider>
  );
}
