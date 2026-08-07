import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onScan }) {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 320, height: 320 }
            },
            false
        );
        
        scanner.render(
            (decodedText) => {
                scanner.clear();

                // Send the scanned value to the parent
                onScan(decodedText);

                // Stop scanner after successful scan
                // scanner.clear();
            },
            () => {
                // Ignore scan errors
            }
        );

        return () => {
            scanner.clear().catch(() => {});
        };
    }, []);

    return <div id="reader"></div>;
}