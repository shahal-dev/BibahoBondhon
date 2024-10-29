"use client";
import { useState, useEffect, useRef } from "react";
import UploadImage from "./Upload_Image";
import { useUpload } from '../../contexts/UploadContext';

function calculateAge(dob: string) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

export default function KYCsuccessPage({ entry }: { entry: any }) {
    const [isEligible, setIsEligible] = useState<boolean | null>(null);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const { uploadStatus } = useUpload();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const parsedEntry = entry;

    const dob1 = parsedEntry?.bride?.date_of_birth || '';
    const dob2 = parsedEntry?.groom?.date_of_birth || '';
    const age1 = dob1 ? calculateAge(dob1) : null;
    const age2 = dob2 ? calculateAge(dob2) : null;

    useEffect(() => {
        if (age1 !== null && age2 !== null) {
            setIsEligible(age1 > 18 && age2 > 21);
        }
    }, [age1, age2]);

    useEffect(() => {
        if (parsedEntry && isEligible) {
            generateImage(parsedEntry);
            generateFilename(parsedEntry);
        }
    }, [parsedEntry, isEligible]);

    function generateImage(parsedEntry: any) {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                canvas.width = 800;
                canvas.height = 600;

                // Background
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Text settings
                ctx.fillStyle = "black";
                ctx.font = "20px Arial";

                // Bride's Information
                ctx.fillText(`Bride Name: ${parsedEntry.bride.full_name}`, 50, 50);
                ctx.fillText(`Father's Name: ${parsedEntry.bride.father_name}`, 50, 100);
                ctx.fillText(`Mother's Name: ${parsedEntry.bride.mother_name}`, 50, 150);
                ctx.fillText(`DOB: ${parsedEntry.bride.date_of_birth}`, 50, 200);
                ctx.fillText(`Address: ${parsedEntry.bride.address.village_or_road}`, 50, 250);

                // Groom's Information
                ctx.fillText(`Groom Name: ${parsedEntry.groom.full_name}`, 50, 300);
                ctx.fillText(`Father's Name: ${parsedEntry.groom.father_name}`, 50, 350);
                ctx.fillText(`Mother's Name: ${parsedEntry.groom.mother_name}`, 50, 400);
                ctx.fillText(`DOB: ${parsedEntry.groom.date_of_birth}`, 50, 450);
                ctx.fillText(`Address: ${parsedEntry.groom.address.village_or_road}`, 50, 500);

                const imageUrl = canvas.toDataURL("image/png");
                setImageURL(imageUrl);
            }
        }
    }

    function generateFilename(parsedEntry: any) {
        const brideName = parsedEntry.bride.full_name.replace(/\s+/g, "_");
        const groomName = parsedEntry.groom.full_name.replace(/\s+/g, "_");
        const currentDate = new Date().toISOString().split('T')[0];
        const generatedFilename = `${brideName}_and_${groomName}_${currentDate}`;
        setFilename(generatedFilename);
    }

    const metadata = uploadStatus.includes('IPFS Hash - ') ? {
        name: `${parsedEntry?.bride?.full_name}_and_${parsedEntry?.groom?.full_name}`,
        description: 'NFT representing the KYC verification details for a marriage.',
        image: `ipfs://${uploadStatus.split('IPFS Hash - ')[1]}`,
        bride: {
            full_name: parsedEntry?.bride?.full_name,
            nid: parsedEntry?.bride?.nid
        },
        groom: {
            full_name: parsedEntry?.groom?.full_name,
            nid: parsedEntry?.groom?.nid
        },
        issued_on: new Date().toISOString().split('T')[0],
        additional_info: "This NFT represents a legal marriage certificate."
    } : null;

    return (
        <div>
            <h1>KYC Verification Details</h1>

            {isEligible !== null && (
                <div>
                    {/* Eligibility Status */}
                    <h2>Eligibility Status</h2>
                    <p>{isEligible ? "Eligible" : "Not Eligible"}</p>
                </div>
            )}

            {isEligible && (
                <div>
                    {/* Display the generated image */}
                    {imageURL && <img src={imageURL} alt="Generated KYC Verification" />}

                    {/* Display metadata */}
                    {metadata && (
                        <div>
                            <h2>NFT Metadata</h2>
                            <pre>{JSON.stringify(metadata, null, 2)}</pre>
                        </div>
                    )}

                    {/* Upload image to Pinata */}
                    {imageURL && <UploadImage imageURL={imageURL} filename={filename} />}

                    {/* Additional component to handle image link and metadata */}
                    {/* <AdditionalComponent imageURL={imageURL} metadata={metadata} /> */}
                </div>
            )}

            {!isEligible && isEligible !== null && (
                <div>
                    <h2>Eligibility Status</h2>
                    <p>Not Eligible: The age requirements are not met.</p>
                </div>
            )}
        </div>
    );
}
