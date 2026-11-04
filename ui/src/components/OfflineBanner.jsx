// ui/src/components/OfflineBanner.jsx
export default function OfflineBanner({ offline }) {
  if (!offline) return null;
  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#b91c1c',
        color: '#fff',
        padding: '10px 16px',
        textAlign: 'center',
        fontSize: 14,
        zIndex: 9999,
      }}
    >
      Live updates disconnected. Data may be stale until the connection recovers.
    </div>
  );
}