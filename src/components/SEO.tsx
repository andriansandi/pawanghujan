// src/components/SEO.tsx
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string;
  gaId: string;
}

export const SEO: React.FC<SEOProps> = ({ title, gaId }) => {
  const isProd = import.meta.env.PROD; // Vite otomatis set ini

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content="Cek cuaca dengan gaya anak senja yang puitis." />
      
      {/* Hanya render GA script jika di production */}
      {isProd && gaId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
          <script>{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}</script>
        </>
      )}
    </Helmet>
  );
}