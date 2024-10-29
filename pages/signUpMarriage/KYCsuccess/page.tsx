// pages/KYCsuccessPage.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import UploadImage from "../../../components/Upload_Image";
import { useUpload } from '../../../contexts/UploadContext';
import Cnft from "../../../components/Cnft";
import { AuroraBackground } from "../../../components/ui/aurora-background";
import Footer from "../../../components/bibaho-bondhon/Footer";

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

export default function KYCsuccessPage() {
  const [data, setData] = useState<any>(null);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const { uploadStatus } = useUpload();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/kyc-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      const dob1 = data.bride.date_of_birth || '';
      const dob2 = data.groom.date_of_birth || '';
      const age1 = dob1 ? calculateAge(dob1) : null;
      const age2 = dob2 ? calculateAge(dob2) : null;

      if (age1 !== null && age2 !== null) {
        const eligibility = age1 > 18 && age2 > 21;
        setIsEligible(eligibility);

        // Only generate the image and filename if eligible
        if (eligibility) {
          generateImage(data);
          generateFilename(data);
        }
      }
    }
  }, [data]);

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

        const dataURL = canvas.toDataURL("image/png");
        setImageURL(dataURL);
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

  // Convert IPFS hash to a gateway URL (e.g., using ipfs.io)
  const convertIpfsToGateway = (ipfsUrl: string): string => {
    if (ipfsUrl.startsWith("ipfs://")) {
      const hash = ipfsUrl.replace("ipfs://", "");
      return `https://lime-big-lobster-362.mypinata.cloud/ipfs/${hash}`;
    }
    return ipfsUrl;
  };

  const metadata = uploadStatus.includes('IPFS Hash - ') && isEligible ? {
    name: `${data?.bride?.full_name}_and_${data?.groom?.full_name}`,
    symbol: 'MARRIAGE',
    description: 'NFT representing the contract details for a marriage.',
    image: convertIpfsToGateway(uploadStatus.split('IPFS Hash - ')[1]),
    attributes: [
      {
        trait_type: "Bride's Name",
        value: data?.bride?.full_name || "",
      },
      {
        trait_type: "Groom's Name",
        value: data?.groom?.full_name || ""
      },
      {
        trait_type: "Bride's NID",
        value: data?.bride?.nid || "",
      },
      {
        trait_type: "Groom's NID",
        value: data?.groom?.nid || ""
      },
      {
        trait_type: "Date",
        value: new Date().toString() || ""
      },
      // Add more attributes as needed
    ],
    bride: {
      full_name: data?.bride?.full_name,
      nid: data?.bride?.nid
    },
    groom: {
      full_name: data?.groom?.full_name,
      nid: data?.groom?.nid
    },
    issued_on: new Date().toISOString().split('T')[0],
    additional_info: "This NFT represents a legal marriage certificate."
  } : null;

  return (
    <div className="bg-slate-900 min-h-screen text-white">
      <AuroraBackground>
        <h1 className="text-3xl font-bold mb-6">KYC Verification Details</h1>
        {data && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">Bride's Information</h2>
            <p>Name: {data.bride.full_name}</p>
            <p>NID: {data.bride.nid}</p>

            <h2 className="text-2xl font-semibold mt-6">Groom's Information</h2>
            <p>Name: {data.groom.full_name}</p>
            <p>NID: {data.groom.nid}</p>
          </div>
        )}
        {/* Eligibility Status */}
        {isEligible !== null && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold">Eligibility Status</h2>
            <p className={`mt-2 ${isEligible ? 'text-green-400' : 'text-red-400'}`}>
              {isEligible ? "Eligible" : "Not Eligible"}
            </p>
          </div>
        )}

        {/* Hidden canvas element for drawing the image */}
        {isEligible && (
          <>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

            {/* Image preview */}
            {imageURL && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">Generated KYC Verification Image</h2>
                <img src={imageURL} alt="Generated KYC Verification" className="w-96 h-auto rounded-lg border-2 border-gray-500" />
              </div>
            )}

            {/* Upload image to Pinata */}
            {imageURL && <UploadImage imageURL={imageURL} filename={filename} />}
          </>
        )}

        {/* Conditionally render Cnft only when metadata is available */}
        {metadata && (
          <div className="mt-8">
            <Cnft imageURL={metadata.image} metadata={metadata} />

            {/* Display metadata */}
            <div className="mt-4">
              <h2 className="text-2xl font-semibold">NFT Metadata</h2>
              <pre className="bg-gray-700 p-4 rounded-lg mt-2">{JSON.stringify(metadata, null, 2)}</pre>
            </div>
          </div>
        )}

      </AuroraBackground>
      <Footer />
    </div>
  );
}
