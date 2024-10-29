"use client"
import { useState } from 'react';
import { useUpload } from '../contexts/UploadContext';

const UploadImage = ({ imageURL, filename }) => {
    const { uploadStatus, setUploadStatus } = useUpload();

    const handleUpload = async () => {
        if (!imageURL || !filename) {
            setUploadStatus('No image or filename provided.');
            return;
        }

        const blob = await fetch(imageURL).then(res => res.blob());
        const file = new File([blob], `${filename}.png`, { type: "image/png" });

        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
        const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;

        let formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${jwt}`
                },
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                setUploadStatus(`File uploaded successfully: IPFS Hash - ${result.IpfsHash}`);
            } else {
                setUploadStatus(`Error uploading file: ${result.message}`);
            }
        } catch (error) {
            setUploadStatus(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <button
                onClick={handleUpload}
                className="mt-10 pd-5 border border-neutral-800 bg-gradient-to-br relative group/btn from-black dark:from-zinc dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            >
                Upload to Pinata
            </button>
            {uploadStatus && <p>{uploadStatus}</p>}
        </div>
    );
};

export default UploadImage;
