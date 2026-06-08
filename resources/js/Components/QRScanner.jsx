import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner() {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: 250,
            },
            false
        );

        scanner.render(
            (decodedText) => {
                console.log("QR Result:", decodedText);

                // Stop scanner after successful scan
                scanner.clear();
            },
            (error) => {
                // Ignore scan errors
            }
        );

        return () => {
            scanner.clear().catch(() => {});
        };
    }, []);

    return <div id="reader"></div>;
}