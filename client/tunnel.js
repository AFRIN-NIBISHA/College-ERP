
import localtunnel from 'localtunnel';

(async () => {
    try {
        const tunnel = await localtunnel({ port: 5173, subdomain: 'dmi-college-erp' });
        console.log('Tunnel URL:', tunnel.url);

        tunnel.on('close', () => {
            console.log('Tunnel closed');
        });

        // Keep alive?
        setInterval(() => {
            // Heartbeat or just keep process running
        }, 10000);

    } catch (err) {
        console.error('Tunnel error:', err);
    }
})();
