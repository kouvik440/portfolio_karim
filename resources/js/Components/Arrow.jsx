export default function Arrow({ diagonal = false, down = false }) {
    const path = down ? 'M12 4v15m-6-6 6 6 6-6' : diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6';
    return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
