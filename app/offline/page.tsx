/* Shown by the service worker when a navigation fails because the device is
   offline. Static so it can be precached. Inline styles only — it must render
   without the app's stylesheets being available. */
export const metadata = { title: 'Offline — Finance' };

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        textAlign: 'center',
        background: '#101010',
        color: '#f4f2ec',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: '#1f9d57',
          marginBottom: 4,
        }}
      />
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>You&rsquo;re offline</h1>
      <p style={{ color: '#8f8c84', maxWidth: 320, margin: 0, fontSize: 15 }}>
        Finance needs a connection to load your latest balances and transactions.
        Reconnect and try again.
      </p>
    </main>
  );
}
