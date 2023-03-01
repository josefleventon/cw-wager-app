import React, { FunctionComponent } from 'react';
import Head from 'next/head';

interface IMeta {
  description: string;
  image: string;
  ogImage: string;
  title: string;
  url: string;
}

const Meta: FunctionComponent<IMeta> = ({
  description,
  image,
  ogImage,
  title,
  url,
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} key="title" />
      <meta name="description" content={description} key="description" />

      <meta property="og:type" content="website" key="og:type" />
      <meta property="og:url" content={url} key="og:url" />
      <meta property="og:title" content={title} key="og:title" />
      <meta
        property="og:description"
        content={description}
        key="og:description"
      />
      <meta property="og:image" content={ogImage} key="og:image" />

      <meta
        property="twitter:card"
        content="summary_large_image"
        key="twitter:card"
      />
      <meta property="twitter:url" content={url} key="twitter:url" />
      <meta property="twitter:title" content={title} key="twitter:title" />
      <meta
        property="twitter:description"
        content={description}
        key="twitter:description"
      />
      <meta property="twitter:image" content={image} key="twitter:image" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#4241fb" />
      <meta name="msapplication-TileColor" content="#4241fb" />
      <meta name="theme-color" content="#4241fb" />
    </Head>
  );
};

export default Meta;
